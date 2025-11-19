# Gold Auction Database Schema (Oracle DB)

## 개요
골드 경매 시스템의 Oracle 데이터베이스 테이블 구조 및 SQL 쿼리 문서입니다.

---

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
```

### 샘플 데이터 삽입
```sql
-- 회원 가입 샘플 데이터
INSERT INTO MEMBER1 (NAME, ID, NICKNAME, PWD, GENDER, EMAIL1, EMAIL2, TEL1, TEL2, TEL3, ADDR, LOGTIME)
VALUES ('홍길동', 'hong123', '홍홍', 'password123', '남', 'hong', 'gmail.com', '010', '1234', '5678', '서울시 강남구', SYSDATE);

INSERT INTO MEMBER1 (NAME, ID, NICKNAME, PWD, GENDER, EMAIL1, EMAIL2, TEL1, TEL2, TEL3, ADDR, LOGTIME)
VALUES ('판매자1', 'sell1', '팔아보아요', '1111', '남', 'hong', 'gmail.com', '010', '1234', '5678', '거래시 왕호구', SYSDATE);

INSERT INTO MEMBER1 (NAME, ID, NICKNAME, PWD, GENDER, EMAIL1, EMAIL2, TEL1, TEL2, TEL3, ADDR, LOGTIME)
VALUES ('김영희', 'kim456', '영영', 'password456', '여', 'kim', 'naver.com', '010', '2345', '6789', '서울시 서초구', SYSDATE);
```

---

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

### 샘플 데이터 삽입
```sql
-- 경매 게시글 샘플 데이터
INSERT INTO IMAGEBOARD1 (SEQ, IMAGEID, IMAGENAME, IMAGEPRICE, IMAGECONTENT, IMAGE1, CATEGORY, AUCTION_PERIOD, TRANSACTION_METHOD, AUCTION_START_DATE, AUCTION_END_DATE, STATUS, LOGTIME)
VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'hong123', '웰치스 골드바', 1200, '순금 99.9% 골드바입니다.', 'goldbar1.jpg', '골드', '7일후', '직거래', SYSDATE, SYSDATE + 7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 (SEQ, IMAGEID, IMAGENAME, IMAGEPRICE, IMAGECONTENT, IMAGE1, CATEGORY, AUCTION_PERIOD, TRANSACTION_METHOD, AUCTION_START_DATE, AUCTION_END_DATE, STATUS, LOGTIME)
VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'kim456', '실버 코인 세트', 800, '은화 코인 10개 세트입니다.', 'silvercoin1.jpg', '실버', '14일후', '매장방문', SYSDATE, SYSDATE + 14, '진행중', SYSDATE);
```

---

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
```

### 샘플 데이터 삽입
```sql
-- 경매 게시글 이미지 샘플 데이터
INSERT INTO IMAGEBOARD_IMAGES1 (IMG_SEQ, IMAGEBOARD_SEQ, IMAGE_PATH, IMAGE_ORDER, UPLOAD_DATE)
VALUES (SEQ_IMAGEBOARD_IMAGES1.NEXTVAL, 1, 'goldbar1.jpg', 1, SYSDATE);

INSERT INTO IMAGEBOARD_IMAGES1 (IMG_SEQ, IMAGEBOARD_SEQ, IMAGE_PATH, IMAGE_ORDER, UPLOAD_DATE)
VALUES (SEQ_IMAGEBOARD_IMAGES1.NEXTVAL, 1, 'goldbar2.jpg', 2, SYSDATE);

INSERT INTO IMAGEBOARD_IMAGES1 (IMG_SEQ, IMAGEBOARD_SEQ, IMAGE_PATH, IMAGE_ORDER, UPLOAD_DATE)
VALUES (SEQ_IMAGEBOARD_IMAGES1.NEXTVAL, 1, 'goldbar3.jpg', 3, SYSDATE);
```

---

## 4. 입찰 테이블 (BID1)

### 테이블 생성
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
```sql



```
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

---

## 6. 주요 쿼리 예제

### 회원 관련 쿼리

