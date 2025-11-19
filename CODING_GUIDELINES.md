# CODING_GUIDELINES
- **프로젝트명**: 골드옥션
- 골드에 관련된 경매사이트 


- **기술 스택**: react : frontend -> React + Vite
                springboot : backend
                db : oreacle 
                Java 17+

## 🏗️ 프로젝트 구조
backend controller 에  항목체크는 frontend 쪽에서  javascript로 간략하게 처리 해주고 javascript는  script 폴더쪽에서 처리하게 해줘

project-root/
 ├── backend/        # Spring Boot
 │     ├── src/
 │     ├── build.gradle or pom.xml
 │     └── ...
 ├── frontend/       # React
 │     ├── src/
 │     ├── package.json
 │     └── script   #javascript 
 │     └── css
 │     └── ...
 ├── README.md

root/
  backend -> Spring Boot 3 + Gradle 기반 API 서버
  frontend -> React + Vite 기반 프론트엔드

## 📚 항상 적용
frontend 
css는 CSS 폴더에 처리 
javascript 는 script 폴더에 처리


## 📚 추가 참고사항
일정 등록/조회/수정/삭제가 가능한 일정 관리 프로그램의 기본 구조

### 1. 기존 코드 활용
- **기존 코드를 적극 반영**하여 일관성 유지
- **비슷한 기능이 있다면 참고**하여 구현
- **Bootstrap Icons** 적극 활용
- **필요 없는 코드는 삭제**

### 3. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**

## 📊 오라클 DB 테이블 생성 쿼리

## 1. 회원 테이블 (MEMBER1)

### 테이블 생성
```sql
-- 회원 테이블 생성
CREATE TABLE MEMBER1 (
    NAME VARCHAR2(50) NOT NULL,              -- 이름
    ID VARCHAR2(50) PRIMARY KEY,            -- 아이디 (PK)
    NICKNAME VARCHAR2(20),                   -- 닉네임
    PWD VARCHAR2(100) NOT NULL,              -- 비밀번호
    GENDER VARCHAR2(10),                     -- 성별 (남/여)
    EMAIL1 VARCHAR2(50),                     -- 이메일 아이디
    EMAIL2 VARCHAR2(50),                     -- 이메일 도메인
    TEL1 VARCHAR2(10),                      -- 전화번호 앞자리
    TEL2 VARCHAR2(10),                      -- 전화번호 중간자리
    TEL3 VARCHAR2(10),                      -- 전화번호 뒷자리
    ADDR VARCHAR2(200),                      -- 주소
    LOGTIME DATE DEFAULT SYSDATE             -- 가입일시
);

-- 인덱스 생성
CREATE INDEX IDX_MEMBER1_ID ON MEMBER1(ID);
CREATE INDEX IDX_MEMBER1_NICKNAME ON MEMBER1(NICKNAME);

## 2. 경매 게시글 테이블 (IMAGEBOARD1)

### 테이블 생성
```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_IMAGEBOARD1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- 경매 게시글 테이블 생성
CREATE TABLE IMAGEBOARD1 (
    SEQ NUMBER PRIMARY KEY,                 -- 게시글 번호 (PK, 시퀀스)
    IMAGEID VARCHAR2(50) NOT NULL,           -- 작성자 ID (FK -> MEMBER1.ID)
    IMAGENAME VARCHAR2(200) NOT NULL,        -- 상품명
    IMAGEPRICE NUMBER DEFAULT 0,             -- 입찰 시작가격
    IMAGEQTY NUMBER DEFAULT 1,              -- 개수 (미사용)
    IMAGECONTENT CLOB,                       -- 상세 설명
    IMAGE1 VARCHAR2(200),                    -- 대표 이미지 파일명
    CATEGORY VARCHAR2(50),                   -- 카테고리 (골드, 실버, 백금, 다이아, 귀금속, 주화, 금은정련, 유가증권)
    AUCTION_PERIOD VARCHAR2(20),             -- 경매종료일 (7일후, 14일후, 21일후, 30일후)
    TRANSACTION_METHOD VARCHAR2(50),          -- 거래방식 (직거래, 매장방문, 에스크로, 중계소 이용)
    AUCTION_START_DATE DATE DEFAULT SYSDATE, -- 경매 시작일
    AUCTION_END_DATE DATE,                   -- 경매 종료일 (계산된 날짜)
    STATUS VARCHAR2(20) DEFAULT '진행중',    -- 상태 (진행중, 판매완료, 종료)
    LOGTIME DATE DEFAULT SYSDATE,            -- 등록일시
    CONSTRAINT FK_IMAGEBOARD1_MEMBER1 FOREIGN KEY (IMAGEID) REFERENCES MEMBER1(ID)
);

