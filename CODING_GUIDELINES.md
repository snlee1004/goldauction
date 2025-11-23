# CODING_GUIDELINES
- **프로젝트명**: 골드옥션
- 골드에 관련된 경매사이트 

- **기술 스택**: react : frontend -> React + Vite
                springboot : backend
                db : oracle 
                Java 17+

## 📝 JavaScript 관리 규칙

**모든 JavaScript 로직은 `frontend/src/script` 폴더에서 관리합니다.**

- **API 호출 함수**: `script/intro.js`, `script/memberValidation.js`, `script/imageboardValidation.js` 등
- **유틸리티 함수**: 각 기능별로 분리하여 관리
- **컴포넌트 파일**: React 컴포넌트는 UI 렌더링에만 집중, 비즈니스 로직은 script 폴더로 분리
- **Backend Controller**: 항목 체크는 frontend 쪽에서 JavaScript로 간략하게 처리

### JavaScript 파일 구조
```
frontend/src/script/
  ├── intro.js              # Intro.jsx 관련 API 호출 및 로직
  ├── memberValidation.js   # 회원 관련 유효성 검사
  └── imageboardValidation.js # 경매 게시글 관련 유효성 검사
```

## 🏗️ 프로젝트 구조

project-root/
 ├── backend/        # Spring Boot
 │     ├── src/
 │     ├── build.gradle or pom.xml
 │     └── ...
 ├── frontend/       # React
 │     ├── src/
 │     │   ├── script/      # JavaScript 로직 관리
 │     │   ├── css/         # CSS 파일
 │     │   └── ...
 │     ├── package.json
 │     └── ...
 ├── README.md
 ├── DB.md           # 데이터베이스 스키마 문서
 └── CSS.md          # CSS 관리 문서

root/
  backend -> Spring Boot 3 + Gradle 기반 API 서버
  frontend -> React + Vite 기반 프론트엔드

## 📚 추가 참고사항

### 1. 기존 코드 활용
- **기존 코드를 적극 반영**하여 일관성 유지
- **비슷한 기능이 있다면 참고**하여 구현
- **Bootstrap Icons** 적극 활용
- **필요 없는 코드는 삭제**

### 2. Intro.jsx 입찰 베스트 처리 규칙
- **판매 완료, 판매종료, 경매 포기** 내용은 리스트에 반영하지 않음
- **입찰수가 많은 항목**은 최상단 리스트에 표시
- JavaScript 로직이 필요하면 `script/intro.js`에 추가

### 3. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**

## 📊 오라클 DB 테이블 생성 쿼리

### 1. 회원 테이블 (MEMBER1)

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
    LOGTIME DATE DEFAULT SYSDATE,            -- 가입일시
    IS_SUSPENDED VARCHAR2(1) DEFAULT 'N',    -- 계정 정지 여부 (Y: 정지, N: 정상)
    SUSPEND_START_DATE DATE,                 -- 정지 시작일
    SUSPEND_END_DATE DATE,                   -- 정지 종료일
    SUSPEND_REASON VARCHAR2(500)             -- 정지 사유
);

-- 인덱스 생성
CREATE INDEX IDX_MEMBER1_ID ON MEMBER1(ID);
CREATE INDEX IDX_MEMBER1_NICKNAME ON MEMBER1(NICKNAME);
CREATE INDEX IDX_MEMBER1_SUSPENDED ON MEMBER1(IS_SUSPENDED);
```

### 기존 MEMBER1 테이블에 계정 정지 필드 추가 (ALTER TABLE)

기존에 MEMBER1 테이블이 이미 생성되어 있는 경우, 아래 SQL을 실행하여 계정 정지 관련 필드를 추가할 수 있습니다:

```sql
-- 1. 계정 정지 여부 필드 추가 (Y: 정지, N: 정상, 기본값: N)
ALTER TABLE MEMBER1 ADD (
    IS_SUSPENDED VARCHAR2(1) DEFAULT 'N'
);

-- 2. 정지 시작일 필드 추가
ALTER TABLE MEMBER1 ADD (
    SUSPEND_START_DATE DATE
);

