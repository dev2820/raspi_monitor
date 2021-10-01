'use strict';

const fs = require('fs/promises')
const { createPool } = require('mysql2/promise');
const moment = require('moment');
require('dotenv').config();

const INTERVAL = process.env.INTERVAL;
const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;

/*
asyncProcFilesRead

파일 경로로부터 파일을 읽고 내용을 반환한다.
*/
const asyncProcFilesRead = async () => {
    const filePathList = [
        "/proc/uptime",      // uptime 정보
        "/proc/loadavg",     // loadavg 1분 5분 15분 정보
        "/proc/stat",        // cpu 사용률 정보
        "/proc/meminfo",     // 메모리 정보
        "/proc/diskstats",   // 디스크 정보
        "/proc/net/dev"      // 네트워크 정보
    ];
    
    const filePromiseList = filePathList.map(path=>{
        return fs.readFile(path,{ encoding:'utf-8'})
    })
    
    const fileContentList = await Promise.all(filePromiseList)
    return {
        uptime: fileContentList[0],
        loadavg: fileContentList[1],
        cpu: fileContentList[2],
        mem: fileContentList[3],
        disk: fileContentList[4],
        net: fileContentList[5],
    }
}

/*uptime 관리 객체 */
const uptimeObj = {
    init(content) {
        try {
            const reg = /[0-9]*[.]?[0-9]+/g
            const parseResult = content.match(reg); // [0]:uptime, [1]:idle time
            this.uptime = parseFloat(parseResult[0]);
            this.isInit = true;
        }
        catch(err) {
            console.log(err)
            this.isInit = false;
        }
    },
    isInit: false, // 여기에 파일내용을 처리하는 함수를 작성합시다.
    uptime: 0 // 처리한 값이 들어갑니다.
}

/*loadavg 관리 객체 */
const loadavgObj = {
    init(content) {
        try {
            const reg = /[0-9]*[.]?[0-9]+/g;
            const parseResult = content.match(reg); // [0]: loadavg1m, [1]: loadavg5m time [2]: loadavg15m

            this.loadavg1m = parseFloat(parseResult[0]);
            this.loadavg5m = parseFloat(parseResult[1]);
            this.loadavg15m = parseFloat(parseResult[2]);

            this.isInit = true;
        }
        catch(err) {
            console.log(err)
            this.isInit = false;
        }
    },
    isInit: false,
    loadavg1m: 0,
    loadavg5m: 0,
    loadavg15m: 0,
}