-- 인덱스 생성
CREATE INDEX IDX_IMAGEBOARD1_SEQ ON IMAGEBOARD1(SEQ);
CREATE INDEX IDX_IMAGEBOARD1_IMAGEID ON IMAGEBOARD1(IMAGEID);
CREATE INDEX IDX_IMAGEBOARD1_CATEGORY ON IMAGEBOARD1(CATEGORY);
CREATE INDEX IDX_IMAGEBOARD1_STATUS ON IMAGEBOARD1(STATUS);
CREATE INDEX IDX_IMAGEBOARD1_END_DATE ON IMAGEBOARD1(AUCTION_END_DATE);
```

## 3. 경매 게시글 이미지 테이블 (IMAGEBOARD_IMAGES1)

### 테이블 생성
```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_IMAGEBOARD_IMAGES1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- 경매 게시글 이미지 테이블 생성 (다중 이미지 저장용)
CREATE TABLE IMAGEBOARD_IMAGES1 (
    IMG_SEQ NUMBER PRIMARY KEY,              -- 이미지 번호 (PK, 시퀀스)
    IMAGEBOARD_SEQ NUMBER NOT NULL,          -- 게시글 번호 (FK -> IMAGEBOARD1.SEQ)
    IMAGE_PATH VARCHAR2(200) NOT NULL,        -- 이미지 파일 경로
    IMAGE_ORDER NUMBER DEFAULT 1,             -- 이미지 순서 (1: 대표이미지)
    UPLOAD_DATE DATE DEFAULT SYSDATE,        -- 업로드 일시
    CONSTRAINT FK_IMAGES1_IMAGEBOARD1 FOREIGN KEY (IMAGEBOARD_SEQ) REFERENCES IMAGEBOARD1(SEQ) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IDX_IMAGES1_IMAGEBOARD1_SEQ ON IMAGEBOARD_IMAGES1(IMAGEBOARD_SEQ);
CREATE INDEX IDX_IMAGES1_ORDER ON IMAGEBOARD_IMAGES1(IMAGEBOARD_SEQ, IMAGE_ORDER);


-- 입찰 테이블 생성
CREATE TABLE BID1 (
    BID_SEQ NUMBER PRIMARY KEY,              -- 입찰 번호 (PK, 시퀀스)
    IMAGEBOARD_SEQ NUMBER NOT NULL,          -- 경매 게시글 번호 (FK -> IMAGEBOARD1.SEQ)
    BIDDER_ID VARCHAR2(50) NOT NULL,          -- 입찰자 ID (FK -> MEMBER1.ID)
    BID_AMOUNT NUMBER NOT NULL,              -- 입찰 금액
    BID_TIME DATE DEFAULT SYSDATE,           -- 입찰 시간
    STATUS VARCHAR2(20) DEFAULT '유효',      -- 상태 (유효, 취소, 낙찰)
    CONSTRAINT FK_BID1_IMAGEBOARD1 FOREIGN KEY (IMAGEBOARD_SEQ) REFERENCES IMAGEBOARD1(SEQ) ON DELETE CASCADE,
    CONSTRAINT FK_BID1_MEMBER1 FOREIGN KEY (BIDDER_ID) REFERENCES MEMBER1(ID)
);

-- 인덱스 생성
CREATE INDEX IDX_BID1_IMAGEBOARD1_SEQ ON BID1(IMAGEBOARD_SEQ);
CREATE INDEX IDX_BID1_BIDDER_ID ON BID1(BIDDER_ID);
CREATE INDEX IDX_BID1_AMOUNT ON BID1(IMAGEBOARD_SEQ, BID_AMOUNT DESC);
CREATE INDEX IDX_BID1_TIME ON BID1(IMAGEBOARD_SEQ, BID_TIME DESC);


## 5. 공지사항 테이블 (NOTICE1) - 선택사항

### 테이블 생성
```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_NOTICE1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- 공지사항 테이블 생성
CREATE TABLE NOTICE1 (
    NOTICE_SEQ NUMBER PRIMARY KEY,           -- 공지사항 번호 (PK, 시퀀스)
    WRITER_ID VARCHAR2(50) NOT NULL,          -- 작성자 ID (FK -> MEMBER1.ID)
    TITLE VARCHAR2(200) NOT NULL,             -- 제목
    CONTENT CLOB,                            -- 내용
    VIEW_COUNT NUMBER DEFAULT 0,             -- 조회수
    LOGTIME DATE DEFAULT SYSDATE,            -- 등록일시
    CONSTRAINT FK_NOTICE1_MEMBER1 FOREIGN KEY (WRITER_ID) REFERENCES MEMBER1(ID)
);

-- 인덱스 생성
CREATE INDEX IDX_NOTICE1_SEQ ON NOTICE1(NOTICE_SEQ);
CREATE INDEX IDX_NOTICE1_WRITER ON NOTICE1(WRITER_ID);
```

## 8. 트리거 생성 (선택사항)

```sql
-- 경매 종료일 자동 계산 트리거
CREATE OR REPLACE TRIGGER TRG_IMAGEBOARD1_END_DATE
BEFORE INSERT OR UPDATE ON IMAGEBOARD1
FOR EACH ROW
BEGIN
    IF :NEW.AUCTION_PERIOD IS NOT NULL THEN
        :NEW.AUCTION_END_DATE := 
            CASE 
                WHEN :NEW.AUCTION_PERIOD = '7일후' THEN :NEW.AUCTION_START_DATE + 7
                WHEN :NEW.AUCTION_PERIOD = '14일후' THEN :NEW.AUCTION_START_DATE + 14
                WHEN :NEW.AUCTION_PERIOD = '21일후' THEN :NEW.AUCTION_START_DATE + 21
                WHEN :NEW.AUCTION_PERIOD = '30일후' THEN :NEW.AUCTION_START_DATE + 30
            END;
    END IF;
END;
/
```
-----------------------------------------------------------------------
```
-- 여기까지 테이블 완성
-----------------------------------------------------------------------


### 4. 테이블 관계도
```

```

### 5. 초기 테스트 데이터 삽입 (선택사항)