-- 3. 정지 종료일 필드 추가
ALTER TABLE MEMBER1 ADD (
    SUSPEND_END_DATE DATE
);

-- 4. 정지 사유 필드 추가
ALTER TABLE MEMBER1 ADD (
    SUSPEND_REASON VARCHAR2(500)
);

-- 5. 기존 데이터의 IS_SUSPENDED를 'N'으로 업데이트 (NULL인 경우)
UPDATE MEMBER1 SET IS_SUSPENDED = 'N' WHERE IS_SUSPENDED IS NULL;

-- 6. 인덱스 생성 (계정 정지 여부로 검색 시 성능 향상)
CREATE INDEX IDX_MEMBER1_SUSPENDED ON MEMBER1(IS_SUSPENDED);
```

### 2. 경매 게시글 테이블 (IMAGEBOARD1)

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
    MAX_BID_PRICE NUMBER DEFAULT NULL,       -- 최고 낙찰 가격 (즉시 구매 가격, 선택사항)
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

### 기존 IMAGEBOARD1 테이블에 MAX_BID_PRICE 필드 추가 (ALTER TABLE)

기존에 IMAGEBOARD1 테이블이 이미 생성되어 있는 경우, 아래 SQL을 실행하여 최고 낙찰 가격 필드를 추가할 수 있습니다:

```sql
-- 1. IMAGEBOARD1 테이블에 MAX_BID_PRICE 컬럼 추가
ALTER TABLE IMAGEBOARD1 
ADD MAX_BID_PRICE NUMBER DEFAULT NULL;

-- 2. 컬럼 설명 추가 (주석)
COMMENT ON COLUMN IMAGEBOARD1.MAX_BID_PRICE IS '최고 낙찰 가격 (즉시 구매 가격, 선택사항)';

-- 3. 인덱스 생성 (선택사항 - 최고 낙찰 가격으로 검색이 필요한 경우)
-- CREATE INDEX IDX_IMAGEBOARD1_MAX_BID_PRICE ON IMAGEBOARD1(MAX_BID_PRICE);
```

### 3. 경매 게시글 이미지 테이블 (IMAGEBOARD_IMAGES1)

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
```

### 4. 입찰 테이블 (BID1)

```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_BID1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

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
```

### 5. 공지사항 테이블 (NOTICE1)

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

### 6. 팝업 테이블 (POPUP1)

```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_POPUP1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- 팝업 테이블 생성
CREATE TABLE POPUP1 (
    POPUP_SEQ NUMBER PRIMARY KEY,            -- 팝업 번호 (PK, 시퀀스)
    POPUP_TITLE VARCHAR2(200),                -- 팝업 제목
    POPUP_CONTENT CLOB,                      -- 팝업 내용
    BACKGROUND_IMAGE VARCHAR2(200),          -- 백그라운드 이미지 경로
    IS_VISIBLE VARCHAR2(1) DEFAULT 'N',     -- 노출 여부 (Y: 노출, N: 비노출)
    POPUP_TYPE VARCHAR2(50),                 -- 팝업 타입 (이벤트, 초특가, 공지사항)
    START_DATE DATE,                         -- 노출 시작일
    END_DATE DATE,                           -- 노출 종료일
    LOGTIME DATE DEFAULT SYSDATE             -- 등록일시
);

-- 인덱스 생성
CREATE INDEX IDX_POPUP1_SEQ ON POPUP1(POPUP_SEQ);
CREATE INDEX IDX_POPUP1_VISIBLE ON POPUP1(IS_VISIBLE);
CREATE INDEX IDX_POPUP1_TYPE ON POPUP1(POPUP_TYPE);
```

### 7. 관리자 테이블 (MANAGER1)

