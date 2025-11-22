# CSS 관리 페이지 초안

## 개요
관리자 페이지에서 CSS 스타일셋을 선택하고 관리할 수 있는 기능입니다.
CSS 선택은 관리자 페이지에서만 가능합니다.

## 전체 페이지 컨셉

### CSS 스타일셋 구조
- **스타일셋**: imageboard + member + header + footer의 스타일을 묶어서 관리
- **스타일셋 폴더 구조**:
  ```
  /css/
    └── cssset_1/
        ├── imageboard.css
        ├── member.css
        ├── header.css
        └── footer.css
    └── cssset_2/
        ├── imageboard.css
        ├── member.css
        ├── header.css
        └── footer.css
  ```

### 스타일셋 구성 요소
1. **imageboard.css**: 게시판(경매) 관련 모든 페이지 스타일
2. **member.css**: 회원 관련 모든 페이지 스타일
3. **header.css**: 헤더 컴포넌트 스타일
4. **footer.css**: 푸터 컴포넌트 스타일

## 주요 기능

### 1. 스타일셋 관리
- 스타일셋 목록 조회
- 스타일셋 생성/수정/삭제
- 스타일셋 이름 및 설명 관리

### 2. 스타일셋 선택 및 적용
- **관리자 페이지에서 스타일셋 선택**
- **미리보기 화면 제공**
- 선택한 스타일셋 적용 기능

### 3. 적용 범위 설정
1. **전체 페이지 적용**: imageboard + member + header + footer 모두 적용
2. **부분 페이지 적용**: 
   - header + footer만 적용
   - imageboard + member만 적용
3. **모바일 반응형**: 항상 적용 (모든 스타일셋에 포함)

### 4. CSS 파일 편집
- 각 CSS 파일별 코드 편집기
- 실시간 미리보기
- 코드 하이라이팅 및 포맷팅

## 데이터베이스 설계

### CSS_SET1 테이블 (스타일셋 정보)
```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_CSS_SET1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- CSS 스타일셋 테이블
CREATE TABLE CSS_SET1 (
    SET_SEQ NUMBER PRIMARY KEY,            -- 스타일셋 번호 (PK, 시퀀스)
    SET_NAME VARCHAR2(200),                -- 스타일셋 이름 (예: cssset_1, 기본테마, 다크테마)
    SET_DESCRIPTION VARCHAR2(500),         -- 스타일셋 설명
    IS_ACTIVE VARCHAR2(1) DEFAULT 'N',    -- 활성화 여부 (Y: 활성, N: 비활성)
    IS_DEFAULT VARCHAR2(1) DEFAULT 'N',   -- 기본 스타일셋 여부 (Y: 기본, N: 일반)
    CREATED_BY VARCHAR2(50),              -- 생성자 (관리자 ID)
    CREATED_DATE DATE DEFAULT SYSDATE,     -- 생성일시
    MODIFIED_BY VARCHAR2(50),             -- 수정자 (관리자 ID)
    MODIFIED_DATE DATE,                    -- 수정일시
    VERSION NUMBER DEFAULT 1              -- 버전 번호
);

-- 인덱스 생성
CREATE INDEX IDX_CSS_SET1_NAME ON CSS_SET1(SET_NAME);
CREATE INDEX IDX_CSS_SET1_ACTIVE ON CSS_SET1(IS_ACTIVE);
```

