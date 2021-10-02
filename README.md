# raspi_monitor

## description

라즈베리파이의 시스템정보를 모니터링하고 db에 주기적으로 저장하는 프로그램

## 모니터링 정보 및 스키마 정의
다음 5개의 테이블을 사용합니다.
- CPU
- Memory
- io(디스크 read/write)
- network(transmit,receive 정보)
- summary(위 4개 테이블 중 중요 정보 + 기타 시스템 값들 저장)

### CPU
|속성 이름|type|not null|default값|설명|
|:---:|:---:|:---:|:---:|:---:|
|date|timestamp|O|now()|데이터를 기록한 시각, **기본키**|
|cpu_usage|unsigned float|X||총 cpu 사용률, 100-total_id와 같다|
|cpu_us|unsigned float|X||유저모드 cpu 사용률|
|cpu_sy|unsigned float|X||시스템모드 cpu 사용률|
|cpu_ni|unsigned float|X||nice가 0 미만인 유저모드 cpu 사용률|
|cpu_id|unsigned float|X||cpu가 사용되지 않는 비율|
|cpu_wa|unsigned float|X||cpu wait 비율(주로 io) 사용률|
|cpu_hi|unsigned float|X||hardware interrupt|
|cpu_si|unsigned float|X||software interrupt|
|cpu_st|unsigned float|X||virtual cpu 사용률|
|cpu0_usage|unsigned float|X||총 cpu 사용률, 100-total_id와 같다|
|cpu0_us|unsigned float|X||유저모드 cpu 사용률|
|cpu0_sy|unsigned float|X||시스템모드 cpu 사용률|
|cpu0_ni|unsigned float|X||nice가 0 미만인 유저모드 cpu 사용률|
|cpu0_id|unsigned float|X||cpu가 사용되지 않는 비율|
|cpu0_wa|unsigned float|X||cpu wait 비율(주로 io) 사용률|
|cpu0_hi|unsigned float|X||hardware interrupt|
|cpu0_si|unsigned float|X||software interrupt|
|cpu0_st|unsigned float|X||virtual cpu 사용률|
|cpu1_usage|unsigned float|X||총 cpu 사용률, 100-total_id와 같다|
|cpu1_us|unsigned float|X||유저모드 cpu 사용률|
|cpu1_sy|unsigned float|X||시스템모드 cpu 사용률|
|cpu1_ni|unsigned float|X||nice가 0 미만인 유저모드 cpu 사용률|
|cpu1_id|unsigned float|X||cpu가 사용되지 않는 비율|
|cpu1_wa|unsigned float|X||cpu wait 비율(주로 io) 사용률|
|cpu1_hi|unsigned float|X||hardware interrupt|
|cpu1_si|unsigned float|X||software interrupt|
|cpu1_st|unsigned float|X||virtual cpu 사용률|
|cpu2_usage|unsigned float|X||총 cpu 사용률, 100-total_id와 같다|
|cpu2_us|unsigned float|X||유저모드 cpu 사용률|
|cpu2_sy|unsigned float|X||시스템모드 cpu 사용률|
|cpu2_ni|unsigned float|X||nice가 0 미만인 유저모드 cpu 사용률|
|cpu2_id|unsigned float|X||cpu가 사용되지 않는 비율|
|cpu2_wa|unsigned float|X||cpu wait 비율(주로 io) 사용률|
|cpu2_hi|unsigned float|X||hardware interrupt|
|cpu2_si|unsigned float|X||software interrupt|
|cpu2_st|unsigned float|X||virtual cpu 사용률|
|cpu3_usage|unsigned float|X||총 cpu 사용률, 100-total_id와 같다|
|cpu3_us|unsigned float|X||유저모드 cpu 사용률|
|cpu3_sy|unsigned float|X||시스템모드 cpu 사용률|
|cpu3_ni|unsigned float|X||nice가 0 미만인 유저모드 cpu 사용률|
|cpu3_id|unsigned float|X||cpu가 사용되지 않는 비율|
|cpu3_wa|unsigned float|X||cpu wait 비율(주로 io) 사용률|
|cpu3_hi|unsigned float|X||hardware interrupt|
|cpu3_si|unsigned float|X||software interrupt|
|cpu3_st|unsigned float|X||virtual cpu 사용률|

### memory
|속성 이름|type|not null|default값|설명|
|:---:|:---:|:---:|:---:|:---:|
|date|timestamp|O|now()|데이터를 기록한 시각, **기본키**|
|mem_usage|unsigned float|X||메모리 사용률(used_memory/total_memory)|
|total_memory|unsigned mediumint|X||총 메모리양, 사실 유동적인 값은 아닌데 없으면 섭하니까 넣었습니다.|
|free_memory|unsigned mediumint|X||사용 가능한 메모리|
|used_memory|unsigned mediumint|X||사용중인 메모리|
|buff_memory|unsigned mediumint|X||버퍼 크기|
|cache_memory|unsigned mediumint|X||캐쉬 크기|
|available_memory|unsigned mediumint|O||swapping없이 프로세스에 할당 가능한 메모리|
|total_swap|unsigned mediumint|X||총 swap 메모리 양|
|free_swap|unsigned mediumint|X||사용 가능한 swap 메모리 양|
|used_swap|unsigned mediumint|X||사용중인 swap 메모리 양|

