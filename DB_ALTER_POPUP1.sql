-- 팝업 테이블 생성 SQL
-- Oracle DB에서 실행하세요

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
    IS_VISIBLE VARCHAR2(1) DEFAULT 'N',       -- 노출 여부 (Y: 노출, N: 비노출)
    POPUP_TYPE VARCHAR2(50),                 -- 팝업 타입 (이벤트, 초특가, 공지사항)
    START_DATE DATE,                         -- 노출 시작일
    END_DATE DATE,                           -- 노출 종료일
    LOGTIME DATE DEFAULT SYSDATE             -- 등록일시
);

-- 인덱스 생성
CREATE INDEX IDX_POPUP1_SEQ ON POPUP1(POPUP_SEQ);
CREATE INDEX IDX_POPUP1_VISIBLE ON POPUP1(IS_VISIBLE);
CREATE INDEX IDX_POPUP1_TYPE ON POPUP1(POPUP_TYPE);

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO POPUP1 (POPUP_SEQ, POPUP_TITLE, POPUP_CONTENT, BACKGROUND_IMAGE, IS_VISIBLE, POPUP_TYPE, START_DATE, END_DATE, LOGTIME)
VALUES (SEQ_POPUP1.NEXTVAL, '신규 회원 이벤트', '신규 회원 가입 시 특별 혜택을 드립니다!', 'event_bg.jpg', 'Y', '이벤트', SYSDATE, SYSDATE + 30, SYSDATE);

INSERT INTO POPUP1 (POPUP_SEQ, POPUP_TITLE, POPUP_CONTENT, BACKGROUND_IMAGE, IS_VISIBLE, POPUP_TYPE, START_DATE, END_DATE, LOGTIME)
VALUES (SEQ_POPUP1.NEXTVAL, '초특가 경매 안내', '한정 기간 초특가 경매가 진행 중입니다.', 'special_bg.jpg', 'N', '초특가', SYSDATE, SYSDATE + 7, SYSDATE);

COMMIT;