### CSS_FILE1 테이블 (스타일셋 내 CSS 파일)
```sql
-- 시퀀스 생성
CREATE SEQUENCE SEQ_CSS_FILE1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- CSS 파일 테이블
CREATE TABLE CSS_FILE1 (
    FILE_SEQ NUMBER PRIMARY KEY,           -- CSS 파일 번호 (PK, 시퀀스)
    SET_SEQ NUMBER,                         -- 스타일셋 번호 (FK)
    FILE_NAME VARCHAR2(50),                -- CSS 파일명 (imageboard, member, header, footer)
    CSS_CONTENT CLOB,                       -- CSS 코드 내용
    FILE_TYPE VARCHAR2(20),                 -- 파일 타입 (imageboard, member, header, footer)
    IS_MOBILE VARCHAR2(1) DEFAULT 'N',    -- 모바일 반응형 포함 여부 (Y: 포함, N: 미포함)
    PRIORITY NUMBER DEFAULT 0,             -- 우선순위 (낮을수록 먼저 로드)
    CREATED_BY VARCHAR2(50),               -- 생성자 (관리자 ID)
    CREATED_DATE DATE DEFAULT SYSDATE,      -- 생성일시
    MODIFIED_BY VARCHAR2(50),              -- 수정자 (관리자 ID)
    MODIFIED_DATE DATE,                     -- 수정일시
    VERSION NUMBER DEFAULT 1,              -- 버전 번호
    CONSTRAINT FK_CSS_FILE_SET FOREIGN KEY (SET_SEQ) REFERENCES CSS_SET1(SET_SEQ)
);

-- 인덱스 생성
CREATE INDEX IDX_CSS_FILE1_SET ON CSS_FILE1(SET_SEQ);
CREATE INDEX IDX_CSS_FILE1_TYPE ON CSS_FILE1(FILE_TYPE);
CREATE INDEX IDX_CSS_FILE1_NAME ON CSS_FILE1(FILE_NAME);
```

### CSS_APPLY1 테이블 (적용 설정)
```sql
-- CSS 적용 설정 테이블
CREATE TABLE CSS_APPLY1 (
    APPLY_SEQ NUMBER PRIMARY KEY,          -- 적용 설정 번호 (PK)
    SET_SEQ NUMBER,                         -- 적용할 스타일셋 번호 (FK)
    APPLY_SCOPE VARCHAR2(20),               -- 적용 범위 (FULL: 전체, HEADER_FOOTER: 헤더/푸터만, IMAGEBOARD_MEMBER: 게시판/회원만)
    IS_ACTIVE VARCHAR2(1) DEFAULT 'Y',     -- 활성화 여부 (Y: 활성, N: 비활성)
    APPLIED_BY VARCHAR2(50),               -- 적용자 (관리자 ID)
    APPLIED_DATE DATE DEFAULT SYSDATE,      -- 적용일시
    CONSTRAINT FK_CSS_APPLY_SET FOREIGN KEY (SET_SEQ) REFERENCES CSS_SET1(SET_SEQ)
);

-- 시퀀스 생성
CREATE SEQUENCE SEQ_CSS_APPLY1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;
```

### CSS_HISTORY1 테이블 (변경 이력)
```sql
-- CSS 변경 이력 테이블
CREATE TABLE CSS_HISTORY1 (
    HISTORY_SEQ NUMBER PRIMARY KEY,         -- 이력 번호 (PK)
    SET_SEQ NUMBER,                         -- 스타일셋 번호 (FK)
    FILE_SEQ NUMBER,                        -- CSS 파일 번호 (FK)
    CSS_CONTENT CLOB,                       -- 변경 전/후 CSS 내용
    VERSION NUMBER,                         -- 버전 번호
    CHANGE_TYPE VARCHAR2(20),              -- 변경 타입 (CREATE, UPDATE, DELETE)
    CHANGE_DESCRIPTION VARCHAR2(500),      -- 변경 설명
    CHANGED_BY VARCHAR2(50),               -- 변경자 (관리자 ID)
    CHANGED_DATE DATE DEFAULT SYSDATE,     -- 변경일시
    CONSTRAINT FK_CSS_HISTORY_SET FOREIGN KEY (SET_SEQ) REFERENCES CSS_SET1(SET_SEQ),
    CONSTRAINT FK_CSS_HISTORY_FILE FOREIGN KEY (FILE_SEQ) REFERENCES CSS_FILE1(FILE_SEQ)
);

-- 시퀀스 생성
CREATE SEQUENCE SEQ_CSS_HISTORY1
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;
```

## 백엔드 API 설계

### CSS 스타일셋 Controller
```
GET    /css/set/list                    - 스타일셋 목록 조회
GET    /css/set/get?setSeq={seq}        - 스타일셋 상세 조회
POST   /css/set/save                    - 스타일셋 저장/수정
POST   /css/set/delete                  - 스타일셋 삭제
POST   /css/set/activate                - 스타일셋 활성화/비활성화
GET    /css/set/preview?setSeq={seq}    - 스타일셋 미리보기
POST   /css/set/apply                   - 스타일셋 적용
GET    /css/set/current                 - 현재 적용된 스타일셋 조회
```

