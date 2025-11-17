# CODING_GUIDELINES
- **프로젝트명**: 플랜잇
- **기술 스택**: react : frontend -> React + Vite
                springboot : backend
                db : oreacle 
                Java 17+

## 🏗️ 프로젝트 구조

project-root/
 ├── backend/        # Spring Boot
 │     ├── src/
 │     ├── build.gradle or pom.xml
 │     └── ...
 ├── frontend/       # React
 │     ├── src/
 │     ├── package.json
 │     └── ...
 ├── README.md

root/
  backend -> Spring Boot 3 + Gradle 기반 API 서버
  frontend -> React + Vite 기반 프론트엔드


## 📚 추가 참고사항
일정 등록/조회/수정/삭제가 가능한 일정 관리 프로그램의 기본 구조

### 1. 기존 코드 활용
- **기존 코드를 적극 반영**하여 일관성 유지
- **비슷한 기능이 있다면 참고**하여 구현

### 2. 기능 구현 순서
1. **DTO 클래스** 생성
2. **엔티티 클래스** 생성
3. **Repository 인터페이스** 생성  
4. **DAO 클래스** 생성
5. **Service 클래스** 생성
6. **Controller 클래스** 생성


### 3. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**

## 📊 오라클 DB 테이블 생성 쿼리


-----------------------------------------------------------------------
```
-- 여기까지 테이블 완성
-----------------------------------------------------------------------


### 4. 테이블 관계도
```

```

### 5. 초기 테스트 데이터 삽입 (선택사항)