### io (disk)

|속성 이름|type|not null|default값|설명|
|:---:|:---:|:---:|:---:|:---:|
|date|timestamp|O|now()|데이터를 기록한 시각, **기본키**|
|disk_total_read|unsigned float|X||총합 read KB/s|
|disk_total_write|unsigned float|X||총합 write KB/s|
|mmcblk_read|unsigned float|X||sd카드 read KB/s|
|mmcblk_write|unsigned float|X||sd카드 write KB/s|
|sda_read|unsigned float|X||sata로 연결된 장치에 대한 read KB/s|
|sda_write|unsigned float|X||sata로 연결된 장치에 대한 write KB/s|

### network

|속성 이름|type|not null|default값|설명|
|:---:|:---:|:---:|:---:|:---:|
|date|timestamp|O|now()|데이터를 기록한 시각, **기본키**|
|net_receive|unsigned float|X||전체 네트워크 수송 Kbps 여기선 이더넷만 고려|
|net_transmit|unsigned float|X||전체 네트워크 전송 Kbps 여기선 이더넷만 고려|
|net_receive_err|unsigned float|X||네트워크 수송 중 에러 Kbps|
|net_transmit_err|unsigned float|X||네트워크 전송 중 에러 Kbps|

### summary

|속성 이름|type|not null|default값|설명|
|:---:|:---:|:---:|:---:|:---:|
|date|timestamp|O|now()|데이터를 기록한 시각, **기본키**|
|uptime|unsigned float|X||부팅 후 지난 시간|
|loadavg_1m|unsigned float|X||1분 평균 loadavg|
|loadavg_5m|unsigned float|X||5분 평균 loadavg|
|loadavg_15m|unsigned float|X||15분 평균 loadavg|
|cpu_usage|unsigned float|X||cpu 사용률(%), **cpu_status테이블의 cpu_usage 과 같다**|
|mem_usage|unsigned float|X||mem 사용률(%), **memory_status테이블의 mem_usage 과 같다**|
|disk_total_read|unsigned float|X||디스크 read KB/s, **io_status테이블의 disk_total_read 과 같다**|
|disk_total_write|unsigned float|X||디스크 write KB/s, **io_status테이블의 disk_total_write 과 같다**|
|net_receive|unsigned float|X||network read Kbps, **network_status테이블의 net_receive 과 같다**|
|net_transmit|unsigned float|X||network write Kbps, **network_status테이블의 net_transmit 과 같다**|

## 실행 환경

- 4코어 환경 (라즈베리파이 4B 4G 모델 기준)
- ubuntu 20.04 lts 이상
- sata방식으로 연결된 HDD (sda의 read,write와 mmcblk의 read,write를 기록함)

4코어를 가정하고 쿼리를 작성했기 때문에 4코어가 아니면 에러가납니다.

## 의존성 모듈
- dotenv: ^10.0.0
- moment: ^2.29.1
- mysql2: ^2.3.0

## 사용법

먼저 위의 스키마를 토대로 데이터베이스 생성해야합니다.

<details>
  <summary>cpu 테이블 생성 쿼리</summary>
반드시 cpu_status 라는 이름으로 테이블을 생성해야합니다. 
```sql
CREATE TABLE cpu_status (
	date TIMESTAMP NOT NULL DEFAULT NOW() PRIMARY KEY,
	cpu_usage FLOAT UNSIGNED NULL,
	cpu_us FLOAT UNSIGNED NULL,
	cpu_sy FLOAT UNSIGNED NULL,
	cpu_ni FLOAT UNSIGNED NULL,
	cpu_id FLOAT UNSIGNED NULL,
	cpu_wa FLOAT UNSIGNED NULL,
	cpu_hi FLOAT UNSIGNED NULL,
	cpu_si FLOAT UNSIGNED NULL,
	cpu_st FLOAT UNSIGNED NULL,
    cpu0_usage FLOAT UNSIGNED NULL,
	cpu0_us FLOAT UNSIGNED NULL,
	cpu0_sy FLOAT UNSIGNED NULL,
	cpu0_ni FLOAT UNSIGNED NULL,
	cpu0_id FLOAT UNSIGNED NULL,
	cpu0_wa FLOAT UNSIGNED NULL,
	cpu0_hi FLOAT UNSIGNED NULL,
	cpu0_si FLOAT UNSIGNED NULL,
	cpu0_st FLOAT UNSIGNED NULL,
    cpu1_usage FLOAT UNSIGNED NULL,
	cpu1_us FLOAT UNSIGNED NULL,
	cpu1_sy FLOAT UNSIGNED NULL,
	cpu1_ni FLOAT UNSIGNED NULL,
	cpu1_id FLOAT UNSIGNED NULL,
	cpu1_wa FLOAT UNSIGNED NULL,
	cpu1_hi FLOAT UNSIGNED NULL,
	cpu1_si FLOAT UNSIGNED NULL,
	cpu1_st FLOAT UNSIGNED NULL,
    cpu2_usage FLOAT UNSIGNED NULL,
	cpu2_us FLOAT UNSIGNED NULL,
	cpu2_sy FLOAT UNSIGNED NULL,
	cpu2_ni FLOAT UNSIGNED NULL,
	cpu2_id FLOAT UNSIGNED NULL,
	cpu2_wa FLOAT UNSIGNED NULL,
	cpu2_hi FLOAT UNSIGNED NULL,
	cpu2_si FLOAT UNSIGNED NULL,
	cpu2_st FLOAT UNSIGNED NULL,
    cpu3_usage FLOAT UNSIGNED NULL,
	cpu3_us FLOAT UNSIGNED NULL,
	cpu3_sy FLOAT UNSIGNED NULL,
	cpu3_ni FLOAT UNSIGNED NULL,
	cpu3_id FLOAT UNSIGNED NULL,
	cpu3_wa FLOAT UNSIGNED NULL,
	cpu3_hi FLOAT UNSIGNED NULL,
	cpu3_si FLOAT UNSIGNED NULL,
	cpu3_st FLOAT UNSIGNED NULL
);
```
</details>

