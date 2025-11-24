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

root/
  backend -> Spring Boot 3 + Gradle 기반 API 서버
  frontend -> React + Vite 기반 프론트엔드

- **oracle DB 참조 : DB.md

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


### 4. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**

## 📊 데이터베이스 관련

데이터베이스 스키마, 테이블 생성 쿼리, 샘플 데이터, 주요 쿼리 예제 등은 **DB.md** 파일을 참고하세요.

- **테이블 구조**: 회원, 경매 게시글, 입찰, 공지사항, 팝업, 관리자, CSS 스타일셋 등
- **시퀀스 및 인덱스**: 성능 최적화를 위한 인덱스 설계
- **트리거 및 뷰**: 자동화 처리를 위한 트리거 및 뷰 생성
- **쿼리 예제**: CRUD 작업 및 통계 쿼리
- **필드 매핑**: Frontend 컴포넌트와 DB 테이블 간 필드 매핑

## 📖 참고 문서

- **DB.md**: 상세한 데이터베이스 스키마 및 쿼리 예제
- **CSS.md**: CSS 관리 및 스타일셋 구조


 