```sql
-- 회원 가입
INSERT INTO MEMBER1 (NAME, ID, NICKNAME, PWD, GENDER, EMAIL1, EMAIL2, TEL1, TEL2, TEL3, ADDR, LOGTIME)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSDATE);

-- 아이디 중복 확인
SELECT COUNT(*) FROM MEMBER1 WHERE ID = ?;

-- 로그인 확인
SELECT ID, NAME, NICKNAME FROM MEMBER1 WHERE ID = ? AND PWD = ?;

-- 회원 정보 조회
SELECT * FROM MEMBER1 WHERE ID = ?;

-- 회원 정보 수정
UPDATE MEMBER1 
SET PWD = ?, EMAIL1 = ?, EMAIL2 = ?, TEL1 = ?, TEL2 = ?, TEL3 = ?, ADDR = ?
WHERE ID = ?;
```

### 경매 게시글 관련 쿼리

```sql
-- 경매 게시글 등록
INSERT INTO IMAGEBOARD1 (SEQ, IMAGEID, IMAGENAME, IMAGEPRICE, IMAGECONTENT, IMAGE1, CATEGORY, AUCTION_PERIOD, TRANSACTION_METHOD, AUCTION_START_DATE, AUCTION_END_DATE, STATUS, LOGTIME)
VALUES (SEQ_IMAGEBOARD1.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, SYSDATE, 
        CASE 
            WHEN ? = '7일후' THEN SYSDATE + 7
            WHEN ? = '14일후' THEN SYSDATE + 14
            WHEN ? = '21일후' THEN SYSDATE + 21
            WHEN ? = '30일후' THEN SYSDATE + 30
        END, '진행중', SYSDATE);

-- 경매 게시글 목록 조회 (페이징)
SELECT * FROM (
    SELECT ROWNUM RN, A.* FROM (
        SELECT * FROM IMAGEBOARD1 
        WHERE STATUS = '진행중'
        ORDER BY SEQ DESC
    ) A
) WHERE RN BETWEEN ? AND ?;

-- 경매 게시글 검색 (상품명)
SELECT * FROM (
    SELECT ROWNUM RN, A.* FROM (
        SELECT * FROM IMAGEBOARD1 
        WHERE IMAGENAME LIKE '%' || ? || '%'
        ORDER BY SEQ DESC
    ) A
) WHERE RN BETWEEN ? AND ?;

-- 경매 게시글 카테고리별 조회
SELECT * FROM (
    SELECT ROWNUM RN, A.* FROM (
        SELECT * FROM IMAGEBOARD1 
        WHERE CATEGORY = ? AND STATUS = '진행중'
        ORDER BY SEQ DESC
    ) A
) WHERE RN BETWEEN ? AND ?;

-- 경매 게시글 상세 조회
SELECT * FROM IMAGEBOARD1 WHERE SEQ = ?;

-- 경매 게시글 수정
UPDATE IMAGEBOARD1 
SET IMAGENAME = ?, IMAGEPRICE = ?, IMAGECONTENT = ?, IMAGE1 = ?, 
    CATEGORY = ?, AUCTION_PERIOD = ?, TRANSACTION_METHOD = ?
WHERE SEQ = ?;

-- 경매 게시글 삭제
DELETE FROM IMAGEBOARD1 WHERE SEQ = ?;

-- 경매 종료일 계산 업데이트
UPDATE IMAGEBOARD1 
SET AUCTION_END_DATE = 
    CASE 
        WHEN AUCTION_PERIOD = '7일후' THEN AUCTION_START_DATE + 7
        WHEN AUCTION_PERIOD = '14일후' THEN AUCTION_START_DATE + 14
        WHEN AUCTION_PERIOD = '21일후' THEN AUCTION_START_DATE + 21
        WHEN AUCTION_PERIOD = '30일후' THEN AUCTION_START_DATE + 30
    END
WHERE SEQ = ?;

-- 경매 상태 자동 업데이트 (종료된 경매)
UPDATE IMAGEBOARD1 
SET STATUS = '종료'
WHERE STATUS = '진행중' AND AUCTION_END_DATE < SYSDATE;
```

### 이미지 관련 쿼리

```sql
-- 이미지 등록
INSERT INTO IMAGEBOARD_IMAGES1 (IMG_SEQ, IMAGEBOARD_SEQ, IMAGE_PATH, IMAGE_ORDER, UPLOAD_DATE)
VALUES (SEQ_IMAGEBOARD_IMAGES1.NEXTVAL, ?, ?, ?, SYSDATE);

-- 게시글별 이미지 조회
SELECT * FROM IMAGEBOARD_IMAGES1 
WHERE IMAGEBOARD_SEQ = ? 
ORDER BY IMAGE_ORDER;

-- 이미지 삭제
DELETE FROM IMAGEBOARD_IMAGES1 WHERE IMG_SEQ = ?;
```

