# 데이터베이스 셋팅 가이드

## 📋 개요
새로운 PC에 Oracle DB를 셋팅할 때 참고할 문서 및 쿼리 파일 목록입니다.

---

## 📚 관련 문서 및 파일 목록

### 1. **DB.md** - 메인 페이지 DB 생성
- **목적**: 골드 경매 시스템의 핵심 테이블 구조 및 쿼리
- **포함 내용**:
  - 회원 테이블 (MEMBER1)
  - 경매 게시글 테이블 (IMAGEBOARD1)
  - 경매 게시글 이미지 테이블 (IMAGEBOARD_IMAGES1)
  - 입찰 테이블 (BID1)
  - 공지사항 테이블 (NOTICE1)
  - 팝업 테이블 (POPUP1)
  - 관리자 테이블 (MANAGER1)
  - CSS 스타일셋 테이블 (CSS_SET1, CSS_FILE1, CSS_APPLY1)
- **사용 시점**: 골드 경매 시스템의 기본 테이블 생성 시
- **실행 순서**: 문서 내 순서대로 실행 (외래키 제약조건 고려)

### 2. **DB_board.md** - 게시판 & 이벤트 게시판 생성
- **목적**: 게시판 관리자 모드 시스템의 테이블 구조 및 쿼리
- **포함 내용**:
  - 게시판 테이블 (BOARD1)
  - 게시글 테이블 (BOARD_POST1)
  - 댓글 테이블 (BOARD_COMMENT1)
  - 게시글 첨부파일 테이블 (BOARD_POST_FILE1)
  - 공구이벤트 상품 테이블 (EVENT_PRODUCT1)
  - 공구이벤트 상품 이미지 테이블 (EVENT_PRODUCT_IMAGE1)
  - 공구이벤트 상품 옵션 테이블 (EVENT_PRODUCT_OPTION1)
  - 공동구매 주문 테이블 (EVENT_ORDER1)
  - 비속어 필터 테이블 (PROFANITY_FILTER1)
  - 게시판별 공지사항 설정 테이블 (BOARD_NOTICE_SETTING1)
  - 알림 테이블 (BOARD_NOTIFICATION1)
- **사용 시점**: 게시판 기능 관련 테이블 생성 시
- **실행 순서**: DB.md 완료 후 실행, 문서 내 순서대로 실행 (외래키 제약조건 고려)

### 3. **DB_CHECK_QUERIES.md** - 확인용 쿼리문 모음
- **목적**: DB 셋팅 후 테이블/시퀀스/제약조건 확인용 쿼리
- **포함 내용**:
  - 테이블 존재 여부 확인
  - 시퀀스 존재 여부 확인
  - 테이블 구조 확인
  - 제약조건 확인
  - 인덱스 확인
  - 데이터 확인
- **사용 시점**: DB 셋팅 완료 후 검증 단계

### 4. **DB_sample.md** - 입력할 샘플 쿼리문
- **목적**: 테스트용 샘플 데이터 입력 쿼리 모음
- **포함 내용**:
  - 메인 DB 샘플 데이터 (회원, 경매, 입찰, 관리자, 팝업, CSS 등)
  - 게시판 DB 샘플 데이터 (게시판, 게시글, 댓글, 공구이벤트, 주문 등)
- **사용 시점**: DB.md와 DB_board.md의 테이블 생성 완료 후 실행

---

## 🚀 새로운 PC에 DB 셋팅 순서

### Step 1: 메인 DB 테이블 생성 (DB.md)
1. **DB.md** 파일을 열고 순서대로 실행:
   ```
   1. MEMBER1 (회원 테이블) - 가장 먼저!
   2. MANAGER1 (관리자 테이블)
   3. IMAGEBOARD1 (경매 게시글 테이블)
   4. IMAGEBOARD_IMAGES1 (경매 게시글 이미지 테이블)
   5. BID1 (입찰 테이블)
   6. NOTICE1 (공지사항 테이블)
   7. POPUP1 (팝업 테이블)
   8. CSS_SET1 (CSS 스타일셋 테이블)
   9. CSS_FILE1 (CSS 파일 테이블)
   10. CSS_APPLY1 (CSS 적용 설정 테이블)
   ```