/*cpu 관리 객체 */
const cpuObj = {
    init(content) {
        try {
            const lines = content.split('\n');
            const regInt = /[0-9]+/g;

            const parseCpu = lines[0].match(regInt);
            const parseCpu0 = lines[1].match(regInt);
            const parseCpu1 = lines[2].match(regInt);
            const parseCpu2 = lines[3].match(regInt);
            const parseCpu3 = lines[4].match(regInt);

            let beforeTotal = this.beforeCpuUs+ this.beforeCpuSy+ this.beforeCpuNi+ this.beforeCpuId+ this.beforeCpuWa+ this.beforeCpuHi+ this.beforeCpuSi+ this.beforeCpuSt;
            let beforeTotal0 = this.beforeCpu0us+ this.beforeCpu0sy+ this.beforeCpu0ni+ this.beforeCpu0id+ this.beforeCpu0wa+ this.beforeCpu0hi+ this.beforeCpu0si+ this.beforeCpu0st;
            let beforeTotal1 = this.beforeCpu1us+ this.beforeCpu1sy+ this.beforeCpu1ni+ this.beforeCpu1id+ this.beforeCpu1wa+ this.beforeCpu1hi+ this.beforeCpu1si+ this.beforeCpu1st;
            let beforeTotal2 = this.beforeCpu2us+ this.beforeCpu2sy+ this.beforeCpu2ni+ this.beforeCpu2id+ this.beforeCpu2wa+ this.beforeCpu2hi+ this.beforeCpu2si+ this.beforeCpu2st;
            let beforeTotal3 = this.beforeCpu3us+ this.beforeCpu3sy+ this.beforeCpu3ni+ this.beforeCpu3id+ this.beforeCpu3wa+ this.beforeCpu3hi+ this.beforeCpu3si+ this.beforeCpu3st;

            let total = parseInt(parseCpu[0]) + parseInt(parseCpu[1]) + parseInt(parseCpu[2]) + parseInt(parseCpu[3]) + parseInt(parseCpu[4]) + parseInt(parseCpu[5]) + parseInt(parseCpu[6]) + parseInt(parseCpu[7]);
            let total0 = parseInt(parseCpu0[0]) + parseInt(parseCpu0[1]) + parseInt(parseCpu0[2]) + parseInt(parseCpu0[3]) + parseInt(parseCpu0[4]) + parseInt(parseCpu0[5]) + parseInt(parseCpu0[6]) + parseInt(parseCpu0[7]);
            let total1 = parseInt(parseCpu1[0]) + parseInt(parseCpu1[1]) + parseInt(parseCpu1[2]) + parseInt(parseCpu1[3]) + parseInt(parseCpu1[4]) + parseInt(parseCpu1[5]) + parseInt(parseCpu1[6]) + parseInt(parseCpu1[7]);
            let total2 = parseInt(parseCpu2[0]) + parseInt(parseCpu2[1]) + parseInt(parseCpu2[2]) + parseInt(parseCpu2[3]) + parseInt(parseCpu2[4]) + parseInt(parseCpu2[5]) + parseInt(parseCpu2[6]) + parseInt(parseCpu2[7]);
            let total3 = parseInt(parseCpu3[0]) + parseInt(parseCpu3[1]) + parseInt(parseCpu3[2]) + parseInt(parseCpu3[3]) + parseInt(parseCpu3[4]) + parseInt(parseCpu3[5]) + parseInt(parseCpu3[6]) + parseInt(parseCpu3[7]);
            
            let diffTotal = total - beforeTotal;
            let diffTotal0 = total0 - beforeTotal0;
            let diffTotal1 = total1 - beforeTotal1;
            let diffTotal2 = total2 - beforeTotal2;
            let diffTotal3 = total3 - beforeTotal3;

            this.cpuUs =  (parseInt(parseCpu[0]) - this.beforeCpuUs)/diffTotal*100.0;
            this.cpuNi =  (parseInt(parseCpu[1]) - this.beforeCpuNi)/diffTotal*100.0;
            this.cpuSy =  (parseInt(parseCpu[2]) - this.beforeCpuSy)/diffTotal*100.0;
            this.cpuId =  (parseInt(parseCpu[3]) - this.beforeCpuId)/diffTotal*100.0;
            this.cpuWa =  (parseInt(parseCpu[4]) - this.beforeCpuWa)/diffTotal*100.0;
            this.cpuHi =  (parseInt(parseCpu[5]) - this.beforeCpuHi)/diffTotal*100.0;
            this.cpuSi =  (parseInt(parseCpu[6]) - this.beforeCpuSi)/diffTotal*100.0;
            this.cpuSt =  (parseInt(parseCpu[7]) - this.beforeCpuSt)/diffTotal*100.0;
            
            this.cpu0us = (parseInt(parseCpu0[0]) - this.beforeCpu0us)/diffTotal0*100.0;
            this.cpu0ni = (parseInt(parseCpu0[1]) - this.beforeCpu0ni)/diffTotal0*100.0;
            this.cpu0sy = (parseInt(parseCpu0[2]) - this.beforeCpu0sy)/diffTotal0*100.0;
            this.cpu0id = (parseInt(parseCpu0[3]) - this.beforeCpu0id)/diffTotal0*100.0;
            this.cpu0wa = (parseInt(parseCpu0[4]) - this.beforeCpu0wa)/diffTotal0*100.0;
            this.cpu0hi = (parseInt(parseCpu0[5]) - this.beforeCpu0hi)/diffTotal0*100.0;
            this.cpu0si = (parseInt(parseCpu0[6]) - this.beforeCpu0si)/diffTotal0*100.0;
            this.cpu0st = (parseInt(parseCpu0[7]) - this.beforeCpu0st)/diffTotal0*100.0;
            
            this.cpu1us = (parseInt(parseCpu1[0]) - this.beforeCpu1us)/diffTotal1*100.0;
            this.cpu1ni = (parseInt(parseCpu1[1]) - this.beforeCpu1ni)/diffTotal1*100.0;
            this.cpu1sy = (parseInt(parseCpu1[2]) - this.beforeCpu1sy)/diffTotal1*100.0;
            this.cpu1id = (parseInt(parseCpu1[3]) - this.beforeCpu1id)/diffTotal1*100.0;
            this.cpu1wa = (parseInt(parseCpu1[4]) - this.beforeCpu1wa)/diffTotal1*100.0;
            this.cpu1hi = (parseInt(parseCpu1[5]) - this.beforeCpu1hi)/diffTotal1*100.0;
            this.cpu1si = (parseInt(parseCpu1[6]) - this.beforeCpu1si)/diffTotal1*100.0;
            this.cpu1st = (parseInt(parseCpu1[7]) - this.beforeCpu1st)/diffTotal1*100.0;
            
            this.cpu2us = (parseInt(parseCpu2[0]) - this.beforeCpu2us)/diffTotal2*100.0;
            this.cpu2ni = (parseInt(parseCpu2[1]) - this.beforeCpu2ni)/diffTotal2*100.0;
            this.cpu2sy = (parseInt(parseCpu2[2]) - this.beforeCpu2sy)/diffTotal2*100.0;
            this.cpu2id = (parseInt(parseCpu2[3]) - this.beforeCpu2id)/diffTotal2*100.0;
            this.cpu2wa = (parseInt(parseCpu2[4]) - this.beforeCpu2wa)/diffTotal2*100.0;
            this.cpu2hi = (parseInt(parseCpu2[5]) - this.beforeCpu2hi)/diffTotal2*100.0;
            this.cpu2si = (parseInt(parseCpu2[6]) - this.beforeCpu2si)/diffTotal2*100.0;
            this.cpu2st = (parseInt(parseCpu2[7]) - this.beforeCpu2st)/diffTotal2*100.0;
            
            this.cpu3us = (parseInt(parseCpu3[0]) - this.beforeCpu3us)/diffTotal3*100.0;
            this.cpu3ni = (parseInt(parseCpu3[1]) - this.beforeCpu3ni)/diffTotal3*100.0;
            this.cpu3sy = (parseInt(parseCpu3[2]) - this.beforeCpu3sy)/diffTotal3*100.0;
            this.cpu3id = (parseInt(parseCpu3[3]) - this.beforeCpu3id)/diffTotal3*100.0;
            this.cpu3wa = (parseInt(parseCpu3[4]) - this.beforeCpu3wa)/diffTotal3*100.0;
            this.cpu3hi = (parseInt(parseCpu3[5]) - this.beforeCpu3hi)/diffTotal3*100.0;
            this.cpu3si = (parseInt(parseCpu3[6]) - this.beforeCpu3si)/diffTotal3*100.0;
            this.cpu3st = (parseInt(parseCpu3[7]) - this.beforeCpu3st)/diffTotal3*100.0;

            //cpuUsage 계산 (100 - idle)
            this.cpuUsage = 100 - this.cpuId;
            this.cpu0usage = 100 - this.cpu0id;
            this.cpu1usage = 100 - this.cpu1id;
            this.cpu2usage = 100 - this.cpu2id;
            this.cpu3usage = 100 - this.cpu3id;
            
            this.beforeCpuUs = parseInt(parseCpu[0]); 
            this.beforeCpuNi = parseInt(parseCpu[1]); 
            this.beforeCpuSy = parseInt(parseCpu[2]); 
            this.beforeCpuId = parseInt(parseCpu[3]); 
            this.beforeCpuWa = parseInt(parseCpu[4]); 
            this.beforeCpuHi = parseInt(parseCpu[5]); 
            this.beforeCpuSi = parseInt(parseCpu[6]); 
            this.beforeCpuSt = parseInt(parseCpu[7]); 

            this.beforeCpu0us = parseInt(parseCpu0[0]); 
            this.beforeCpu0ni = parseInt(parseCpu0[1]); 
            this.beforeCpu0sy = parseInt(parseCpu0[2]); 
            this.beforeCpu0id = parseInt(parseCpu0[3]); 
            this.beforeCpu0wa = parseInt(parseCpu0[4]); 
            this.beforeCpu0hi = parseInt(parseCpu0[5]); 
            this.beforeCpu0si = parseInt(parseCpu0[6]); 
            this.beforeCpu0st = parseInt(parseCpu0[7]); 

            this.beforeCpu1us = parseInt(parseCpu1[0]); 
            this.beforeCpu1ni = parseInt(parseCpu1[1]); 
            this.beforeCpu1sy = parseInt(parseCpu1[2]); 
            this.beforeCpu1id = parseInt(parseCpu1[3]); 
            this.beforeCpu1wa = parseInt(parseCpu1[4]); 
            this.beforeCpu1hi = parseInt(parseCpu1[5]); 
            this.beforeCpu1si = parseInt(parseCpu1[6]); 
            this.beforeCpu1st = parseInt(parseCpu1[7]); 

            this.beforeCpu2us = parseInt(parseCpu2[0]); 
            this.beforeCpu2ni = parseInt(parseCpu2[1]); 
            this.beforeCpu2sy = parseInt(parseCpu2[2]); 
            this.beforeCpu2id = parseInt(parseCpu2[3]); 
            this.beforeCpu2wa = parseInt(parseCpu2[4]); 
            this.beforeCpu2hi = parseInt(parseCpu2[5]); 
            this.beforeCpu2si = parseInt(parseCpu2[6]); 
            this.beforeCpu2st = parseInt(parseCpu2[7]); 

            this.beforeCpu3us = parseInt(parseCpu3[0]); 
            this.beforeCpu3ni = parseInt(parseCpu3[1]); 
            this.beforeCpu3sy = parseInt(parseCpu3[2]); 
            this.beforeCpu3id = parseInt(parseCpu3[3]); 
            this.beforeCpu3wa = parseInt(parseCpu3[4]); 
            this.beforeCpu3hi = parseInt(parseCpu3[5]); 
            this.beforeCpu3si = parseInt(parseCpu3[6]); 
            this.beforeCpu3st = parseInt(parseCpu3[7]); 

            this.isInit=true;
        }
        catch(err) {
            console.log(err)
            this.isInit=false;
        }
    },
    isInit: false,
    cpuUsage: 0,
	cpuUs: 0,
	cpuSy: 0,
	cpuNi: 0,
	cpuId: 0,
	cpuWa: 0,
	cpuHi: 0,
	cpuSi: 0,
	cpuSt: 0,
    cpu0usage: 0,
	cpu0us: 0,
	cpu0sy: 0,
	cpu0ni: 0,
	cpu0id: 0,
	cpu0wa: 0,
	cpu0hi: 0,
	cpu0si: 0,
	cpu0st: 0,
    cpu1usage: 0,
	cpu1us: 0,
	cpu1sy: 0,
	cpu1ni: 0,
	cpu1id: 0,
	cpu1wa: 0,
	cpu1hi: 0,
	cpu1si: 0,
	cpu1st: 0,
    cpu2usage: 0,
	cpu2us: 0,
	cpu2sy: 0,
	cpu2ni: 0,
	cpu2id: 0,
	cpu2wa: 0,
	cpu2hi: 0,
	cpu2si: 0,
	cpu2st: 0,
    cpu3usage: 0,
	cpu3us: 0,
	cpu3sy: 0,
	cpu3ni: 0,
	cpu3id: 0,
	cpu3wa: 0,
	cpu3hi: 0,
	cpu3si: 0,
	cpu3st: 0,
    beforeCpuUs: 0,
	beforeCpuSy: 0,
	beforeCpuNi: 0,
	beforeCpuId: 0,
	beforeCpuWa: 0,
	beforeCpuHi: 0,
	beforeCpuSi: 0,
	beforeCpuSt: 0,
	beforeCpu0us: 0,
	beforeCpu0sy: 0,
	beforeCpu0ni: 0,
	beforeCpu0id: 0,
	beforeCpu0wa: 0,
	beforeCpu0hi: 0,
	beforeCpu0si: 0,
	beforeCpu0st: 0,
	beforeCpu1us: 0,
	beforeCpu1sy: 0,
	beforeCpu1ni: 0,
	beforeCpu1id: 0,
	beforeCpu1wa: 0,
	beforeCpu1hi: 0,
	beforeCpu1si: 0,
	beforeCpu1st: 0,
	beforeCpu2us: 0,
	beforeCpu2sy: 0,
	beforeCpu2ni: 0,
	beforeCpu2id: 0,
	beforeCpu2wa: 0,
	beforeCpu2hi: 0,
	beforeCpu2si: 0,
	beforeCpu2st: 0,
	beforeCpu3us: 0,
	beforeCpu3sy: 0,
	beforeCpu3ni: 0,
	beforeCpu3id: 0,
	beforeCpu3wa: 0,
	beforeCpu3hi: 0,
	beforeCpu3si: 0,
	beforeCpu3st: 0,
}

