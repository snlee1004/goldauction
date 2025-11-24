# Oracle DB 확인 쿼리 모음

## 📋 게시판 생성 실패 원인 확인 방법

### 1. 테이블 존재 여부 확인
```sql
-- BOARD1 테이블이 존재하는지 확인
SELECT table_name 
FROM user_tables 
WHERE table_name = 'BOARD1';

-- 또는 모든 게시판 관련 테이블 확인
SELECT table_name 
FROM user_tables 
WHERE table_name LIKE 'BOARD%' OR table_name LIKE 'EVENT%'
ORDER BY table_name;
```

### 2. 시퀀스 존재 여부 확인
```sql
-- SEQ_BOARD1 시퀀스가 존재하는지 확인
SELECT sequence_name, min_value, max_value, increment_by, last_number
FROM user_sequences 
WHERE sequence_name = 'SEQ_BOARD1';

-- 또는 모든 게시판 관련 시퀀스 확인
SELECT sequence_name, last_number
FROM user_sequences 
WHERE sequence_name LIKE 'SEQ_BOARD%' OR sequence_name LIKE 'SEQ_EVENT%'
ORDER BY sequence_name;
```

### 3. 테이블 구조 확인
```sql
-- BOARD1 테이블의 컬럼 정보 확인
SELECT column_name, data_type, data_length, nullable, data_default
FROM user_tab_columns 
WHERE table_name = 'BOARD1'
ORDER BY column_id;

-- 또는 DESC 명령어 사용
DESC BOARD1;
```

### 4. 제약조건 확인
```sql
-- BOARD1 테이블의 제약조건 확인
SELECT constraint_name, constraint_type, search_condition
FROM user_constraints 
WHERE table_name = 'BOARD1';

-- 외래키 제약조건 확인
SELECT 
    a.constraint_name,
    a.table_name,
    a.column_name,
    c.table_name AS foreign_table_name,
    c.column_name AS foreign_column_name
FROM user_cons_columns a
JOIN user_constraints b ON a.constraint_name = b.constraint_name
JOIN user_cons_columns c ON b.r_constraint_name = c.constraint_name
WHERE b.constraint_type = 'R' AND a.table_name = 'BOARD1';
```

### 5. 인덱스 확인
```sql
-- BOARD1 테이블의 인덱스 확인
SELECT index_name, index_type, uniqueness, table_name
FROM user_indexes 
WHERE table_name = 'BOARD1';
```

### 6. 현재 데이터 확인
```sql
-- BOARD1 테이블의 모든 데이터 조회
SELECT * FROM BOARD1 ORDER BY BOARD_SEQ;

-- 게시판 개수 확인
SELECT COUNT(*) AS total_boards FROM BOARD1;
SELECT COUNT(*) AS active_boards FROM BOARD1 WHERE IS_ACTIVE = 'Y';
```

### 7. 시퀀스 현재 값 확인
```sql
-- SEQ_BOARD1 시퀀스의 현재 값 확인
SELECT SEQ_BOARD1.CURRVAL FROM DUAL;

-- 다음 값 확인 (주의: 시퀀스가 한 번이라도 사용되어야 CURRVAL 사용 가능)
SELECT SEQ_BOARD1.NEXTVAL FROM DUAL;
```

### 8. 테이블 생성 스크립트 확인
```sql
-- BOARD1 테이블의 DDL 확인
SELECT dbms_metadata.get_ddl('TABLE', 'BOARD1') FROM DUAL;

-- 시퀀스 DDL 확인
SELECT dbms_metadata.get_ddl('SEQUENCE', 'SEQ_BOARD1') FROM DUAL;
```

### 9. 권한 확인
```sql
-- 현재 사용자의 테이블 권한 확인
SELECT * FROM user_tab_privs WHERE table_name = 'BOARD1';

-- 현재 사용자의 시퀀스 권한 확인
SELECT * FROM user_tab_privs WHERE table_name = 'SEQ_BOARD1';
```

### 10. 최근 에러 로그 확인 (가능한 경우)
```sql
-- 최근 실행된 SQL 확인 (V$SQL 사용, DBA 권한 필요)
SELECT sql_text, executions, elapsed_time
FROM v$sql
WHERE sql_text LIKE '%BOARD1%'
ORDER BY last_active_time DESC;
```

---

## 🔧 게시판 생성 실패 시 체크리스트

### Step 1: 테이블 존재 확인
```sql
SELECT table_name FROM user_tables WHERE table_name = 'BOARD1';
```
**결과가 없으면**: 테이블이 생성되지 않았습니다. `DB_board.md`의 테이블 생성 쿼리를 실행하세요.

### Step 2: 시퀀스 존재 확인
```sql
SELECT sequence_name FROM user_sequences WHERE sequence_name = 'SEQ_BOARD1';
```
**결과가 없으면**: 시퀀스가 생성되지 않았습니다. `DB_board.md`의 시퀀스 생성 쿼리를 실행하세요.

