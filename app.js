'use strict';

const fs = require('fs/promises')
const path = require('path')

const intervalSecond = process.env.INTERVAL*1000;

const filePathList = [
    "/proc/uptime",      // uptime 정보
    "/proc/loadavg",     // loadavg 1분 5분 15분 정보
    "/var/run/utmp",     // 현재 접속중인 유저 저장
    "/proc/stat",        // cpu 사용률 정보
    "/proc/meminfo",     // 메모리 정보
    "/proc/diskstats",   // 디스크 정보
    "/proc/net/dev"      // 네트워크 정보
];

const filePromiseList = filePathList.map(path=>{
    return fs.readFile(path,{ encoding:'utf-8'})
})

Promise.all(filePromiseList).then(contents=>{
    console.log(contents);
})