/*mem 관리 객체 */
const memObj = {
    init(content) {
        try {
            const lines = content.split('\n');
            const regInt = /[0-9]+/g;

            this.totalMemory = parseInt(lines[0].match(regInt)[0]);
            this.freeMemory = parseInt(lines[1].match(regInt)[0]);
            
            this.buffMemory = parseInt(lines[3].match(regInt)[0]);
            this.cacheMemory = parseInt(lines[4].match(regInt)[0]);
            this.usedMemory = this.totalMemory - (this.freeMemory + this.buffMemory + this.cacheMemory);
            this.availableMemory = parseInt(lines[2].match(regInt)[0]);
            this.totalSwap = parseInt(lines[14].match(regInt)[0]);
            this.freeSwap = parseInt(lines[15].match(regInt)[0]);
            this.usedSwap = this.totalSwap - this.freeSwap;
            this.memUsage = (this.usedMemory/this.totalMemory)*100.0;

            this.isInit=true;
        }
        catch(err) {
            console.log(err)
            this.isInit=false;
        }
    },
    isInit: false,
    memUsage:0,
	totalMemory:0,
	freeMemory:0,
	usedMemory:0,
	buffMemory:0,
	cacheMemory:0,
	availableMemory:0,
	totalSwap:0,
	freeSwap:0,
	usedSwap:0
}