### Step 3: 테이블 구조 확인
```sql
DESC BOARD1;
```
**필수 컬럼 확인**:
- BOARD_SEQ (NUMBER, PRIMARY KEY)
- BOARD_NAME (VARCHAR2(200), NOT NULL)
- BOARD_TYPE (VARCHAR2(20), NOT NULL)

### Step 4: 시퀀스 동작 확인
```sql
-- 시퀀스가 정상 동작하는지 테스트
SELECT SEQ_BOARD1.NEXTVAL FROM DUAL;
```
**에러가 발생하면**: 시퀀스에 문제가 있습니다.

### Step 5: 수동 삽입 테스트
```sql
-- 수동으로 데이터 삽입 테스트
INSERT INTO BOARD1 (
    BOARD_SEQ, 
    BOARD_NAME, 
    BOARD_TYPE, 
    IS_ACTIVE, 
    DISPLAY_ORDER, 
    NOTICE_DISPLAY_COUNT, 
    CREATED_DATE
) VALUES (
    SEQ_BOARD1.NEXTVAL,
    '테스트 게시판',
    '일반',
    'Y',
    0,
    5,
    SYSDATE
);

-- 롤백 (테스트용)
ROLLBACK;
```
**에러가 발생하면**: 에러 메시지를 확인하여 원인을 파악하세요.

---

## 🛠️ 문제 해결 방법

### 문제 1: 테이블이 없는 경우
```sql
-- DB_board.md의 테이블 생성 쿼리 실행
CREATE TABLE BOARD1 (
    BOARD_SEQ NUMBER PRIMARY KEY,
    BOARD_NAME VARCHAR2(200) NOT NULL,
    BOARD_DESCRIPTION VARCHAR2(500),
    BOARD_TYPE VARCHAR2(20) NOT NULL,
    BOARD_CATEGORY VARCHAR2(50),
    IS_ACTIVE VARCHAR2(1) DEFAULT 'Y',
    DISPLAY_ORDER NUMBER DEFAULT 0,
    NOTICE_DISPLAY_COUNT NUMBER DEFAULT 5,
    CREATED_DATE DATE DEFAULT SYSDATE,
    UPDATED_DATE DATE
);
```

### 문제 2: 시퀀스가 없는 경우
```sql
-- DB_board.md의 시퀀스 생성 쿼리 실행
CREATE SEQUENCE SEQ_BOARD1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;
```

### 문제 3: 시퀀스가 동작하지 않는 경우
```sql
-- 시퀀스 재생성
DROP SEQUENCE SEQ_BOARD1;
CREATE SEQUENCE SEQ_BOARD1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;
```

### 문제 4: 제약조건 오류
```sql
-- 제약조건 확인 및 재생성
-- 외래키 제약조건이 문제인 경우
ALTER TABLE BOARD_POST1 DROP CONSTRAINT FK_BOARD_POST1_BOARD1;
ALTER TABLE BOARD_POST1 ADD CONSTRAINT FK_BOARD_POST1_BOARD1 
    FOREIGN KEY (BOARD_SEQ) REFERENCES BOARD1(BOARD_SEQ) ON DELETE CASCADE;
```

---

## 📊 전체 상태 확인 쿼리

```sql
-- 게시판 관련 모든 객체 상태 확인
SELECT 
    'TABLE' AS object_type,
    table_name AS object_name,
    'EXISTS' AS status
FROM user_tables 
WHERE table_name IN ('BOARD1', 'BOARD_POST1', 'BOARD_COMMENT1', 'EVENT_PRODUCT1', 'EVENT_ORDER1')
UNION ALL
SELECT 
    'SEQUENCE' AS object_type,
    sequence_name AS object_name,
    'EXISTS' AS status
FROM user_sequences 
WHERE sequence_name IN ('SEQ_BOARD1', 'SEQ_BOARD_POST1', 'SEQ_BOARD_COMMENT1', 'SEQ_EVENT_PRODUCT1', 'SEQ_EVENT_ORDER1')
ORDER BY object_type, object_name;
```

---

## 💡 유용한 팁

1. **SQL Developer 사용 시**:
   - 좌측 트리에서 Tables → BOARD1 우클릭 → Describe로 구조 확인
   - Sequences → SEQ_BOARD1 우클릭 → Details로 시퀀스 정보 확인

2. **에러 메시지 해석**:
   - `ORA-00942: table or view does not exist` → 테이블이 없음
   - `ORA-02289: sequence does not exist` → 시퀀스가 없음
   - `ORA-00001: unique constraint violated` → 중복 키 오류
   - `ORA-01400: cannot insert NULL` → NOT NULL 제약조건 위반

3. **트랜잭션 관리**:
   ```sql
   -- 자동 커밋 비활성화 (테스트용)
   SET AUTOCOMMIT OFF;
   
   -- 테스트 후 롤백
   ROLLBACK;
   ```

