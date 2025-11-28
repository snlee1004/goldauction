# CODING_GUIDELINES
- **프로젝트명**: 골드옥션
- 골드에 관련된 경매사이트 

- **기술 스택**: 
  - Frontend: React + Vite
  - Backend: Spring Boot 4.0 + Gradle
  - Database: Oracle
  - Java: 17+

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
 │     │   └── main/
 │     │       ├── java/com/example/backend/
 │     │       │   ├── controller/    # REST API 컨트롤러
 │     │       │   ├── service/       # 비즈니스 로직
 │     │       │   ├── dao/           # 데이터 접근 계층
 │     │       │   ├── repository/    # JPA Repository
 │     │       │   ├── entity/        # 엔티티 클래스
 │     │       │   ├── dto/           # 데이터 전송 객체
 │     │       │   ├── config/        # 설정 클래스
 │     │       │   └── util/          # 유틸리티 클래스
 │     │       └── resources/
 │     │           └── application.properties
 │     └── build.gradle
 ├── frontend/       # React
 │     ├── src/
 │     │   ├── script/      # JavaScript 로직 관리
 │     │   ├── css/         # CSS 파일
 │     │   ├── chart/       # 차트 컴포넌트
 │     │   ├── layouts/     # 레이아웃 컴포넌트
 │     │   ├── imageboard/  # 경매 관련 컴포넌트
 │     │   ├── member/      # 회원 관련 컴포넌트
 │     │   ├── board/       # 게시판 관련 컴포넌트
 │     │   └── ...
 │     └── package.json
 ├── README.md
 ├── CODING_GUIDELINES.md   # 코딩 가이드라인 (이 파일)
 └── CSS.md          # CSS 관리 문서

## 🎯 코딩 스타일 및 규칙

### 1. 네이밍 규칙

#### Frontend (React/JavaScript)
- **컴포넌트명**: PascalCase (예: `ImageboardView`, `MemberInfo`)
- **파일명**: 컴포넌트는 PascalCase, 일반 파일은 camelCase
- **변수명**: camelCase, 누가 봐도 알 수 있게 명확하게 영문으로 짧게 (예: `bidAmount`, `imageList`, `selectedImageIndex`)
- **함수명**: camelCase (예: `fetchBoardData`, `handleBidSubmit`)
- **상수명**: UPPER_SNAKE_CASE (예: `MAX_IMAGE_COUNT`)
- **State 변수**: `useState`로 선언된 변수는 명확한 의미를 가진 이름 사용 (예: `showImagePopup`, `remainingTime`)

#### Backend (Java)
- **클래스명**: PascalCase (예: `ImageboardController`, `BidService`)
- **메서드명**: camelCase (예: `imageboardWrite`, `getAwardedBidsByImageboardSeq`)
- **변수명**: camelCase (예: `imageboardData`, `savedImageCount`)
- **상수명**: UPPER_SNAKE_CASE (예: `MAX_FILE_SIZE`)
- **패키지명**: 소문자, 점으로 구분 (예: `com.example.backend.controller`)

### 2. 주석 작성 규칙

#### Frontend
- **한글 주석 사용**: 코드 설명은 한글로 작성
- **주석 위치**: 복잡한 로직 위에 주석 작성
- **예시**:
```javascript
// 입찰 참여 금액
const [bidAmount, setBidAmount] = useState("");

// 이미지 목록 가져오기
const fetchImageList = async (imageboardSeq) => {
    // API 호출 및 처리 로직
};
```

#### Backend
- **한글 주석 사용**: 코드 설명은 한글로 작성
- **메서드 주석**: 각 메서드의 역할을 명확히 설명
- **예시**:
```java
// 경매 종료일 처리 (날짜/시간 형식 또는 "7일후" 형식)
if(auctionPeriod != null && !auctionPeriod.isEmpty()) {
    // ISO 8601 형식 파싱 시도
    // ...
}
```

### 3. React 컴포넌트 패턴

#### Hooks 사용 규칙
- **useState**: 상태 관리
- **useEffect**: 사이드 이펙트 처리 (API 호출, 구독 등)
- **useRef**: DOM 참조 또는 중복 실행 방지 플래그
- **useNavigate**: 페이지 이동
- **useLocation**: URL 파라미터 읽기

#### State 관리 패턴
```javascript
// 기본 상태 선언
const [data, setData] = useState({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// 중복 실행 방지를 위한 ref 사용
const loginCheckedRef = useRef(false);

useEffect(() => {
    if(loginCheckedRef.current) return;
    loginCheckedRef.current = true;
    // 로직 실행
}, []);
```

