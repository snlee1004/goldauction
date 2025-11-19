-- 최고 낙찰 가격 필드 추가를 위한 DB 스키마 변경 스크립트
-- 실행 전 반드시 백업을 수행하세요!

-- 1. IMAGEBOARD1 테이블에 MAX_BID_PRICE 컬럼 추가
ALTER TABLE IMAGEBOARD1 
ADD MAX_BID_PRICE NUMBER DEFAULT NULL;

-- 2. 컬럼 설명 추가 (주석)
COMMENT ON COLUMN IMAGEBOARD1.MAX_BID_PRICE IS '최고 낙찰 가격 (즉시 구매 가격, 선택사항)';

-- 3. 기존 데이터 확인 (선택사항)
-- SELECT SEQ, IMAGENAME, IMAGEPRICE, MAX_BID_PRICE FROM IMAGEBOARD1;

-- 4. 인덱스 생성 (선택사항 - 최고 낙찰 가격으로 검색이 필요한 경우)
-- CREATE INDEX IDX_IMAGEBOARD1_MAX_BID_PRICE ON IMAGEBOARD1(MAX_BID_PRICE);

