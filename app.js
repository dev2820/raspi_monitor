'use strict';

const fs = require('fs/promises')
const path = require('path')
const { Buffer } = require('buffer')
require('dotenv').config(); // dotenv 사용

const HZ = process.env.CONFIG_HZ;

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
            this.uptime = parseResult[0];
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

            this.loadavg1m = parseResult[0];
            this.loadavg5m = parseResult[1];
            this.loadavg15m = parseResult[2];

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
        const lines = content.split('\n');
        console.log(lines)

        const regInt = /[0-9]+/g;

        const parseCpu = lines[0].match(regInt); // 
        const parseCpu0 = lines[1].match(regInt); // 
        const parseCpu1 = lines[2].match(regInt); // 
        const parseCpu2 = lines[3].match(regInt); // 
        const parseCpu3 = lines[4].match(regInt); // 

        console.log(parseCpu,parseCpu0,parseCpu1,parseCpu2,parseCpu3);
    },
    isInit: false,
    cpuUsage: 0,
	cpuUs: 0,
	cpuUy: 0,
	cpuUi: 0,
	cpuUd: 0,
	cpuUa: 0,
	cpuUi: 0,
	cpuUi: 0,
	cpuUt: 0,
	cpu0us: 0,
	cpu0sy: 0,
	cpu0ni: 0,
	cpu0id: 0,
	cpu0wa: 0,
	cpu0hi: 0,
	cpu0si: 0,
	cpu0st: 0,
	cpu1us: 0,
	cpu1sy: 0,
	cpu1ni: 0,
	cpu1id: 0,
	cpu1wa: 0,
	cpu1hi: 0,
	cpu1si: 0,
	cpu1st: 0,
	cpu2us: 0,
	cpu2sy: 0,
	cpu2ni: 0,
	cpu2id: 0,
	cpu2wa: 0,
	cpu2hi: 0,
	cpu2si: 0,
	cpu2st: 0,
	cpu3us: 0,
	cpu3sy: 0,
	cpu3ni: 0,
	cpu3id: 0,
	cpu3wa: 0,
	cpu3hi: 0,
	cpu3si: 0,
	cpu3st: 0
}

/*mem 관리 객체 */
const memObj = {
    init(content) {
        
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
        
    },
    isInit: false,
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
        
    },
    isInit: false,
    netReceive: 0,
	netTransmit: 0
}

const interval = setInterval(async () => {
    const fileContentObj = await asyncProcFilesRead();

    uptimeObj.init(fileContentObj.uptime);
    loadavgObj.init(fileContentObj.loadavg);
    cpuObj.init(fileContentObj.cpu);
    memObj.init(fileContentObj.mem);
    diskObj.init(fileContentObj.disk);
    netObj.init(fileContentObj.net);

    console.log(uptimeObj.uptime)
    console.log(loadavgObj.loadavg1m,loadavgObj.loadavg5m,loadavgObj.loadavg15m)
},3000);