```sql
-- 관리자 테이블 생성
CREATE TABLE MANAGER1 (
    MANAGER_ID VARCHAR2(50) PRIMARY KEY,        -- 관리자 ID (PK)
    MANAGER_NAME VARCHAR2(50) NOT NULL,          -- 관리자 이름
    MANAGER_PWD VARCHAR2(100) NOT NULL,          -- 비밀번호
    MANAGER_EMAIL VARCHAR2(100),                 -- 이메일
    MANAGER_TEL VARCHAR2(20),                    -- 전화번호
    MANAGER_ROLE VARCHAR2(20) DEFAULT '관리자',  -- 권한 (관리자, 슈퍼관리자)
    LOGTIME DATE DEFAULT SYSDATE,                -- 등록일시
    LAST_LOGIN DATE                              -- 마지막 로그인 시간
);

-- 인덱스 생성
CREATE INDEX IDX_MANAGER1_ID ON MANAGER1(MANAGER_ID);
CREATE INDEX IDX_MANAGER1_ROLE ON MANAGER1(MANAGER_ROLE);
```

### 8. 트리거 생성 (선택사항)

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

## 📋 주요 쿼리 예제

### 회원 관련 쿼리
```sql
-- 회원 가입
INSERT INTO MEMBER1 (NAME, ID, NICKNAME, PWD, GENDER, EMAIL1, EMAIL2, TEL1, TEL2, TEL3, ADDR, LOGTIME)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSDATE);

-- 아이디 중복 확인
SELECT COUNT(*) FROM MEMBER1 WHERE ID = ?;

-- 로그인 확인
SELECT ID, NAME, NICKNAME FROM MEMBER1 WHERE ID = ? AND PWD = ?;
```

### 경매 게시글 관련 쿼리
```sql
-- 경매 게시글 목록 조회 (페이징)
SELECT * FROM (
    SELECT ROWNUM RN, A.* FROM (
        SELECT * FROM IMAGEBOARD1 
        WHERE STATUS = '진행중'
        ORDER BY SEQ DESC
    ) A
) WHERE RN BETWEEN ? AND ?;

-- 경매별 입찰 수 조회
SELECT COUNT(*) AS BID_COUNT 
FROM BID1 
WHERE IMAGEBOARD_SEQ = ? AND STATUS = '유효';
```

### 입찰 관련 쿼리
```sql
-- 입찰 등록
INSERT INTO BID1 (BID_SEQ, IMAGEBOARD_SEQ, BIDDER_ID, BID_AMOUNT, BID_TIME, STATUS)
VALUES (SEQ_BID1.NEXTVAL, ?, ?, ?, SYSDATE, '유효');

-- 경매별 최고 입찰 금액 조회
SELECT MAX(BID_AMOUNT) AS MAX_BID 
FROM BID1 
WHERE IMAGEBOARD_SEQ = ? AND STATUS = '유효';
```

## 🔗 필드 매핑 정리

### WriteForm.jsx → MEMBER1 테이블
- name → NAME
- id → ID
- nickname → NICKNAME
- pwd → PWD
- gender → GENDER
- email1 → EMAIL1
- email2 → EMAIL2
- tel1 → TEL1
- tel2 → TEL2
- tel3 → TEL3
- addr → ADDR
- logtime → LOGTIME (자동)

### ImageboardWriteForm.jsx → IMAGEBOARD1 테이블
- productName → IMAGENAME
- category → CATEGORY
- startPrice → IMAGEPRICE
- auctionPeriod → AUCTION_PERIOD
- transactionMethod → TRANSACTION_METHOD
- description → IMAGECONTENT
- imageFiles → IMAGEBOARD_IMAGES1 테이블에 다중 저장
- image1 → IMAGE1 (대표 이미지)

## ⚠️ 주의사항

1. **비밀번호 암호화**: 실제 운영 환경에서는 PWD 필드에 평문 비밀번호를 저장하지 말고 해시값을 저장해야 합니다.
2. **이미지 파일 저장**: 이미지 파일은 서버 파일 시스템에 저장하고, DB에는 파일 경로만 저장합니다.
3. **트랜잭션 처리**: 입찰 등록 시 동시성 제어가 필요합니다.
4. **인덱스 최적화**: 대용량 데이터 처리를 위해 적절한 인덱스를 생성했습니다.
5. **외래키 제약조건**: 데이터 무결성을 위해 외래키 제약조건을 설정했습니다.

## 📖 참고 문서

- **DB.md**: 상세한 데이터베이스 스키마 및 쿼리 예제
- **CSS.md**: CSS 관리 및 스타일셋 구조