#### API 호출 패턴
```javascript
const fetchData = async (id) => {
    try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/endpoint?id=${id}`);
        const data = await response.json();
        
        if(data.rt === "OK") {
            setData(data.item);
        } else {
            setError(data.msg || "데이터를 불러오는데 실패했습니다.");
        }
    } catch(err) {
        console.error("데이터 조회 오류:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
        setLoading(false);
    }
};
```

#### FormData 사용 패턴 (파일 업로드)
```javascript
const formData = new FormData();
formData.append("productName", productName);
formData.append("category", category);

// 여러 파일 추가 (같은 키 이름으로)
imageFiles.forEach((file) => {
    formData.append("images", file);
});

const response = await fetch("http://localhost:8080/api/endpoint", {
    method: "POST",
    body: formData
});
```

### 4. Spring Boot 아키텍처 패턴

#### 계층 구조
```
Controller → Service → DAO → Repository
```

#### Controller 패턴
```java
@RestController
public class ImageboardController {
    @Autowired
    ImageboardService service;
    
    @PostMapping("/imageboard/imageboardWrite")
    public Map<String, Object> imageboardWrite(
            @RequestParam(value="productName", required=false) String productName) {
        
        Map<String, Object> map = new HashMap<String, Object>();
        try {
            // 비즈니스 로직 호출
            Imageboard result = service.imageboardWrite(dto);
            
            if(result != null) {
                map.put("rt", "OK");
                map.put("msg", "등록되었습니다.");
            } else {
                map.put("rt", "FAIL");
                map.put("msg", "등록에 실패했습니다.");
            }
        } catch(Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("msg", "오류가 발생했습니다.");
        }
        return map;
    }
}
```

#### 응답 형식
- **성공**: `{"rt": "OK", "msg": "메시지", "data": {...}}`
- **실패**: `{"rt": "FAIL", "msg": "에러 메시지"}`

#### Service 패턴
```java
@Service
public class ImageboardService {
    @Autowired
    ImageboardDAO dao;
    
    // 비즈니스 로직 처리
    public Imageboard imageboardWrite(ImageboardDTO dto) {
        // 기본값 설정
        if(dto.getStatus() == null || dto.getStatus().isEmpty()) {
            dto.setStatus("진행중");
        }
        return dao.imageboardWrite(dto);
    }
}
```

#### DAO 패턴
```java
@Repository
public class ImageboardDAO {
    @Autowired
    ImageboardRepository repository;
    
    // 데이터 접근 로직
    public Imageboard imageboardWrite(ImageboardDTO dto) {
        return repository.save(dto.toEntity());
    }
}
```

### 5. 에러 처리 규칙

#### Frontend
- **try-catch 사용**: 모든 비동기 작업에 에러 처리
- **사용자 친화적 메시지**: `alert()` 또는 상태를 통한 에러 표시
- **로깅**: `console.error()`로 디버깅 정보 출력
- **예시**:
```javascript
try {
    const response = await fetch(url);
    const data = await response.json();
    if(data.rt === "OK") {
        // 성공 처리
    } else {
        alert(data.msg || "오류가 발생했습니다.");
    }
} catch(err) {
    console.error("오류 발생:", err);
    alert("오류가 발생했습니다.");
}
```

#### Backend
- **try-catch 사용**: 예외 발생 가능한 모든 로직에 예외 처리
- **로깅**: `System.out.println()` (일반), `System.err.println()` (에러)
- **스택 트레이스**: `e.printStackTrace()`로 상세 정보 출력
- **예시**:
```java
try {
    // 비즈니스 로직
    Imageboard result = service.imageboardWrite(dto);
    if(result != null) {
        map.put("rt", "OK");
    }
} catch(Exception e) {
    System.err.println("오류 발생: " + e.getMessage());
    e.printStackTrace();
    map.put("rt", "FAIL");
    map.put("msg", "오류가 발생했습니다.");
}
```

### 6. 파일 업로드 처리

#### Frontend
- **FormData 사용**: 여러 파일 업로드 시 같은 키 이름으로 추가
- **미리보기**: `URL.createObjectURL()` 사용, 컴포넌트 언마운트 시 `URL.revokeObjectURL()` 호출
- **파일 개수 제한**: 최대 개수 체크 및 사용자 알림
- **예시**:
```javascript
// 이미지 파일 선택 처리
const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles, ...files];
    
    if(newFiles.length > 8) {
        alert("최대 8장까지만 업로드 가능합니다.");
        return;
    }
    
    setImageFiles(newFiles);
    
    // 미리보기 생성
    const previews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
};