### CSS 파일 Controller
```
GET    /css/file/list?setSeq={seq}     - 스타일셋 내 CSS 파일 목록
GET    /css/file/get?fileSeq={seq}      - CSS 파일 상세 조회
POST   /css/file/save                   - CSS 파일 저장/수정
POST   /css/file/delete                 - CSS 파일 삭제
GET    /css/file/getByType?setSeq={seq}&type={type} - 타입별 CSS 파일 조회
```

### CSS 적용 Controller
```
GET    /css/apply/current               - 현재 적용 설정 조회
POST   /css/apply/save                  - 적용 설정 저장
GET    /css/apply/active                - 활성화된 CSS 조회 (프론트엔드 적용용)
```

## 프론트엔드 페이지 구조

### 1. CSS 스타일셋 관리 페이지 (CssSetManage.jsx)
- 스타일셋 목록 (카드 형태 또는 테이블)
- 스타일셋 미리보기
- 스타일셋 선택 및 적용 버튼
- 스타일셋 생성/수정/삭제

### 2. CSS 스타일셋 편집 페이지 (CssSetEditor.jsx)
- 스타일셋 정보 입력 (이름, 설명)
- CSS 파일별 편집 탭
  - imageboard.css 편집
  - member.css 편집
  - header.css 편집
  - footer.css 편집
- 각 탭별 코드 편집기 및 미리보기
- 저장/취소 버튼

### 3. CSS 스타일셋 미리보기 페이지 (CssSetPreview.jsx)
- 스타일셋 선택 후 미리보기
- 적용 범위 선택
  - 전체 페이지 적용
  - header + footer만
  - imageboard + member만
- 페이지별 미리보기
  - 메인 페이지
  - imageboard 목록/상세
  - member 로그인/회원가입/정보
- 화면 크기 선택 (데스크톱, 태블릿, 모바일)
- 적용 버튼

## 적용 범위 상세

### 1. 전체 페이지 적용 (FULL)
- **적용 대상**: imageboard + member + header + footer 모두
- **CSS 파일**: imageboard.css + member.css + header.css + footer.css 모두 로드
- **모바일 반응형**: 항상 포함

### 2. 부분 페이지 적용 - Header + Footer만
- **적용 대상**: header + footer만
- **CSS 파일**: header.css + footer.css만 로드
- **모바일 반응형**: 항상 포함

### 3. 부분 페이지 적용 - Imageboard + Member만
- **적용 대상**: imageboard + member만
- **CSS 파일**: imageboard.css + member.css만 로드
- **모바일 반응형**: 항상 포함

### 4. 모바일 반응형
- **항상 적용**: 모든 스타일셋에 모바일 반응형 CSS 포함
- **미디어 쿼리**: `@media (max-width: 768px)` 등 자동 포함

## UI 레이아웃 예시