2. 각 테이블의 "테이블 생성" 섹션의 SQL을 순서대로 실행
3. 각 테이블의 "인덱스 생성" 섹션의 SQL도 함께 실행

### Step 2: 게시판 DB 테이블 생성 (DB_board.md)
1. **DB_board.md** 파일을 열고 순서대로 실행:
   ```
   1. BOARD1 (게시판 테이블) - 가장 먼저!
   2. BOARD_POST1 (게시글 테이블)
   3. BOARD_COMMENT1 (댓글 테이블)
   4. BOARD_POST_FILE1 (게시글 첨부파일 테이블)
   5. EVENT_PRODUCT1 (공구이벤트 상품 테이블)
   6. EVENT_PRODUCT_IMAGE1 (공구이벤트 상품 이미지 테이블)
   7. EVENT_PRODUCT_OPTION1 (공구이벤트 상품 옵션 테이블)
   8. EVENT_ORDER1 (공동구매 주문 테이블)
   9. PROFANITY_FILTER1 (비속어 필터 테이블)
   10. BOARD_NOTICE_SETTING1 (게시판별 공지사항 설정 테이블)
   11. BOARD_NOTIFICATION1 (알림 테이블) - 선택사항
   ```
2. 각 테이블의 "테이블 생성" 섹션의 SQL을 순서대로 실행
3. 각 테이블의 "인덱스 생성" 섹션의 SQL도 함께 실행

### Step 3: DB 검증 (DB_CHECK_QUERIES.md)
1. **DB_CHECK_QUERIES.md** 파일의 쿼리문을 사용하여 다음 사항 확인:
   - 모든 테이블이 정상적으로 생성되었는지 확인
   - 시퀀스가 정상적으로 생성되었는지 확인
   - 제약조건이 올바르게 설정되었는지 확인
   - 인덱스가 정상적으로 생성되었는지 확인

### Step 4: 샘플 데이터 입력 (DB_sample.md)
1. **DB_sample.md** 파일을 참고하여 테스트용 샘플 데이터 입력
2. Step 1과 Step 2의 순서를 따라 샘플 데이터 입력
3. 외래키 제약조건을 고려하여 순서대로 실행

---

## ⚠️ 주의사항

1. **외래키 제약조건**: 테이블 생성 순서를 반드시 지켜야 합니다. 참조되는 테이블이 먼저 생성되어야 합니다.
   - MEMBER1 → IMAGEBOARD1, BOARD_POST1, BID1 등
   - BOARD1 → BOARD_POST1, EVENT_PRODUCT1 등
   - IMAGEBOARD1 → IMAGEBOARD_IMAGES1, BID1 등

2. **시퀀스**: 각 테이블의 시퀀스가 정상적으로 생성되었는지 확인하세요.

3. **인덱스**: 성능 최적화를 위해 인덱스 생성도 함께 수행하세요.

4. **데이터 타입**: Oracle DB의 데이터 타입(VARCHAR2, NUMBER, DATE, CLOB 등)을 정확히 사용하세요.

5. **트랜잭션**: 테이블 생성 시 오류가 발생하면 ROLLBACK을 실행하세요.

---

## 📝 참고사항

- 각 문서에는 테이블 생성 쿼리, 샘플 데이터 삽입 쿼리, ALTER TABLE 쿼리 등이 포함되어 있습니다.
- 기존 테이블에 컬럼을 추가하는 경우, 각 문서의 "기존 테이블에 필드 추가" 섹션을 참고하세요.
- 문제가 발생하면 **DB_CHECK_QUERIES.md**의 확인 쿼리를 사용하여 원인을 파악하세요.
- 샘플 데이터는 **DB_sample.md** 파일에 모아두었습니다. 테스트용으로만 사용하세요.

---

## 🔄 실행 체크리스트

- [ ] Step 1: DB.md의 모든 테이블 생성 완료
- [ ] Step 2: DB_board.md의 모든 테이블 생성 완료
- [ ] Step 3: DB_CHECK_QUERIES.md로 검증 완료
- [ ] Step 4: DB_sample.md로 샘플 데이터 입력 완료