/*disk 관리 객체 */
const diskObj = {
    init(content) {
        try {
            const lines = content.split('\n');
            const values = lines.map(line=>line.replace(/\s+/g, ' ').trim().split(' '))
            //values[index]: [2]:장치이름, [5]: read 섹터 수, [9]: write 섹터 수 

            values.forEach(stats=> {
                const deviceName = stats[2];
                switch(deviceName) {
                    case 'mmcblk0': {
                        const mmcblkReadSectors = parseInt(stats[5]); // 읽은 섹터 수
                        this.mmcblkRead = ((mmcblkReadSectors - this.beforeMmcblkReadSectors) / 2)/INTERVAL;
                        this.beforeMmcblkReadSectors = mmcblkReadSectors;

                        const mmcblkWriteSectors = parseInt(stats[9]); // 쓴 섹터 수
                        this.mmcblkWrite = ((mmcblkWriteSectors - this.beforeMmcblkWriteSectors) / 2)/INTERVAL;
                        this.beforeMmcblkWriteSectors = mmcblkWriteSectors;
                        break;
                    }
                    case 'sda': {
                        const sdaReadSectors = parseInt(stats[5]); // 읽은 섹터 수
                        this.sdaRead = ((sdaReadSectors - this.beforeSdaReadSectors) / 2)/INTERVAL;
                        this.beforeSdaReadSectors = sdaReadSectors;

                        const sdaWriteSectors = parseInt(stats[9]); // 쓴 섹터 수
                        this.sdaWrite = ((sdaWriteSectors - this.beforeSdaWriteSectors) / 2)/INTERVAL;
                        this.beforeSdaWriteSectors = sdaWriteSectors;
                        break;
                    }
                }
            })

            this.diskTotalRead = this.mmcblkRead + this.sdaRead;
            this.diskTotalWrite = this.mmcblkWrite + this.sdaWrite;

            this.isInit = true;
        }
        catch(err) {
            console.log(err);
            this.isInit = false;
        }
    },
    isInit: false,
    beforeMmcblkReadSectors:0,
    beforeSdaReadSectors:0,
    beforeMmcblkWriteSectors:0,
    beforeSdaWriteSectors:0,
    diskTotalRead:0,
	diskTotalWrite:0,
	mmcblkRead:0,
	mmcblkWrite:0,
	sdaRead:0,
	sdaWrite:0
}