### 입찰 관련 쿼리

```sql
-- 입찰 등록
INSERT INTO BID1 (BID_SEQ, IMAGEBOARD_SEQ, BIDDER_ID, BID_AMOUNT, BID_TIME, STATUS)
VALUES (SEQ_BID1.NEXTVAL, ?, ?, ?, SYSDATE, '유효');

-- 경매별 입찰 목록 조회 (금액 높은 순)
SELECT * FROM BID1 
WHERE IMAGEBOARD_SEQ = ? AND STATUS = '유효'
ORDER BY BID_AMOUNT DESC, BID_TIME DESC;

-- 경매별 최고 입찰 금액 조회
SELECT MAX(BID_AMOUNT) AS MAX_BID 
FROM BID1 
WHERE IMAGEBOARD_SEQ = ? AND STATUS = '유효';

-- 경매별 입찰 수 조회
SELECT COUNT(*) AS BID_COUNT 
FROM BID1 
WHERE IMAGEBOARD_SEQ = ? AND STATUS = '유효';

-- 입찰자별 입찰 내역 조회
SELECT * FROM BID1 
WHERE BIDDER_ID = ? 
ORDER BY BID_TIME DESC;
```

### 통계 쿼리

```sql
-- 카테고리별 경매 게시글 수
SELECT CATEGORY, COUNT(*) AS CNT 
FROM IMAGEBOARD1 
WHERE STATUS = '진행중'
GROUP BY CATEGORY;

-- 회원별 등록한 경매 게시글 수
SELECT IMAGEID, COUNT(*) AS CNT 
FROM IMAGEBOARD1 
GROUP BY IMAGEID;

-- 회원별 입찰 횟수
SELECT BIDDER_ID, COUNT(*) AS BID_COUNT 
FROM BID1 
GROUP BY BIDDER_ID;
```

---

## 7. 뷰 생성 (선택사항)

```sql
-- 경매 게시글 상세 정보 뷰 (이미지 포함)
CREATE OR REPLACE VIEW V_IMAGEBOARD1_DETAIL AS
SELECT 
    IB.SEQ,
    IB.IMAGEID,
    IB.IMAGENAME,
    IB.IMAGEPRICE,
    IB.IMAGECONTENT,
    IB.CATEGORY,
    IB.AUCTION_PERIOD,
    IB.TRANSACTION_METHOD,
    IB.AUCTION_START_DATE,
    IB.AUCTION_END_DATE,
    IB.STATUS,
    IB.LOGTIME,
    M.NAME AS WRITER_NAME,
    M.NICKNAME AS WRITER_NICKNAME,
    (SELECT MAX(BID_AMOUNT) FROM BID1 WHERE IMAGEBOARD_SEQ = IB.SEQ AND STATUS = '유효') AS MAX_BID_AMOUNT,
    (SELECT COUNT(*) FROM BID1 WHERE IMAGEBOARD_SEQ = IB.SEQ AND STATUS = '유효') AS BID_COUNT
FROM IMAGEBOARD1 IB
LEFT JOIN MEMBER1 M ON IB.IMAGEID = M.ID;
```

---

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

---

## 9. 테이블 삭제 순서 (주의: 데이터 삭제됨)

```sql
-- 외래키 제약조건 때문에 역순으로 삭제
DROP TABLE BID1;
DROP TABLE IMAGEBOARD_IMAGES1;
DROP TABLE IMAGEBOARD1;
DROP TABLE NOTICE1;
DROP TABLE MEMBER1;

-- 시퀀스 삭제
DROP SEQUENCE SEQ_BID1;
DROP SEQUENCE SEQ_IMAGEBOARD_IMAGES1;
DROP SEQUENCE SEQ_IMAGEBOARD1;
DROP SEQUENCE SEQ_NOTICE1;
```

---

## 10. 필드 매핑 정리

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

### ImageboardView.jsx → 조회
- imageboardData.imagename → IMAGENAME
- imageboardData.imageprice → IMAGEPRICE
- imageboardData.imagecontent → IMAGECONTENT
- currentHighestBid → BID1 테이블에서 MAX(BID_AMOUNT) 조회
- bidList → BID1 테이블에서 조회

