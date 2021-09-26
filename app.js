'use strict';

const fs = require('fs/promises')
const path = require('path')
const { Buffer } = require('buffer')
require('dotenv').config(); // dotenv 사용

const HZ = process.env.CONFIG_HZ;
const INTERVAL = process.env.INTERVAL;
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

            this.cpuUs =  (parseInt(parseCpu[0]) - this.beforeCpuUs)*100.0/diffTotal;
            this.cpuSy =  (parseInt(parseCpu[1]) - this.beforeCpuSy)*100.0/diffTotal;
            this.cpuNi =  (parseInt(parseCpu[2]) - this.beforeCpuNi)*100.0/diffTotal;
            this.cpuId =  (parseInt(parseCpu[3]) - this.beforeCpuId)*100.0/diffTotal;
            this.cpuWa =  (parseInt(parseCpu[4]) - this.beforeCpuWa)*100.0/diffTotal;
            this.cpuHi =  (parseInt(parseCpu[5]) - this.beforeCpuHi)*100.0/diffTotal;
            this.cpuSi =  (parseInt(parseCpu[6]) - this.beforeCpuSi)*100.0/diffTotal;
            this.cpuSt =  (parseInt(parseCpu[7]) - this.beforeCpuSt)*100.0/diffTotal;
            this.cpu0us = (parseInt(parseCpu0[0]) - this.beforeCpu0us)*100.0/diffTotal0;
            this.cpu0sy = (parseInt(parseCpu0[1]) - this.beforeCpu0sy)*100.0/diffTotal0;
            this.cpu0ni = (parseInt(parseCpu0[2]) - this.beforeCpu0ni)*100.0/diffTotal0;
            this.cpu0id = (parseInt(parseCpu0[3]) - this.beforeCpu0id)*100.0/diffTotal0;
            this.cpu0wa = (parseInt(parseCpu0[4]) - this.beforeCpu0wa)*100.0/diffTotal0;
            this.cpu0hi = (parseInt(parseCpu0[5]) - this.beforeCpu0hi)*100.0/diffTotal0;
            this.cpu0si = (parseInt(parseCpu0[6]) - this.beforeCpu0si)*100.0/diffTotal0;
            this.cpu0st = (parseInt(parseCpu0[7]) - this.beforeCpu0st)*100.0/diffTotal0;
            this.cpu1us = (parseInt(parseCpu1[0]) - this.beforeCpu1us)*100.0/diffTotal1;
            this.cpu1sy = (parseInt(parseCpu1[1]) - this.beforeCpu1sy)*100.0/diffTotal1;
            this.cpu1ni = (parseInt(parseCpu1[2]) - this.beforeCpu1ni)*100.0/diffTotal1;
            this.cpu1id = (parseInt(parseCpu1[3]) - this.beforeCpu1id)*100.0/diffTotal1;
            this.cpu1wa = (parseInt(parseCpu1[4]) - this.beforeCpu1wa)*100.0/diffTotal1;
            this.cpu1hi = (parseInt(parseCpu1[5]) - this.beforeCpu1hi)*100.0/diffTotal1;
            this.cpu1si = (parseInt(parseCpu1[6]) - this.beforeCpu1si)*100.0/diffTotal1;
            this.cpu1st = (parseInt(parseCpu1[7]) - this.beforeCpu1st)*100.0/diffTotal1;
            this.cpu2us = (parseInt(parseCpu2[0]) - this.beforeCpu2us)*100.0/diffTotal2;
            this.cpu2sy = (parseInt(parseCpu2[1]) - this.beforeCpu2sy)*100.0/diffTotal2;
            this.cpu2ni = (parseInt(parseCpu2[2]) - this.beforeCpu2ni)*100.0/diffTotal2;
            this.cpu2id = (parseInt(parseCpu2[3]) - this.beforeCpu2id)*100.0/diffTotal2;
            this.cpu2wa = (parseInt(parseCpu2[4]) - this.beforeCpu2wa)*100.0/diffTotal2;
            this.cpu2hi = (parseInt(parseCpu2[5]) - this.beforeCpu2hi)*100.0/diffTotal2;
            this.cpu2si = (parseInt(parseCpu2[6]) - this.beforeCpu2si)*100.0/diffTotal2;
            this.cpu2st = (parseInt(parseCpu2[7]) - this.beforeCpu2st)*100.0/diffTotal2;
            this.cpu3us = (parseInt(parseCpu3[0]) - this.beforeCpu3us)*100.0/diffTotal3;
            this.cpu3sy = (parseInt(parseCpu3[1]) - this.beforeCpu3sy)*100.0/diffTotal3;
            this.cpu3ni = (parseInt(parseCpu3[2]) - this.beforeCpu3ni)*100.0/diffTotal3;
            this.cpu3id = (parseInt(parseCpu3[3]) - this.beforeCpu3id)*100.0/diffTotal3;
            this.cpu3wa = (parseInt(parseCpu3[4]) - this.beforeCpu3wa)*100.0/diffTotal3;
            this.cpu3hi = (parseInt(parseCpu3[5]) - this.beforeCpu3hi)*100.0/diffTotal3;
            this.cpu3si = (parseInt(parseCpu3[6]) - this.beforeCpu3si)*100.0/diffTotal3;
            this.cpu3st = (parseInt(parseCpu3[7]) - this.beforeCpu3st)*100.0/diffTotal3;

            //cpuUsage 계산 (100 - idle)
            this.cpuUsage = 100 - this.cpuId;
            this.cpu0Usage = 100 - this.cpu0id;
            this.cpu1Usage = 100 - this.cpu1id;
            this.cpu2Usage = 100 - this.cpu2id;
            this.cpu3Usage = 100 - this.cpu3id;
            
            this.beforeCpuUs = parseInt(parseCpu[0]); 
            this.beforeCpuSy = parseInt(parseCpu[1]); 
            this.beforeCpuNi = parseInt(parseCpu[2]); 
            this.beforeCpuId = parseInt(parseCpu[3]); 
            this.beforeCpuWa = parseInt(parseCpu[4]); 
            this.beforeCpuHi = parseInt(parseCpu[5]); 
            this.beforeCpuSi = parseInt(parseCpu[6]); 
            this.beforeCpuSt = parseInt(parseCpu[7]); 
            this.beforeCpu0us = parseInt(parseCpu0[0]); 
            this.beforeCpu0sy = parseInt(parseCpu0[1]); 
            this.beforeCpu0ni = parseInt(parseCpu0[2]); 
            this.beforeCpu0id = parseInt(parseCpu0[3]); 
            this.beforeCpu0wa = parseInt(parseCpu0[4]); 
            this.beforeCpu0hi = parseInt(parseCpu0[5]); 
            this.beforeCpu0si = parseInt(parseCpu0[6]); 
            this.beforeCpu0st = parseInt(parseCpu0[7]); 
            this.beforeCpu1us = parseInt(parseCpu1[0]); 
            this.beforeCpu1sy = parseInt(parseCpu1[1]); 
            this.beforeCpu1ni = parseInt(parseCpu1[2]); 
            this.beforeCpu1id = parseInt(parseCpu1[3]); 
            this.beforeCpu1wa = parseInt(parseCpu1[4]); 
            this.beforeCpu1hi = parseInt(parseCpu1[5]); 
            this.beforeCpu1si = parseInt(parseCpu1[6]); 
            this.beforeCpu1st = parseInt(parseCpu1[7]); 
            this.beforeCpu2us = parseInt(parseCpu2[0]); 
            this.beforeCpu2sy = parseInt(parseCpu2[1]); 
            this.beforeCpu2ni = parseInt(parseCpu2[2]); 
            this.beforeCpu2id = parseInt(parseCpu2[3]); 
            this.beforeCpu2wa = parseInt(parseCpu2[4]); 
            this.beforeCpu2hi = parseInt(parseCpu2[5]); 
            this.beforeCpu2si = parseInt(parseCpu2[6]); 
            this.beforeCpu2st = parseInt(parseCpu2[7]); 
            this.beforeCpu3us = parseInt(parseCpu3[0]); 
            this.beforeCpu3sy = parseInt(parseCpu3[1]); 
            this.beforeCpu3ni = parseInt(parseCpu3[2]); 
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
    cpu0Usage: 0,
	cpu0us: 0,
	cpu0sy: 0,
	cpu0ni: 0,
	cpu0id: 0,
	cpu0wa: 0,
	cpu0hi: 0,
	cpu0si: 0,
	cpu0st: 0,
    cpu1Usage: 0,
	cpu1us: 0,
	cpu1sy: 0,
	cpu1ni: 0,
	cpu1id: 0,
	cpu1wa: 0,
	cpu1hi: 0,
	cpu1si: 0,
	cpu1st: 0,
    cpu2Usage: 0,
	cpu2us: 0,
	cpu2sy: 0,
	cpu2ni: 0,
	cpu2id: 0,
	cpu2wa: 0,
	cpu2hi: 0,
	cpu2si: 0,
	cpu2st: 0,
    cpu3Usage: 0,
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
            this.SReclaimable = parseInt(lines[23].match(regInt)[0]);
            this.usedMemory = this.totalMemory - (this.freeMemory + this.buffMemory + this.cacheMemory + this.SReclaimable);
            this.availableMemory = parseInt(lines[2].match(regInt)[0]);
            this.totalSwap = parseInt(lines[14].match(regInt)[0]);
            this.freeSwap = parseInt(lines[15].match(regInt)[0]);
            this.usedSwap = this.totalSwap - this.freeSwap;
            this.memUsage = this.usedMemory/this.totalMemory;

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
    SReclaimable:0,
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
            const values = lines.map(line=>line.replace(/\s+/g, ' ').split(' '))
            //values[index]: [3]:장치이름, 

            values.forEach(stats=> {
                const deviceName = stats[3];
                switch(deviceName) {
                    case 'mmcblk0': {
                        const mmcblkReadSectors = parseInt(stats[6]); // 읽은 섹터 수
                        this.mmcblkRead = ((mmcblkReadSectors - this.beforeMmcblkReadSectors) / 2)/INTERVAL;
                        this.beforeMmcblkReadSectors = mmcblkReadSectors;

                        const mmcblkWriteSectors = parseInt(stats[10]); // 쓴 섹터 수
                        this.mmcblkWrite = ((mmcblkWriteSectors - this.beforeMmcblkWriteSectors) / 2)/INTERVAL;
                        this.beforeMmcblkWriteSectors = mmcblkWriteSectors;
                        break;
                    }
                    case 'sda': {
                        const sdaReadSectors = parseInt(stats[6]); // 읽은 섹터 수
                        this.sdaRead = ((sdaReadSectors - this.beforeSdaReadSectors) / 2)/INTERVAL;
                        this.beforeSdaReadSectors = sdaReadSectors;

                        const sdaWriteSectors = parseInt(stats[10]); // 쓴 섹터 수
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
                    case 'eht0': {
                        const receiveBytes = parseInt(stats[1]);
                        const transmitBytes = parseInt(stats[9]);
                        
                        this.netReceive = (receiveBytes-this.beforeNetReceive)*8/INTERVAL/1024;
                        this.netTransmit = (transmitBytes-this.beforeNetTransmit)*8/INTERVAL/1024;
                        
                        this.beforeNetReceive = receiveBytes;
                        this.beforeNetTransmit = transmitBytes;
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
    netReceive: 0,
	netTransmit: 0
}

setInterval(async () => {
    const fileContentObj = await asyncProcFilesRead();

    uptimeObj.init(fileContentObj.uptime);
    loadavgObj.init(fileContentObj.loadavg);
    cpuObj.init(fileContentObj.cpu);
    memObj.init(fileContentObj.mem);
    diskObj.init(fileContentObj.disk);
    netObj.init(fileContentObj.net);

    console.log(new Date())
    console.log(uptimeObj.uptime);
    console.log(loadavgObj.loadavg1m,loadavgObj.loadavg5m,loadavgObj.loadavg15m);
    console.log('cpu:',cpuObj.cpuUsage,cpuObj.cpuUs,cpuObj.cpuSy,cpuObj.cpuNi,cpuObj.cpuId);
    console.log('mem:',memObj.memUsage,memObj.totalMemory,memObj.usedMemory,memObj.buffMemory,memObj.cacheMemory,memObj.freeMemory);
    console.log(diskObj.diskTotalRead,diskObj.diskTotalWrite,diskObj.mmcblkRead,diskObj.mmcblkWrite,diskObj.sdaRead,diskObj.sdaWrite);
    console.log(netObj.netReceive, netObj.netTransmit);

},INTERVAL*1000);