### CSS 스타일셋 관리 페이지
```
┌─────────────────────────────────────────────────────────────────┐
│  CSS 스타일셋 관리                                               │
├─────────────────────────────────────────────────────────────────┤
│  [+ 새 스타일셋 생성]                                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ cssset_1     │  │ cssset_2     │  │ cssset_3     │         │
│  │ 기본테마      │  │ 다크테마      │  │ 커스텀테마    │         │
│  │ [미리보기]    │  │ [미리보기]    │  │ [미리보기]    │         │
│  │ [선택] [적용] │  │ [선택] [적용] │  │ [선택] [적용] │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### CSS 스타일셋 편집 페이지
```
┌─────────────────────────────────────────────────────────────────┐
│  CSS 스타일셋 편집: cssset_1                                     │
├─────────────────────────────────────────────────────────────────┤
│  스타일셋 이름: [cssset_1                    ]                  │
│  설명: [기본 테마 스타일셋                    ]                  │
├─────────────────────────────────────────────────────────────────┤
│  [imageboard.css] [member.css] [header.css] [footer.css]        │
├─────────────────────────────────────────────────────────────────┤
│  [코드 편집기 영역 - imageboard.css]                             │
│  .imageboard-list { ... }                                       │
│  .auction-item { ... }                                          │
│  ...                                                             │
├─────────────────────────────────────────────────────────────────┤
│  [미리보기 영역]                                                 │
│  ┌─────────────────────────────┐                               │
│  │ 경매 목록 미리보기            │                               │
│  │ ...                          │                               │
│  └─────────────────────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│  [저장] [취소] [이력보기]                                        │
└─────────────────────────────────────────────────────────────────┘
```

### CSS 스타일셋 미리보기 및 적용 페이지
```
┌─────────────────────────────────────────────────────────────────┐
│  CSS 스타일셋 미리보기: cssset_1                                 │
├─────────────────────────────────────────────────────────────────┤
│  적용 범위 선택:                                                 │
│  (●) 전체 페이지 (imageboard + member + header + footer)        │
│  ( ) header + footer만                                          │
│  ( ) imageboard + member만                                      │
├─────────────────────────────────────────────────────────────────┤
│  페이지 선택: [메인 ▼] [경매목록 ▼] [회원정보 ▼]                │
│  화면 크기: [데스크톱 ▼] [태블릿 ▼] [모바일 ▼]                  │
├─────────────────────────────────────────────────────────────────┤
│  [미리보기 영역]                                                 │
│  ┌─────────────────────────────┐                               │
│  │ 선택한 페이지 미리보기        │                               │
│  │ ...                          │                               │
│  └─────────────────────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│  [적용] [취소]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 차후 게시판 생성기 연동

### 게시판 생성기에서 CSS 선택
- **생성된 게시판에 CSS 스타일셋 선택 기능 추가 예정**
- 게시판 생성 시 스타일셋 1번, 2번 등 선택 가능
- 선택한 스타일셋의 imageboard.css가 해당 게시판에 적용

### 게시판별 CSS 적용 구조
```
게시판 생성 시:
- 게시판 이름: "공지사항"
- CSS 스타일셋: [cssset_1 ▼] 또는 [cssset_2 ▼]
- 적용될 CSS: 선택한 스타일셋의 imageboard.css
```

## 구현 우선순위

### Phase 1 (기본 기능)
1. 스타일셋 생성/수정/삭제
2. CSS 파일별 편집 (imageboard, member, header, footer)
3. 스타일셋 목록 조회 및 선택
4. 기본 미리보기

### Phase 2 (적용 기능)
1. 적용 범위 선택 (전체/부분)
2. 스타일셋 적용 기능
3. 프론트엔드 동적 CSS 로드
4. 모바일 반응형 자동 적용

### Phase 3 (고급 기능)
1. 실시간 미리보기
2. 변경 이력 관리
3. 버전 복원
4. 게시판 생성기 연동

## 체크 사항

### ✅ CSS 스타일셋 관리
- [x] 스타일셋 생성/수정/삭제
- [x] 스타일셋별 CSS 파일 관리 (imageboard, member, header, footer)
- [x] 스타일셋 선택 및 미리보기
- [x] 스타일셋 적용 기능

### ✅ 적용 범위 관리
- [x] 전체 페이지 적용 (imageboard + member + header + footer)
- [x] 부분 페이지 적용 (header + footer만)
- [x] 부분 페이지 적용 (imageboard + member만)
- [x] 모바일 반응형 항상 적용

### ✅ 게시판 생성기 연동 준비
- [x] 스타일셋 선택 구조 설계
- [x] 게시판별 CSS 적용 구조 설계

## 참고사항
- CSS 파일은 DB에 CLOB 타입으로 저장
- 프론트엔드에서 동적으로 CSS를 적용하려면 `<style>` 태그 동적 생성 필요
- **React 컴포넌트에서 `useEffect`를 사용하여 현재 적용된 스타일셋의 CSS를 동적으로 로드**
- **적용 범위에 따라 필요한 CSS 파일만 선택적으로 로드**
- **모바일 반응형 CSS는 모든 스타일셋에 자동 포함**
- 보안을 위해 관리자 권한 체크 필수
- **차후 게시판 생성기에서 스타일셋 선택 기능 추가 예정**