---

## 11. 주의사항

1. **비밀번호 암호화**: 실제 운영 환경에서는 PWD 필드에 평문 비밀번호를 저장하지 말고 해시값을 저장해야 합니다.
2. **이미지 파일 저장**: 이미지 파일은 서버 파일 시스템에 저장하고, DB에는 파일 경로만 저장합니다.
3. **트랜잭션 처리**: 입찰 등록 시 동시성 제어가 필요합니다.
4. **인덱스 최적화**: 대용량 데이터 처리를 위해 적절한 인덱스를 생성했습니다.
5. **외래키 제약조건**: 데이터 무결성을 위해 외래키 제약조건을 설정했습니다.

---

## 12. 추가 개선 사항

1. **입찰 알림 기능**: 입찰 시 이메일/알림 발송을 위한 알림 테이블 추가 고려
2. **경매 관심 목록**: 사용자별 관심 경매 저장을 위한 관심목록 테이블 추가 고려
3. **리뷰/평가 기능**: 거래 완료 후 리뷰 작성 기능을 위한 리뷰 테이블 추가 고려
4. **채팅 기능**: 거래자 간 소통을 위한 채팅 테이블 추가 고려

-------------------------------------------------------------------------

### 샘플 데이터 삽입
-- 입찰 샘플 데이터

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '골드바 10g', 1200000, 1, '고순도 99.9% 골드바입니다.', 'img_001.jpg', '골드', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '실버바 100g', 45000, 1, '92.5% 정제된 실버바입니다.', 'img_002.jpg', '실버', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '백금 코인', 980000, 1, '순도 높은 플래티넘 코인입니다.', 'img_003.jpg', '백금', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '다이아 원석 1캐럿', 3500000, 1, '투명도와 광채가 뛰어난 다이아몬드 원석입니다.', 'img_004.jpg', '다이아', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell3', '귀금속 팔찌 18K', 270000, 1, '18K 귀금속 팔찌입니다.', 'img_005.jpg', '귀금속', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '한국 기념주화', 85000, 1, '한국 조폐공사 발행 기념주화입니다.', 'img_006.jpg', '주화', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '정련 골드 분말', 150000, 1, '금은정련 고순도 골드 파우더입니다.', 'img_007.jpg', '금은정련', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '골드 코인 24K', 890000, 1, '24K 순금 골드 코인입니다.', 'img_008.jpg', '골드', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell3', '실버 메달', 25000, 1, '투자용 실버 메달입니다.', 'img_009.jpg', '실버', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '백금 반지 PT950', 720000, 1, '플래티넘 PT950 백금 반지입니다.', 'img_010.jpg', '백금', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '다이아 목걸이 1캐럿', 5800000, 1, '1캐럿 다이아몬드 목걸이입니다.', 'img_011.jpg', '다이아', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '귀금속 귀걸이 14K', 180000, 1, '14K 귀금속 귀걸이입니다.', 'img_012.jpg', '귀금속', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '기념 금화 한정판', 310000, 1, '한정판 기념 금화입니다.', 'img_013.jpg', '주화', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell3', '정련 은 분말', 60000, 1, '정련된 고순도 은 분말입니다.', 'img_014.jpg', '금은정련', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell3', '골드바 5g', 650000, 1, '보관이 편한 5g 골드바입니다.', 'img_015.jpg', '골드', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '실버 코인', 30000, 1, '투자용 실버 코인입니다.', 'img_016.jpg', '실버', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '백금 팔찌', 820000, 1, '백금으로 제작된 고품질 팔찌입니다.', 'img_017.jpg', '백금', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '다이아 반지 0.5캐럿', 2400000, 1, '고품질 0.5캐럿 다이아 반지입니다.', 'img_018.jpg', '다이아', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell2', '귀금속 체인 18K', 350000, 1, '18K 귀금속 체인 목걸이입니다.', 'img_019.jpg', '귀금속', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);

INSERT INTO IMAGEBOARD1 VALUES (SEQ_IMAGEBOARD1.NEXTVAL, 'sell1', '정련 금속 샘플', 200000, 1, '금·은 정련된 금속 샘플입니다.', 'img_020.jpg', '금은정련', '7일후', '직거래', SYSDATE, SYSDATE+7, '진행중', SYSDATE);