/*net 관리 객체 */
const netObj = {
    init(content) {
        try {
            const lines = content.split('\n');
            const values = lines.map(line=>line.replace(/\s+/g, ' ').trim().split(' '));

            values.forEach(stats => {
                const netName = stats[0];
                switch(netName) {
                    case 'eth0:': {
                        const receiveBytes = parseInt(stats[1]);
                        const receiveErrBytes = parseInt(stats[3]);
                        const transmitBytes = parseInt(stats[9]);
                        const transmitErrBytes = parseInt(stats[11]);
                        
                        this.netReceive = (receiveBytes-this.beforeNetReceive)*8/INTERVAL/1024;
                        this.netTransmit = (transmitBytes-this.beforeNetTransmit)*8/INTERVAL/1024;
                        this.netReceiveErr = (receiveErrBytes-this.beforeNetReceiveErr)*8/INTERVAL/1024;
                        this.netTransmitErr = (transmitErrBytes-this.beforeNetTransmitErr)*8/INTERVAL/1024;

                        this.beforeNetReceive = receiveBytes;
                        this.beforeNetTransmit = transmitBytes;
                        this.beforeNetReceiveErr = receiveErrBytes;
                        this.beforeNetTransmitErr = transmitErrBytes;
                        break;
                    }
                }
            })

            this.isInit = true;
        }
        catch(err) {
            console.log(err)
            this.isInit = false;
        }
    },
    isInit: false,
    beforeNetReceive: 0,
    beforeNetTransmit: 0,
    beforeNetReceiveErr: 0,
    beforeNetTransmitErr: 0,
    netReceive: 0,
	netTransmit: 0,
    netReceiveErr: 0,
	netTransmitErr: 0
}
/* cpu_status table insert용 쿼리 */
const cpuInsertQuery = `INSERT INTO cpu_status(
    date,
    cpu_usage,
    cpu_us,
    cpu_sy,
    cpu_ni,
    cpu_id,
    cpu_wa,
    cpu_hi,
    cpu_si,
    cpu_st,
    cpu0_usage,
    cpu0_us,
    cpu0_sy,
    cpu0_ni,
    cpu0_id,
    cpu0_wa,
    cpu0_hi,
    cpu0_si,
    cpu0_st,
    cpu1_usage,
    cpu1_us,
    cpu1_sy,
    cpu1_ni,
    cpu1_id,
    cpu1_wa,
    cpu1_hi,
    cpu1_si,
    cpu1_st,
    cpu2_usage,
    cpu2_us,
    cpu2_sy,
    cpu2_ni,
    cpu2_id,
    cpu2_wa,
    cpu2_hi,
    cpu2_si,
    cpu2_st,
    cpu3_usage,
    cpu3_us,
    cpu3_sy,
    cpu3_ni,
    cpu3_id,
    cpu3_wa,
    cpu3_hi,
    cpu3_si,
    cpu3_st
) VALUES(
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?
)`;
/* memory_status table insert용 쿼리 */
const memInsertQuery = `INSERT INTO memory_status(
    date,
    mem_usage,
    total_memory,
    free_memory,
    used_memory,
    buff_memory,
    cache_memory,
    available_memory,
    total_swap,
    free_swap,
    used_swap
) VALUES (
    ?,?,?,?,?,?,?,?,?,?,
    ?
)`;
/* io_status table insert용 쿼리 */
const ioInsertQuery = `INSERT INTO io_status(
    date,
    disk_total_read,
    disk_total_write,
    mmcblk_read,
    mmcblk_write,
    sda_read,
    sda_write
) VALUES (
    ?,?,?,?,?,?,?
)`
/* network_status table insert용 쿼리 */
const networkInsertQuery = `INSERT INTO network_status(
    date,
    net_receive,
    net_transmit,
    net_receive_err,
    net_transmit_err
) VALUES (
    ?,?,?,?,?
)`;
/* summary_status table insert용 쿼리 */
const summaryInsertQuery = `INSERT INTO summary_status(
    date,
    uptime,
    loadavg_1m,
    loadavg_5m,
    loadavg_15m,
    cpu_usage,
    mem_usage,
    disk_total_read,
    disk_total_write,
    net_receive,
    net_transmit
) VALUES (
    ?,?,?,?,?,?,?,?,?,?,
    ?
)`;
/*
getValuesFromFileToObjs
params: {
    objs: 파일 내용을 저장할 객체(uptimeObj,loadavgObj,cpuObj,memObj,diskObj,netObj)
}

설명: 파일을 읽고 내용을 objs에 나누어 저장함
*/
const getValuesFromFileToObjs = async (objs) => {
    try {
        //파일 읽어오기
        const fileContentObj = await asyncProcFilesRead();

        //파일 내용 저장
        objs.uptimeObj.init(fileContentObj.uptime);
        objs.loadavgObj.init(fileContentObj.loadavg);
        objs.cpuObj.init(fileContentObj.cpu);
        objs.memObj.init(fileContentObj.mem);
        objs.diskObj.init(fileContentObj.disk);
        objs.netObj.init(fileContentObj.net);

    }
    catch(err) {
        console.log(err);
        fs.writeFile('log.json',`${new Date()} exit`);
        return new Error('read file failed')
    }
}
/*
makeConnectList
params: {
    host: 호스트(ip)
    user: 계정이름
    password: 계정비밀번호
    database: 사용할 db 이름
    limit: 연결을 유지할 maximum 개수
}

설명: createPool로 데이터베이스 연결을 만들고 getConnection으로 table마다 사용할 연결을 가져옴
*/
const makeConnectList = async (option) => {
    const connectionList = [];
    const pool = createPool({
        host:option.host,
        user:option.user,
        password:option.password,
        database:option.database,
        limit:option.limit
    })
    for(let i=0;i<option.limit;i++)
        connectionList.push(await pool.getConnection(async conn=>conn))

    return connectionList;
}