<details>
  <summary>memory 테이블 생성 쿼리</summary>
반드시 memory_status 라는 이름으로 테이블을 생성해야합니다. 

```sql
CREATE TABLE memory_status (
	date TIMESTAMP NOT NULL DEFAULT NOW() PRIMARY KEY,
	mem_usage FLOAT UNSIGNED NULL,
	total_memory MEDIUMINT UNSIGNED NULL,
	free_memory MEDIUMINT UNSIGNED NULL,
	used_memory MEDIUMINT UNSIGNED NULL,
	buff_memory MEDIUMINT UNSIGNED NULL,
	cache_memory MEDIUMINT UNSIGNED NULL,
	available_memory MEDIUMINT UNSIGNED NULL,
	total_swap MEDIUMINT UNSIGNED NULL,
	free_swap MEDIUMINT UNSIGNED NULL,
	used_swap MEDIUMINT UNSIGNED NULL
);
```
</details>

<details>
  <summary>io 테이블 생성 쿼리</summary>
반드시 io_status 라는 이름으로 테이블을 생성해야합니다. 

```sql
CREATE TABLE io_status (
	date TIMESTAMP NOT NULL DEFAULT NOW() PRIMARY KEY,
	disk_total_read FLOAT UNSIGNED NULL,
	disk_total_write FLOAT UNSIGNED NULL,
	mmcblk_read FLOAT UNSIGNED NULL,
	mmcblk_write FLOAT UNSIGNED NULL,
	sda_read FLOAT UNSIGNED NULL,
	sda_write FLOAT UNSIGNED NULL
);
```
</details>

<details>
  <summary>network 테이블 생성 쿼리</summary>
반드시 cpu_status 라는 이름으로 테이블을 생성해야합니다. 

```sql
CREATE TABLE network_status (
	date TIMESTAMP NOT NULL DEFAULT NOW() PRIMARY KEY,
	net_receive FLOAT UNSIGNED NULL,
	net_transmit FLOAT UNSIGNED NULL,
    net_receive_err FLOAT UNSIGNED NULL,
	net_transmit_err FLOAT UNSIGNED NULL
);
```
</details>

<details>
  <summary>summary 테이블 생성 쿼리</summary>
반드시 summary_status 라는 이름으로 테이블을 생성해야합니다. 

```sql

CREATE TABLE summary_status (
	date TIMESTAMP NOT NULL DEFAULT NOW() PRIMARY KEY,
	uptime FLOAT UNSIGNED NULL,
	loadavg_1m FLOAT UNSIGNED NULL,
	loadavg_5m FLOAT UNSIGNED NULL,
	loadavg_15m FLOAT UNSIGNED NULL,
	cpu_usage FLOAT UNSIGNED NULL,
	mem_usage FLOAT UNSIGNED NULL,
	disk_total_read FLOAT UNSIGNED NULL,
	disk_total_write FLOAT UNSIGNED NULL,
	net_receive FLOAT UNSIGNED NULL,
	net_transmit FLOAT UNSIGNED NULL
);
```
</details>



그 다음 `.env` 파일을 생성하고 및 아래의 정보를 기재해야합니다.
INTERVAL은 3초 평균값을 기록함을 의미합니다.
```
INTERVAL=3
HOST='[db 호스트 ip]'
USER='[db에 접속할 계정 명]'
PASSWORD='[비밀번호]'
DATABASE='[데이터베이스 이름]'
```

다음으로 필요 모듈을 설치하고 `app.js`를 시작하면 됩니다.

프로그램은 background로 돌아갑니다.
```bash
# 의존성 모듈 설치
npm install

# 프로그램 실행
npm start
```

## 라이센스
- ISC