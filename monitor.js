'use strict';

const process = require('process');
const { execFile,exec } = require('child_process');
const { createPool } = require('mysql2/promise');
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const moment = require('moment');
require('dotenv').config();

const logDir = process.env.LOG_DIR;
const { combine, timestamp, printf } = winston.format;

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        printf(info=>`${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        // info 레벨 로그를 저장할 파일 설정
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 30,  // 30일치 로그 파일 저장
            zippedArchive: true, 
        }),
        // error 레벨 로그를 저장할 파일 설정
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',  // error.log 파일은 /logs/error 하위에 저장 
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
    ]
});

const intervalSecond = process.env.INTERVAL*1000;

// const conn = (function() {
//     const pool = createPool({
//         host:process.env.DB_HOST,
//         post: process.env.DB_PORT,
//         user:process.env.DB_USER,
//         password:process.env.DB_PASSWORD,
//         database:process.env.DB_NAME,
//         connectionLimit: 5
//     });
//     return pool.getConnection(async conn => conn);
// })();

//만약 시간을 직접 입력해야 할 일이 있다면 쓸 형식
//const time = new Date(system.time().current);
//console.log(time.getFullYear(),("0"+time.getMonth()).slice(-2),("0"+time.getDate()).slice(-2),("0"+time.getHours()).slice(-2),("0"+time.getMinutes()).slice(-2),("0"+time.getSeconds()).slice(-2))

// const query = `
// INSERT INTO system(
//     system_time,
//     uptime,
//     users,
//     load_average_1m,
//     load_average_5m,
//     load_average_15m,
//     tasks_total,
//     tasks_running,
//     tasks_sleeping,
//     tasks_stopped,
//     tasks_zombie,
//     cpu_temperature,
//     cpu0_us,
//     cpu0_sy,
//     cpu0_ni,
//     cpu0_id,
//     cpu0_wa,
//     cpu0_hi,
//     cpu0_si,
//     cpu0_st,
//     cpu1_us,
//     cpu1_sy,
//     cpu1_ni,
//     cpu1_id,
//     cpu1_wa,
//     cpu1_hi,
//     cpu1_si,
//     cpu1_st,
//     cpu2_us,
//     cpu2_sy,
//     cpu2_ni,
//     cpu2_id,
//     cpu2_wa,
//     cpu2_hi,
//     cpu2_si,
//     cpu2_st,
//     cpu3_us,
//     cpu3_sy,
//     cpu3_ni,
//     cpu3_id,
//     cpu3_wa,
//     cpu3_hi,
//     cpu3_si,
//     cpu3_st,
//     mem_total,
//     mem_free,
//     mem_used,
//     mem_buffcache,
//     swap_total,
//     swap_free,
//     swap_used,
//     swap_avail_mem
//     )
//     VALUES(
//         ?,
//         ?,?,?,?,?,
//         ?,?,?,?,?,
//         ?,
//         ?,?,?,?,?,?,?,?,
//         ?,?,?,?,?,?,?,?,
//         ?,?,?,?,?,?,?,?,
//         ?,?,?,?,?,?,?,?,
//         ?,?,?,?,
//         ?,?,?,?
//     )
// `;
const summaryAreaReg = /^(top|Tasks|%Cpu0|%Cpu1|%Cpu2|%Cpu3|MiB\sMem|MiB\sSwap)/;
const systemTimeReg = /top\s*-\s*(\d{1,2}:\d{1,2}:\d{1,2})\s*up\s*(\d+)\s*(min|mins|hour|hours|day|days|year|years),\s*(\d+:\d+,)?\s*(\d+)\s*users,\s*load\s*average:\s*([0-9]*[.]?[0-9]+),\s*([0-9]*[.]?[0-9]+),\s*([0-9]*[.]?[0-9]+)/;
const taskReg = /Tasks\s*:\s*(\d+)\s*total,\s*(\d+)\s*running,\s*(\d+)\s*sleeping,\s*(\d+)\s*stopped,\s*(\d+)\s*zombie/;
const cpuReg = /%Cpu\d\s*:\s*([0-9]*[.]?[0-9]+)\sus,\s*([0-9]*[.]?[0-9]+)\ssy,\s*([0-9]*[.]?[0-9]+)\sni,\s*([0-9]*[.]?[0-9]+)\s*id,\s*([0-9]*[.]?[0-9]+)\s*wa,\s*([0-9]*[.]?[0-9]+)\s*hi,\s+([0-9]*[.]?[0-9]+)\s*si,\s*([0-9]*[.]?[0-9]+)\s*st/;
const memReg = /MiB\sMem\s*:\s*([0-9]*[.]?[0-9]+)\s*total,\s*([0-9]*[.]?[0-9]+)\s*free,\s*([0-9]*[.]?[0-9]+)\s*used,\s*([0-9]*[.]?[0-9]+)\s*buff\/cache/;
const swapReg = /MiB\sSwap\s*:\s*([0-9]*[.]?[0-9]+)\s*total,\s*([0-9]*[.]?[0-9]+)\s*free,\s*([0-9]*[.]?[0-9]+)\s*used.\s*([0-9]*[.]?[0-9]+)\s*avail\sMem/;
const topPromiseCreater = ()=>{
    return new Promise((resolve,reject)=>{
        const top = execFile('top',['-b','-n','1','1'],{},(err,stdout,stderr)=> {
            try {
                if(stderr) throw new Error(stderr);
                const [system,tasks,cpu0,cpu1,cpu2,cpu3,mem,swap] = stdout.split('\n').filter(str=>summaryAreaReg.test(str));
                const [,systemTime,upCount,upForm,upTime,users,loadAverage1m,loadAverage5m,loadAverage15m] = systemTimeReg.exec(system);
                const [,totalTasks,runningTasks,sleepingTasks,stoppedTasks,zombieTasks] = taskReg.exec(tasks);
                const [,cpu0us,cpu0sy,cpu0ni,cpu0id,cpu0wa,cpu0hi,cpu0si,cpu0st] = cpuReg.exec(cpu0);
                const [,cpu1us,cpu1sy,cpu1ni,cpu1id,cpu1wa,cpu1hi,cpu1si,cpu1st] = cpuReg.exec(cpu1);
                const [,cpu2us,cpu2sy,cpu2ni,cpu2id,cpu2wa,cpu2hi,cpu2si,cpu2st] = cpuReg.exec(cpu2);
                const [,cpu3us,cpu3sy,cpu3ni,cpu3id,cpu3wa,cpu3hi,cpu3si,cpu3st] = cpuReg.exec(cpu3);
                const [,memTotal,memFree,memUsed,memBuffCache] = memReg.exec(mem);
                const [,swapTotal,swapFree,swapUsed,swapAvailMem] = swapReg.exec(swap);
                const upTimeString = `up ${upCount} on ${upForm}, ${upTime}`
                resolve({
                    systemTime,upTimeString,users:users*1,loadAverage1m:parseFloat(loadAverage1m),loadAverage5m:parseFloat(loadAverage5m),loadAverage15m:parseFloat(loadAverage15m),
                    totalTasks:totalTasks*1,runningTasks:runningTasks*1,sleepingTasks:sleepingTasks*1,stoppedTasks:stoppedTasks*1,zombieTasks:zombieTasks*1,
                    cpu0us:parseFloat(cpu0us),cpu0sy:parseFloat(cpu0sy),cpu0ni:parseFloat(cpu0ni),cpu0id:parseFloat(cpu0id),cpu0wa:parseFloat(cpu0wa),cpu0hi:parseFloat(cpu0hi),cpu0si:parseFloat(cpu0si),cpu0st:parseFloat(cpu0st),
                    cpu1us:parseFloat(cpu1us),cpu1sy:parseFloat(cpu1sy),cpu1ni:parseFloat(cpu1ni),cpu1id:parseFloat(cpu1id),cpu1wa:parseFloat(cpu1wa),cpu1hi:parseFloat(cpu1hi),cpu1si:parseFloat(cpu1si),cpu1st:parseFloat(cpu1st),
                    cpu2us:parseFloat(cpu2us),cpu2sy:parseFloat(cpu2sy),cpu2ni:parseFloat(cpu2ni),cpu2id:parseFloat(cpu2id),cpu2wa:parseFloat(cpu2wa),cpu2hi:parseFloat(cpu2hi),cpu2si:parseFloat(cpu2si),cpu2st:parseFloat(cpu2st),
                    cpu3us:parseFloat(cpu3us),cpu3sy:parseFloat(cpu3sy),cpu3ni:parseFloat(cpu3ni),cpu3id:parseFloat(cpu3id),cpu3wa:parseFloat(cpu3wa),cpu3hi:parseFloat(cpu3hi),cpu3si:parseFloat(cpu3si),cpu3st:parseFloat(cpu3st),
                    memTotal:parseFloat(memTotal),memFree:parseFloat(memFree),memUsed:parseFloat(memUsed),memBuffCache:parseFloat(memBuffCache),
                    swapTotal:parseFloat(swapTotal),swapFree:parseFloat(swapFree),swapUsed:parseFloat(swapUsed),swapAvailMem:parseFloat(swapAvailMem)
                });
                
            }
            catch(err){
                reject(err); 
            }
        });
    });
};
/*
* lm_sensor의 sensors를 실행해 얻은 결과에서 온도부분만 뽑아 float로 변환한 뒤, resolve한다. 
* 에러: sensors명령이 실패해 stderr에 무언가 입력됐다면 error를 throw해 reject한다. 
* 용도: 온도측정
* 
*/
const tempPromiseCreater = ()=>{
    return new Promise((resolve,reject)=>{
        const temp = exec('cat /sys/class/thermal/thermal_zone0/temp',(err,stdout,stderr)=>{
            try {
                if(stderr) throw new Error(stderr);
                const temporature =parseFloat((stdout/100.0).toFixed(1))
                resolve(temporature);
            }
            catch(err) {
                reject(err);
            }
        })
    });
}
/*
1초 간격으로 setInterval을 통해 시간을 기록한다.

*/
const insertInterval = setInterval(async function(){
    if(!this.hasOwnProperty('beforeTimeStamp')){
        this.beforeTimeStamp = "0000-00-00 00:00:00";
    }
    try {
        const [topValue,tempValue] = await Promise.all([topPromiseCreater(),tempPromiseCreater()]);
        const cpu_temperature = tempValue;
        const {
            upTimeString,users,loadAverage1m,loadAverage5m,loadAverage15m,
            totalTasks,runningTasks,sleepingTasks,stoppedTasks,zombieTasks,
            cpu0us,cpu0sy,cpu0ni,cpu0id,cpu0wa,cpu0hi,cpu0si,cpu0st,
            cpu1us,cpu1sy,cpu1ni,cpu1id,cpu1wa,cpu1hi,cpu1si,cpu1st,
            cpu2us,cpu2sy,cpu2ni,cpu2id,cpu2wa,cpu2hi,cpu2si,cpu2st,
            cpu3us,cpu3sy,cpu3ni,cpu3id,cpu3wa,cpu3hi,cpu3si,cpu3st,
            memTotal,memFree,memUsed,memBuffCache,
            swapTotal,swapFree,swapUsed,swapAvailMem
        } = topValue;

        const system_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        if(system_time===this.beforeTimeStamp) {
            return;
        }
        else {
            this.beforeTimeStamp = system_time;
        }
        const datas = [
            system_time,
            upTimeString,users,loadAverage1m,loadAverage5m,loadAverage15m,
            totalTasks,runningTasks,sleepingTasks,stoppedTasks,zombieTasks,
            cpu_temperature,
            cpu0us,cpu0sy,cpu0ni,cpu0id,cpu0wa,cpu0hi,cpu0si,cpu0st,
            cpu1us,cpu1sy,cpu1ni,cpu1id,cpu1wa,cpu1hi,cpu1si,cpu1st,
            cpu2us,cpu2sy,cpu2ni,cpu2id,cpu2wa,cpu2hi,cpu2si,cpu2st,
            cpu3us,cpu3sy,cpu3ni,cpu3id,cpu3wa,cpu3hi,cpu3si,cpu3st,
            memTotal,memFree,memUsed,memBuffCache,
            swapTotal,swapFree,swapUsed,swapAvailMem
        ];
        const [rows] = await (await conn).query(query,datas);
        if(!!rows.Error) {
            throw new Error(`[DB]:${rows.Error}`);
        }
    }
    catch(err){
        if(!this.hasOwnProperty('errorCount')){
            this.errorCount = 0;
        }
        else {
            this.errorCount++;
        }
        logger.error(err.message);
        (await conn).release();
        if(this.errorCount>60) {
            clearInterval(insertInterval);   
        }
    }     
},intervalSecond);

process.on('beforeExit',(code)=>{//종료 예정
    logger.info(`[${code}]: process exit`);
})