// 컴포넌트 언마운트 시 정리
useEffect(() => {
    return () => {
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
}, [imagePreviews]);
```

#### Backend
- **MultipartFile 처리**: `@RequestParam(value="images", required=false) List<MultipartFile> images`
- **파일명 생성**: 타임스탬프 + UUID + 확장자로 고유성 보장
- **썸네일 생성**: `ImageThumbnailUtil` 사용
- **예외 처리**: 각 파일 처리 시 개별 try-catch로 실패해도 다음 파일 계속 처리

### 7. 날짜/시간 처리

#### Frontend
- **날짜 입력**: `type="date"` 사용, `min` 속성으로 최소 날짜 제한
- **시간 입력**: `type="time"` 사용
- **날짜 결합**: ISO 8601 형식으로 결합 (예: `2025-11-28T23:55:00`)
- **예시**:
```javascript
// 최소 날짜 계산 (내일)
const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};

// 날짜와 시간 결합
const auctionPeriod = auctionEndDate && auctionEndTime 
    ? `${auctionEndDate}T${auctionEndTime}:00` 
    : auctionEndDate || "";
```

#### Backend
- **타임존 설정**: `Asia/Seoul` 명시적 설정
- **날짜 파싱**: `SimpleDateFormat` 사용, 여러 형식 시도
- **날짜 비교**: 시간 포함 정확한 비교 (`!now.before(endDate)`)
- **예시**:
```java
// 한국 시간대 설정
java.util.TimeZone timeZone = java.util.TimeZone.getTimeZone("Asia/Seoul");
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
sdf.setTimeZone(timeZone);
Date endDate = sdf.parse(auctionPeriod);
```

### 8. 인증 및 세션 관리

#### Frontend
- **sessionStorage 사용**: 로그인 정보 저장 (`memId`, `memName`)
- **로그인 체크**: `useEffect`에서 중복 체크 방지 (`useRef` 사용)
- **예시**:
```javascript
const loginCheckedRef = useRef(false);

useEffect(() => {
    if(loginCheckedRef.current) return;
    loginCheckedRef.current = true;
    
    const memId = sessionStorage.getItem("memId");
    if(!memId) {
        alert("로그인이 필요합니다.");
        navigate("/member/loginForm");
        return;
    }
    // 로직 실행
}, [navigate]);
```

### 9. 스타일링 규칙

#### 인라인 스타일 사용
- **인라인 스타일**: React 컴포넌트에서 `style` prop 사용
- **Bootstrap Icons**: `<i className="bi bi-아이콘명"></i>` 형식
- **반응형**: `flex`, `gap` 등을 활용한 레이아웃
- **예시**:
```javascript
<div style={{
    display: "flex",
    gap: "10px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "4px"
}}>
    <i className="bi bi-clock"></i>
    <span>경매 마감까지</span>
</div>
```

### 10. 코드 품질 규칙

#### 에러 방지
- **null 체크**: 모든 객체 접근 전 null 체크
- **타입 변환**: `parseInt()`, `parseFloat()` 사용 시 `isNaN()` 체크
- **기본값 설정**: `||` 연산자로 기본값 제공
- **예시**:
```javascript
const pg = pgParam ? parseInt(pgParam) : 1;
setPg(isNaN(pg) || pg < 1 ? 1 : pg);

const price = imageboardData.imageprice || 0;
```

#### 메모리 관리
- **URL.revokeObjectURL**: `URL.createObjectURL()` 사용 후 정리
- **useEffect cleanup**: 구독, 인터벌 등 정리 함수 제공
- **예시**:
```javascript
useEffect(() => {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
}, [dependencies]);
```

#### 성능 최적화
- **조건부 렌더링**: 불필요한 렌더링 방지
- **지연 로딩**: `setTimeout`으로 API 호출 순서 제어
- **데이터 캐싱**: sessionStorage 활용

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

### 3. 경매 상태 관리
- **상태 값**: "진행중", "종료", "판매완료", "포기"
- **자동 상태 변경**: 경매 종료일 도래 시 자동으로 "종료" 또는 "판매완료"로 변경
- **등록 직후 보호**: 등록 후 1분 이내에는 상태 체크 건너뛰기

### 4. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**
- **브라우저 콘솔 및 서버 로그 확인**

### 5. 파일 업로드 제한
- **최대 파일 개수**: 8개 (경매 이미지)
- **파일 크기**: 10MB (개별), 50MB (전체 요청)
- **파일 개수 제한**: `server.tomcat.max-part-count=20` (application.properties)

## 📖 참고 문서

- **DB.md**: 상세한 데이터베이스 스키마 및 쿼리 예제
- **CSS.md**: CSS 관리 및 스타일셋 구조
- **프론트엔드_설치_가이드.md**: 프론트엔드 개발 환경 설정