const mainLoop = async (interval,objs,dbOptions) => {
    try {
        await getValuesFromFileToObjs(objs); // 초기값 불러와서 before값 세팅
        const connectionList = await makeConnectList(dbOptions);// connection 가져오기
        const intervalHandler = setInterval(async () => {
            //입력 읽어오기 및 저장하기
            const err = await getValuesFromFileToObjs(objs)
            if(err){
                throw err;
            }

            //INSERT 쿼리 실행
            const promiseList = [];
            const system_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            connectionList.forEach(connection=>connection.beginTransaction())
            //cpu_status insert
            promiseList.push(connectionList[0].query(cpuInsertQuery,[
                system_time,
                objs.cpuObj.cpuUsage.toFixed(1),
                objs.cpuObj.cpuUs.toFixed(1),
                objs.cpuObj.cpuSy.toFixed(1),
                objs.cpuObj.cpuNi.toFixed(1),
                objs.cpuObj.cpuId.toFixed(1),
                objs.cpuObj.cpuWa.toFixed(1),
                objs.cpuObj.cpuHi.toFixed(1),
                objs.cpuObj.cpuSi.toFixed(1),
                objs.cpuObj.cpuSt.toFixed(1),
                objs.cpuObj.cpu0usage.toFixed(1),
                objs.cpuObj.cpu0us.toFixed(1),
                objs.cpuObj.cpu0sy.toFixed(1),
                objs.cpuObj.cpu0ni.toFixed(1),
                objs.cpuObj.cpu0id.toFixed(1),
                objs.cpuObj.cpu0wa.toFixed(1),
                objs.cpuObj.cpu0hi.toFixed(1),
                objs.cpuObj.cpu0si.toFixed(1),
                objs.cpuObj.cpu0st.toFixed(1),
                objs.cpuObj.cpu1usage.toFixed(1),
                objs.cpuObj.cpu1us.toFixed(1),
                objs.cpuObj.cpu1sy.toFixed(1),
                objs.cpuObj.cpu1ni.toFixed(1),
                objs.cpuObj.cpu1id.toFixed(1),
                objs.cpuObj.cpu1wa.toFixed(1),
                objs.cpuObj.cpu1hi.toFixed(1),
                objs.cpuObj.cpu1si.toFixed(1),
                objs.cpuObj.cpu1st.toFixed(1),
                objs.cpuObj.cpu2usage.toFixed(1),
                objs.cpuObj.cpu2us.toFixed(1),
                objs.cpuObj.cpu2sy.toFixed(1),
                objs.cpuObj.cpu2ni.toFixed(1),
                objs.cpuObj.cpu2id.toFixed(1),
                objs.cpuObj.cpu2wa.toFixed(1),
                objs.cpuObj.cpu2hi.toFixed(1),
                objs.cpuObj.cpu2si.toFixed(1),
                objs.cpuObj.cpu2st.toFixed(1),
                objs.cpuObj.cpu3usage.toFixed(1),
                objs.cpuObj.cpu3us.toFixed(1),
                objs.cpuObj.cpu3sy.toFixed(1),
                objs.cpuObj.cpu3ni.toFixed(1),
                objs.cpuObj.cpu3id.toFixed(1),
                objs.cpuObj.cpu3wa.toFixed(1),
                objs.cpuObj.cpu3hi.toFixed(1),
                objs.cpuObj.cpu3si.toFixed(1),
                objs.cpuObj.cpu3st.toFixed(1)
            ]));
            //memory_status insert
            promiseList.push(connectionList[1].query(memInsertQuery,[
                system_time,
                objs.memObj.memUsage.toFixed(1),
                objs.memObj.totalMemory,
                objs.memObj.freeMemory,
                objs.memObj.usedMemory,
                objs.memObj.buffMemory,
                objs.memObj.cacheMemory,
                objs.memObj.availableMemory,
                objs.memObj.totalSwap,
                objs.memObj.freeSwap,
                objs.memObj.usedSwap
            ]));
            //io_status insert
            promiseList.push(connectionList[2].query(ioInsertQuery,[
                system_time,
                objs.diskObj.diskTotalRead.toFixed(1),
                objs.diskObj.diskTotalWrite.toFixed(1),
                objs.diskObj.mmcblkRead.toFixed(1),
                objs.diskObj.mmcblkWrite.toFixed(1),
                objs.diskObj.sdaRead.toFixed(1),
                objs.diskObj.sdaWrite.toFixed(1)
            ]));
            //network_status insert
            promiseList.push(connectionList[3].query(networkInsertQuery,[
                system_time,
                objs.netObj.netReceive.toFixed(1),
                objs.netObj.netTransmit.toFixed(1),
                objs.netObj.netReceiveErr.toFixed(1),
                objs.netObj.netTransmitErr.toFixed(1),
            ]));
            //summary_status insert
            promiseList.push(connectionList[4].query(summaryInsertQuery,[
                system_time,
                objs.uptimeObj.uptime,
                objs.loadavgObj.loadavg1m,
                objs.loadavgObj.loadavg5m,
                objs.loadavgObj.loadavg15m,
                objs.cpuObj.cpuUsage.toFixed(1),
                objs.memObj.memUsage.toFixed(1),
                objs.diskObj.diskTotalRead.toFixed(1),
                objs.diskObj.diskTotalWrite.toFixed(1),
                objs.netObj.netReceive.toFixed(1),
                objs.netObj.netTransmit.toFixed(1)
            ]));
            await Promise.all(promiseList)
            const commitList = connectionList.map(connection=>{
                return connection.commit();
            })
            await Promise.all(commitList)

            const tableList = ['cpu_status','memory_status','io_status','network_status','summary_status'];
            //각 table별 tuple 개수 새기
            promiseList.splice(0);
            tableList.forEach((tableName,index)=>{
                const query = `SELECT COUNT(*) AS cnt FROM ${tableName}`;
                promiseList.push(connectionList[0].query(query))
            })
            const countList = await Promise.all(promiseList);
            //tuple이 7*24*60*60/3개(1주일 치)가 넘어가면 가장 오래된 tuple부터 지움
            const amountOfWeekTuple = 7*24*60*60/3;
            promiseList.splice(0);
            tableList.forEach((tableName,index)=>{
                let [row,field] = countList[index][0];
                if(row['cnt']>amountOfWeekTuple) {
                    const deleteLatestQuery = `DELETE FROM ${tableName} ORDER BY date limit ${cnt-amountOfWeekTuple}`;
                    promiseList.push(connectionList[0].query(deleteLatestQuery));
                }
            })
            await Promise.all(promiseList);

            const deleteOldTupleCommitList = connectionList.map(connection=>{
                connection.commit();
            });
            await Promise.all(deleteOldTupleCommitList);
            
            connectionList.forEach(connection=>{
                connection.release();
            })

        },interval*1000);
    }
    catch(err) {
        console.log(err);
        fs.writeFile('log.json',`error occurs at ${new Date()} exit`);
    }
}
const objs = {
    uptimeObj,
    loadavgObj,
    cpuObj,
    memObj,
    diskObj,
    netObj
}
const dbOptions = {
    host:HOST,
    user:USER,
    password:PASSWORD,
    database:DATABASE,
    limit:5
}
mainLoop(INTERVAL,objs,dbOptions);
