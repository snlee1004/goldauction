# 골드옥션 시스템 발표 자료 (보강판)
## 6~10분 발표용 - 상세 기술 설명 포함

---

## 1. 프로젝트 개요 및 목적

### 골드옥션 (Gold Auction)
- **프로젝트명**: 골드옥션
- **목적**: 골드 및 귀금속 경매 플랫폼 구축
- **핵심 가치**: 안전하고 투명한 경매 시스템을 통한 귀금속 거래 활성화

### 기술 스택 상세
- **Frontend**: 
  - React 18+ (함수형 컴포넌트, Hooks 기반)
  - Vite (빠른 빌드 도구)
  - React Router (SPA 라우팅)
  - Bootstrap 5 (반응형 UI)
  - Recharts (차트 시각화)
- **Backend**: 
  - Spring Boot 3.x
  - Java 17+
  - Spring Data JPA (ORM)
  - RESTful API 설계
  - Gradle (빌드 도구)
- **Database**: 
  - Oracle DB
  - 19개 테이블
  - 시퀀스 기반 PK 관리
  - 인덱스 최적화

---

## 2. 시스템 아키텍처 상세

### 3-Tier Architecture
```
┌─────────────────────────────────────────┐
│  Presentation Layer (Frontend)          │
│  - React Components                     │
│  - React Router (SPA)                   │
│  - State Management (useState, useEffect)│
│  - API 호출 (Fetch API)                 │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
                  │ JSON 데이터 교환
┌─────────────────▼───────────────────────┐
│  Business Logic Layer (Backend)         │
│  - Controller (REST API 엔드포인트)      │
│  - Service (비즈니스 로직)               │
│  - DAO (데이터 접근)                    │
│  - DTO (데이터 전송 객체)               │
└─────────────────┬───────────────────────┘
                  │ JDBC/JPA
                  │ SQL 쿼리 실행
┌─────────────────▼───────────────────────┐
│  Data Layer (Database)                  │
│  - Oracle DB                            │
│  - 19개 테이블                          │
│  - 인덱스 최적화                        │
│  - 트랜잭션 관리                        │
└─────────────────────────────────────────┘
```

### 레이어별 역할 상세

#### Frontend Layer
- **컴포넌트 구조**: 기능별로 모듈화 (imageboard, member, board, manager 등)
- **상태 관리**: React Hooks (useState, useEffect, useCallback)
- **라우팅**: React Router를 통한 SPA 구현
- **API 통신**: Fetch API를 통한 비동기 통신
- **유효성 검사**: Frontend에서 1차 검증 후 Backend에서 2차 검증

#### Backend Layer
- **Controller**: RESTful API 엔드포인트 제공, 요청/응답 처리
- **Service**: 비즈니스 로직 처리 (경매 종료일 계산, 입찰 검증 등)
- **DAO**: Repository를 통한 데이터 접근 추상화
- **DTO**: Entity와 분리된 데이터 전송 객체

#### Database Layer
- **Entity**: JPA를 통한 객체-관계 매핑
- **Repository**: JPA Repository를 통한 쿼리 자동 생성
- **Native Query**: 복잡한 통계 쿼리는 Native SQL 사용

---

## 3. 전체 시스템 흐름 - 경매 등록 프로세스

### 경매 상품 등록 전체 흐름

```
[사용자 입력]
  ↓
[Frontend 검증]
  - 상품명, 카테고리, 가격, 기간 등 필수 항목 검증
  - 이미지 파일 검증 (크기, 형식)
  ↓
[API 호출: POST /imageboard/imageboardWrite]
  ↓
[Controller 수신]
  - MultipartFile로 이미지 파일 수신
  - DTO 객체 생성
  ↓
[Service 처리]
  1. 경매 시작일 설정 (없으면 현재 날짜)
  2. 경매 종료일 계산
     - "7일후" → 시작일 + 7일
     - "14일후" → 시작일 + 14일
     - "21일후" → 시작일 + 21일
     - "30일후" → 시작일 + 30일
  3. 상태 기본값 설정 ("진행중")
  ↓
[DAO 처리]
  1. IMAGEBOARD1 테이블에 상품 정보 저장
  2. 시퀀스로 SEQ 자동 생성
  ↓
[이미지 처리]
  1. 업로드된 이미지 파일을 서버에 저장
  2. 썸네일 이미지 자동 생성 (ImageThumbnailUtil)
  3. IMAGEBOARD_IMAGES1 테이블에 이미지 정보 저장
     - IMAGE_ORDER: 1(대표), 2, 3... 순서대로 저장
  ↓
[응답 반환]
  - JSON 형식으로 성공/실패 결과 반환
  ↓
[Frontend 처리]
  - 성공 시 상품 목록 페이지로 이동
  - 실패 시 에러 메시지 표시
```

### 핵심 알고리즘: 경매 종료일 계산

```java
private Date calculateAuctionEndDate(Date startDate, String auctionPeriod) {
    Calendar cal = Calendar.getInstance();
    cal.setTime(startDate);
    
    if(auctionPeriod.equals("7일후")) {
        cal.add(Calendar.DAY_OF_MONTH, 7);
    } else if(auctionPeriod.equals("14일후")) {
        cal.add(Calendar.DAY_OF_MONTH, 14);
    } else if(auctionPeriod.equals("21일후")) {
        cal.add(Calendar.DAY_OF_MONTH, 21);
    } else if(auctionPeriod.equals("30일후")) {
        cal.add(Calendar.DAY_OF_MONTH, 30);
    }
    
    return cal.getTime();
}
```

---

## 4. 전체 시스템 흐름 - 입찰 프로세스

### 입찰 등록 전체 흐름

```
[사용자 입력]
  - 입찰 금액 입력
  ↓
[Frontend 검증]
  1. 로그인 여부 확인 (sessionStorage)
  2. 입찰 금액 유효성 검사
     - 숫자 형식 확인
     - 시작가격 이상 확인
     - 최고 입찰 금액보다 높은지 확인
  3. 작성자 본인 입찰 방지
  ↓
[API 호출: POST /bid/write]
  - imageboardSeq, bidderId, bidAmount 전송
  ↓
[Controller 수신]
  - 요청 파라미터 파싱
  ↓
[Service 검증]
  1. 경매 정보 조회 (IMAGEBOARD1)
  2. 경매 존재 여부 확인
  3. 작성자 본인 입찰 방지
     if(imageboard.getImageid().equals(bidderId)) {
         return "자신이 등록한 상품에는 입찰할 수 없습니다.";
     }
  4. 경매 종료 여부 확인
     if("판매완료".equals(status) || "종료".equals(status)) {
         return "이미 종료된 경매입니다.";
     }
  5. 최고 입찰 금액 조회
     SELECT MAX(BID_AMOUNT) FROM BID1 
     WHERE IMAGEBOARD_SEQ = ? AND STATUS = '유효'
  6. 입찰 금액 검증
     - 시작가격 이상
     - 최고 입찰 금액보다 높음
  ↓
[DAO 처리]
  1. BID1 테이블에 입찰 정보 저장
     - BID_SEQ: 시퀀스 자동 생성
     - BID_TIME: 현재 시간
     - STATUS: "유효"
  2. 최고 낙찰 가격 체크
     if(bidAmount >= maxBidPrice) {
         // 즉시 구매 처리
         imageboard.status = "판매완료";
     }
  ↓
[응답 반환]
  - 성공/실패 결과 및 메시지 반환
  ↓
[Frontend 처리]
  - 성공 시 입찰 내역 새로고침
  - 실패 시 에러 메시지 표시
```

### 핵심 알고리즘: 최고 입찰 금액 조회

```sql
-- Native Query (Oracle)
SELECT MAX(BID_AMOUNT) 
FROM BID1 
WHERE IMAGEBOARD_SEQ = :seq 
  AND STATUS = '유효'
```

```java
// Repository
@Query(value = "select max(BID_AMOUNT) from BID1 where IMAGEBOARD_SEQ = :seq and STATUS = '유효'", 
       nativeQuery = true)
Integer findMaxBidAmountByImageboardSeq(@Param("seq") int seq);
```

---

## 5. 페이징 처리 기술 상세

### 페이징 알고리즘

#### Backend 페이징 처리
```java
// Controller
int endNum = pg * 5;        // 페이지당 5개
int startNum = endNum - 4;  // 시작 번호 계산

// Repository (Oracle ROWNUM 사용)
@Query(value = "SELECT * FROM (" +
               "  SELECT ROWNUM RN, A.* FROM (" +
               "    SELECT * FROM IMAGEBOARD1 " +
               "    WHERE STATUS = '진행중' " +
               "    ORDER BY SEQ DESC" +
               "  ) A" +
               ") WHERE RN BETWEEN :startNum AND :endNum", 
       nativeQuery = true)
List<Imageboard> findByStartnumAndEndnum(@Param("startNum") int startNum, 
                                          @Param("endNum") int endNum);
```

#### Frontend 페이징 UI
```javascript
// 페이지 블록 계산 (3블록씩)
int totalP = (totalA + 4) / 5;           // 전체 페이지 수
int startPage = (pg-1)/3*3 + 1;          // 시작 페이지
int endPage = startPage + 2;              // 종료 페이지
if(endPage > totalP) endPage = totalP;    // 마지막 페이지 보정
```

#### 검색 및 필터링
- **키워드 검색**: LIKE 연산자 사용
- **카테고리 필터**: WHERE CATEGORY = ?
- **복합 검색**: 키워드 + 카테고리 동시 적용
- **URL 파라미터**: 검색 조건 유지 (React Router)

---

## 6. 데이터베이스 설계 상세

### 테이블 관계도 (ERD 핵심)

```
MEMBER1 (회원)
  ├─ 1:N → IMAGEBOARD1 (경매 상품)
  ├─ 1:N → BID1 (입찰)
  ├─ 1:N → BOARD_POST1 (게시글)
  └─ 1:N → BOARD_COMMENT1 (댓글)

IMAGEBOARD1 (경매 상품)
  ├─ 1:N → IMAGEBOARD_IMAGES1 (상품 이미지)
  └─ 1:N → BID1 (입찰)

BOARD1 (게시판)
  ├─ 1:N → BOARD_POST1 (게시글)
  └─ 1:N → EVENT_PRODUCT1 (이벤트 상품)

EVENT_PRODUCT1 (이벤트 상품)
  ├─ 1:N → EVENT_PRODUCT_IMAGE1 (상품 이미지)
  ├─ 1:N → EVENT_PRODUCT_OPTION1 (상품 옵션)
  └─ 1:N → EVENT_ORDER1 (주문)
```

### 인덱스 전략

#### 성능 최적화를 위한 인덱스
```sql
-- 경매 상품 조회 최적화
CREATE INDEX IDX_IMAGEBOARD1_STATUS ON IMAGEBOARD1(STATUS);
CREATE INDEX IDX_IMAGEBOARD1_CATEGORY ON IMAGEBOARD1(CATEGORY);
CREATE INDEX IDX_IMAGEBOARD1_END_DATE ON IMAGEBOARD1(AUCTION_END_DATE);

-- 입찰 조회 최적화
CREATE INDEX IDX_BID1_IMAGEBOARD1_SEQ ON BID1(IMAGEBOARD_SEQ);
CREATE INDEX IDX_BID1_AMOUNT ON BID1(IMAGEBOARD_SEQ, BID_AMOUNT DESC);
CREATE INDEX IDX_BID1_TIME ON BID1(IMAGEBOARD_SEQ, BID_TIME DESC);

-- 회원 조회 최적화
CREATE INDEX IDX_MEMBER1_ID ON MEMBER1(ID);
CREATE INDEX IDX_MEMBER1_NICKNAME ON MEMBER1(NICKNAME);
CREATE INDEX IDX_MEMBER1_SUSPENDED ON MEMBER1(IS_SUSPENDED);
```

### 트랜잭션 관리

#### 입찰 등록 시 트랜잭션
```java
@Transactional
public Bid save(BidDTO dto) {
    // 1. 입찰 정보 저장
    Bid bid = repository.save(dto.toEntity());
    
    // 2. 최고 낙찰 가격 체크
    Integer maxBidPrice = imageboard.getMaxBidPrice();
    if(maxBidPrice != null && dto.getBidAmount() >= maxBidPrice) {
        // 3. 경매 상태 변경 (즉시 구매)
        imageboard.setStatus("판매완료");
        imageboardRepository.save(imageboard);
    }
    
    return bid;
}
```

---

## 7. 입찰 베스트 리스트 알고리즘

### 입찰 베스트 리스트 생성 프로세스

```javascript
// 1. 모든 페이지를 순회하여 진행중인 상품 수집
let allActiveItems = [];
let currentPage = 1;
let hasMorePages = true;

while(hasMorePages) {
    const response = await fetch(`/imageboard/imageboardList?pg=${currentPage}`);
    const data = await response.json();
    const items = data.items || [];
    
    // 진행중인 항목만 필터링
    const activeItems = items.filter(item => item.status === '진행중');
    allActiveItems = [...allActiveItems, ...activeItems];
    
    // 다음 페이지 확인
    if(currentPage >= data.totalP || items.length === 0) {
        hasMorePages = false;
    } else {
        currentPage++;
    }
}

// 2. 입찰 수 기준 정렬
const sorted = allActiveItems.sort((a, b) => {
    const bidCountA = Number(a.bidCount) || 0;
    const bidCountB = Number(b.bidCount) || 0;
    
    // 입찰 수가 많은 순서로 정렬
    if(bidCountB !== bidCountA) {
        return bidCountB - bidCountA;
    }
    
    // 입찰 수가 같으면 최근 등록일 순으로 정렬
    const timeA = new Date(a.logtime).getTime();
    const timeB = new Date(b.logtime).getTime();
    return timeB - timeA;
});

// 3. 상위 5개만 선택
setBestBidList(sorted.slice(0, 5));
```

### 성능 최적화 고려사항
- **문제점**: 모든 페이지를 순회하는 것은 비효율적
- **개선 방안**: Backend에서 입찰 수 기준 정렬 쿼리 추가
  ```sql
  SELECT * FROM (
    SELECT i.*, 
           (SELECT COUNT(*) FROM BID1 WHERE IMAGEBOARD_SEQ = i.SEQ AND STATUS = '유효') AS BID_COUNT
    FROM IMAGEBOARD1 i
    WHERE i.STATUS = '진행중'
    ORDER BY BID_COUNT DESC, i.LOGTIME DESC
  ) WHERE ROWNUM <= 5
  ```

---

## 8. 거래 통계 시스템 상세

### 통계 데이터 수집 프로세스

#### 1. 거래 완료 기준
```sql
-- 거래 완료된 상품 조회
SELECT * FROM IMAGEBOARD1
WHERE STATUS IN ('판매완료', '종료')
  AND AUCTION_END_DATE BETWEEN :startDate AND :endDate
  AND EXISTS (
    SELECT 1 FROM BID1 
    WHERE IMAGEBOARD_SEQ = IMAGEBOARD1.SEQ 
      AND STATUS = '유효'
  )
```

#### 2. 최종 거래 금액 산정
```java
// Service Layer
public Long getTotalTransactionAmount(String period) {
    Date startDate = calculateStartDate(period);
    Date endDate = new Date();
    
    // Native Query 실행
    String sql = "SELECT SUM(" +
                 "  CASE " +
                 "    WHEN i.STATUS = '판매완료' OR i.STATUS = '종료' THEN " +
                 "      (SELECT MAX(BID_AMOUNT) FROM BID1 " +
                 "       WHERE IMAGEBOARD_SEQ = i.SEQ AND STATUS = '유효') " +
                 "    ELSE 0 " +
                 "  END" +
                 ") AS TOTAL_AMOUNT " +
                 "FROM IMAGEBOARD1 i " +
                 "WHERE i.STATUS IN ('판매완료', '종료') " +
                 "  AND i.AUCTION_END_DATE BETWEEN :startDate AND :endDate " +
                 "  AND EXISTS (" +
                 "    SELECT 1 FROM BID1 " +
                 "    WHERE IMAGEBOARD_SEQ = i.SEQ AND STATUS = '유효'" +
                 "  )";
    
    return entityManager.createNativeQuery(sql)
                       .setParameter("startDate", startDate)
                       .setParameter("endDate", endDate)
                       .getSingleResult();
}
```

#### 3. 시간대별 거래 현황
```sql
-- 시간대별 집계 (Oracle)
SELECT 
  TO_NUMBER(TO_CHAR(MAX(b.BID_TIME), 'HH24')) AS HOUR,
  COUNT(DISTINCT i.SEQ) AS COUNT,
  SUM((SELECT MAX(BID_AMOUNT) FROM BID1 
       WHERE IMAGEBOARD_SEQ = i.SEQ AND STATUS = '유효')) AS AMOUNT
FROM IMAGEBOARD1 i
INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ
WHERE i.STATUS IN ('판매완료', '종료')
  AND i.AUCTION_END_DATE BETWEEN :startDate AND :endDate
  AND b.STATUS = '유효'
GROUP BY TO_NUMBER(TO_CHAR(MAX(b.BID_TIME), 'HH24'))
ORDER BY HOUR
```

#### 4. 카테고리별 통계
```sql
-- 카테고리별 집계
SELECT 
  i.CATEGORY,
  COUNT(DISTINCT i.SEQ) AS COUNT,
  SUM((SELECT MAX(BID_AMOUNT) FROM BID1 
       WHERE IMAGEBOARD_SEQ = i.SEQ AND STATUS = '유효')) AS AMOUNT,
  ROUND(COUNT(DISTINCT i.SEQ) * 100.0 / 
        (SELECT COUNT(*) FROM IMAGEBOARD1 
         WHERE STATUS IN ('판매완료', '종료') 
           AND AUCTION_END_DATE BETWEEN :startDate AND :endDate), 2) AS PERCENTAGE
FROM IMAGEBOARD1 i
WHERE i.STATUS IN ('판매완료', '종료')
  AND i.AUCTION_END_DATE BETWEEN :startDate AND :endDate
  AND EXISTS (
    SELECT 1 FROM BID1 
    WHERE IMAGEBOARD_SEQ = i.SEQ AND STATUS = '유효'
  )
GROUP BY i.CATEGORY
ORDER BY COUNT DESC
```

---

## 9. 이미지 처리 시스템

### 다중 이미지 업로드 프로세스

```java
// Controller
@PostMapping("/imageboard/imageboardWrite")
public Map<String, Object> imageboardWrite(
    @RequestParam("imageFiles") MultipartFile[] imageFiles, ...) {
    
    // 1. 상품 정보 저장
    Imageboard imageboard = service.imageboardWrite(dto);
    
    // 2. 다중 이미지 처리
    if(imageFiles != null && imageFiles.length > 0) {
        int order = 1;
        for(MultipartFile file : imageFiles) {
            if(!file.isEmpty()) {
                // 파일 저장
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File saveFile = new File(uploadpath, fileName);
                file.transferTo(saveFile);
                
                // 썸네일 생성
                thumbnailUtil.createThumbnail(saveFile.getAbsolutePath(), 
                                             uploadpath + "/thumb_" + fileName, 
                                             200, 200);
                
                // DB 저장
                ImageboardImagesDTO imageDto = new ImageboardImagesDTO();
                imageDto.setImageboardSeq(imageboard.getSeq());
                imageDto.setImagePath(fileName);
                imageDto.setImageOrder(order++);
                imagesService.save(imageDto);
            }
        }
    }
    
    return map;
}
```

### 썸네일 생성 알고리즘
- **라이브러리**: Java ImageIO 또는 Thumbnailator
- **크기**: 200x200 픽셀
- **비율 유지**: 원본 비율 유지하며 리사이징
- **저장 경로**: `/thumb_` 접두사 추가

---

## 10. 계정 정지 시스템

### 계정 정지 프로세스

```java
// Service Layer
public Member suspendMember(String id, Date startDate, Date endDate, String reason) {
    Member member = dao.memberView(id);
    if(member != null) {
        member.setIsSuspended("Y");
        member.setSuspendStartDate(startDate);
        member.setSuspendEndDate(endDate);
        member.setSuspendReason(reason);
        return dao.memberModify(member);
    }
    return null;
}
```

### 자동 해제 로직

```java
// Controller - 로그인 시
@PostMapping("/member/login")
public Map<String, Object> login(@RequestBody Map<String, String> params) {
    Member member = service.login(id, pwd);
    
    if(member != null && "Y".equals(member.getIsSuspended())) {
        Date today = new Date();
        Date endDate = member.getSuspendEndDate();
        
        if(endDate != null && endDate.before(today)) {
            // 정지 기간 만료 - 자동 해제
            service.unsuspendMember(id);
            // 정상 로그인 처리
        } else {
            // 아직 정지 기간 중
            return "계정이 정지되었습니다.";
        }
    }
    
    return member;
}
```

---

## 11. CSS 스타일셋 동적 로딩

### CSS 동적 적용 시스템

```javascript
// CssLoader.jsx
useEffect(() => {
    // 현재 적용된 CSS 스타일셋 조회
    fetch('/css/apply/current')
        .then(res => res.json())
        .then(data => {
            if(data.rt === "OK" && data.cssSet) {
                const cssSetName = data.cssSet.setName;
                
                // CSS 파일 동적 로드
                const cssFiles = ['header.css', 'footer.css', 'imageboard.css', 'member.css'];
                cssFiles.forEach(file => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = `/css/${cssSetName}/${file}`;
                    document.head.appendChild(link);
                });
            }
        });
}, []);
```

### 스타일셋 관리
- **다중 스타일셋 지원**: default_set, cssset_1, christmas_Set 등
- **실시간 적용**: 관리자가 선택 시 즉시 반영
- **파일 구조**: 각 스타일셋별로 4개 CSS 파일 관리
  - header.css, footer.css, imageboard.css, member.css

---

## 12. 차트셋 동적 로딩

### 차트셋 동적 컴포넌트 로딩

```javascript
// Intro.jsx
const [currentChartSet, setCurrentChartSet] = useState("chartSet_1");
const [ChartComponent, setChartComponent] = useState(null);
const [NewsComponent, setNewsComponent] = useState(null);

useEffect(() => {
    // 현재 적용된 차트셋 조회
    fetch('/chart/apply/current')
        .then(res => res.json())
        .then(data => {
            if(data.rt === "OK" && data.chartSet) {
                const chartSetName = data.chartSet.chartSetName;
                setCurrentChartSet(chartSetName);
                
                // 동적 컴포넌트 로드
                const Chart = lazy(() => import(`./chart/${chartSetName}/Chart.jsx`));
                const News = lazy(() => import(`./chart/${chartSetName}/News.jsx`));
                
                setChartComponent(() => Chart);
                setNewsComponent(() => News);
            }
        });
}, []);

// Suspense로 감싸서 렌더링
<Suspense fallback={<div>로딩 중...</div>}>
    {ChartComponent && <ChartComponent />}
    {NewsComponent && <NewsComponent />}
</Suspense>
```

---

## 13. 비속어 필터 시스템

### 비속어 필터링 프로세스

```java
// Service Layer
public String filterProfanity(String content) {
    List<ProfanityFilter> filters = dao.findAllActive();
    
    for(ProfanityFilter filter : filters) {
        if(content.contains(filter.getProfanityWord())) {
            if("작성불가".equals(filter.getFilterType())) {
                // 작성 불가 처리
                throw new IllegalArgumentException("비속어가 포함되어 있습니다.");
            } else if("마스킹".equals(filter.getFilterType())) {
                // 마스킹 처리
                String replacement = filter.getReplacementWord() != null 
                    ? filter.getReplacementWord() 
                    : "***";
                content = content.replace(filter.getProfanityWord(), replacement);
            }
        }
    }
    
    return content;
}
```

### 필터 타입
- **마스킹**: 비속어를 대체어로 변경 (예: "바보" → "***")
- **작성불가**: 비속어가 포함된 경우 게시글/댓글 작성 차단

---

## 14. 공구이벤트 상품 관리

### 공구이벤트 상품 등록 프로세스

```
[상품 정보 입력]
  - 상품명, 설명, 정가, 할인가
  - 재고 수량, 종료일시
  ↓
[옵션 설정]
  - 옵션명 (예: "크기")
  - 옵션값 (예: "10g", "20g")
  - 옵션별 추가 가격
  - 옵션별 재고 수량
  ↓
[이미지 업로드]
  - 다중 이미지 지원
  - 대표 이미지 지정 (IMAGE_ORDER = 1)
  ↓
[DB 저장]
  1. EVENT_PRODUCT1: 상품 정보 저장
  2. EVENT_PRODUCT_IMAGE1: 이미지 정보 저장
  3. EVENT_PRODUCT_OPTION1: 옵션 정보 저장
  ↓
[상태 관리]
  - 진행중: END_DATE > 현재시간 && 재고 > 0
  - 마감: 재고 = 0
  - 종료: END_DATE < 현재시간
```

### 주문 처리 프로세스

```java
// 주문 등록
@PostMapping("/event/order/write")
public Map<String, Object> orderWrite(@RequestBody Map<String, Object> params) {
    Long productSeq = Long.parseLong(params.get("productSeq").toString());
    int quantity = Integer.parseInt(params.get("quantity").toString());
    
    // 1. 상품 정보 조회
    EventProduct product = productService.view(productSeq);
    
    // 2. 재고 확인
    if(product.getStockQuantity() < quantity) {
        return "재고가 부족합니다.";
    }
    
    // 3. 주문 금액 계산
    Long orderPrice = product.getSalePrice() * quantity;
    
    // 4. 주문 저장
    EventOrder order = new EventOrder();
    order.setProductSeq(productSeq);
    order.setMemberId(memberId);
    order.setOrderQuantity(quantity);
    order.setOrderPrice(orderPrice);
    order.setOrderStatus("주문완료");
    
    // 5. 재고 차감
    product.setStockQuantity(product.getStockQuantity() - quantity);
    product.setSoldQuantity(product.getSoldQuantity() + quantity);
    
    // 6. 상태 업데이트
    if(product.getStockQuantity() == 0) {
        product.setEventStatus("마감");
    }
    
    return orderService.save(order);
}
```

---

## 15. 성능 최적화 전략

### 데이터베이스 최적화

#### 1. 인덱스 전략
- **복합 인덱스**: 자주 함께 조회되는 컬럼 조합
  ```sql
  CREATE INDEX IDX_BID1_AMOUNT ON BID1(IMAGEBOARD_SEQ, BID_AMOUNT DESC);
  ```
- **부분 인덱스**: 특정 조건의 데이터만 인덱싱
  ```sql
  CREATE INDEX IDX_BID1_VALID ON BID1(IMAGEBOARD_SEQ) 
  WHERE STATUS = '유효';
  ```

#### 2. 쿼리 최적화
- **서브쿼리 최적화**: EXISTS 사용으로 성능 향상
- **JOIN 최적화**: 필요한 컬럼만 SELECT
- **페이징 최적화**: ROWNUM 사용으로 메모리 절약

#### 3. 캐싱 전략 (향후 개선)
- **Redis 도입**: 자주 조회되는 데이터 캐싱
- **로컬 캐싱**: Frontend에서 sessionStorage 활용

### Frontend 최적화

#### 1. 컴포넌트 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useCallback**: 함수 메모이제이션
- **useMemo**: 계산 결과 메모이제이션

#### 2. 이미지 최적화
- **썸네일 생성**: 원본 이미지 대신 썸네일 사용
- **Lazy Loading**: 스크롤 시 이미지 로드
- **WebP 형식**: 이미지 압축률 향상

#### 3. 코드 스플리팅
- **React.lazy**: 컴포넌트 지연 로딩
- **Suspense**: 로딩 상태 관리

---

## 16. 보안 및 검증

### 입력 검증 전략

#### Frontend 검증
```javascript
// 입찰 금액 검증
const bidAmountNum = parseInt(bidAmount);
if(isNaN(bidAmountNum) || bidAmountNum <= 0) {
    alert("올바른 입찰 금액을 입력하세요.");
    return;
}

// 시작가격 이상 확인
if(bidAmountNum < startPrice) {
    alert(`입찰 시작가격(${startPrice.toLocaleString()}원) 이상으로 입력하세요.`);
    return;
}

// 최고 입찰 금액보다 높은지 확인
if(currentHighestBid > 0 && bidAmountNum <= currentHighestBid) {
    alert(`현재 최고 입찰 금액(${currentHighestBid.toLocaleString()}원)보다 높은 금액을 입력하세요.`);
    return;
}
```

#### Backend 검증
```java
// 작성자 본인 입찰 방지
if(imageboard.getImageid().equals(bidderId)) {
    return "자신이 등록한 상품에는 입찰할 수 없습니다.";
}

// 경매 종료 여부 확인
if("판매완료".equals(status) || "종료".equals(status)) {
    return "이미 종료된 경매입니다.";
}

// 최고 입찰 금액 검증
Integer maxBid = bidService.getMaxBidAmountByImageboardSeq(imageboardSeq);
if(maxBid != null && bidAmount <= maxBid) {
    return "최고 입찰 금액보다 높은 금액을 입력하세요.";
}
```

### SQL Injection 방지
- **JPA 사용**: 파라미터 바인딩 자동 처리
- **Native Query**: @Param을 통한 파라미터 바인딩
- **PreparedStatement**: 직접 SQL 사용 시 PreparedStatement 활용

### XSS 방지
- **입력 데이터 이스케이프**: React는 기본적으로 XSS 방지
- **HTML 태그 제거**: 게시글/댓글 작성 시 HTML 태그 필터링

---

## 17. 에러 처리 및 예외 관리

### 에러 처리 전략

#### Frontend 에러 처리
```javascript
try {
    const response = await fetch(url);
    if(!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if(data.rt === "FAIL") {
        alert(data.msg || "오류가 발생했습니다.");
        return;
    }
    // 성공 처리
} catch(error) {
    console.error("에러 발생:", error);
    alert("서버와 통신 중 오류가 발생했습니다.");
}
```

#### Backend 에러 처리
```java
@GetMapping("/imageboard/imageboardList")
public Map<String, Object> imageboardList(...) {
    Map<String, Object> map = new HashMap<>();
    
    try {
        // 비즈니스 로직 처리
        List<Imageboard> list = service.imageboardList(startNum, endNum);
        map.put("rt", "OK");
        map.put("items", list);
    } catch(Exception e) {
        System.out.println("목록 조회 오류: " + e.getMessage());
        e.printStackTrace();
        map.put("rt", "FAIL");
        map.put("msg", "목록 조회 중 오류가 발생했습니다.");
    }
    
    return map;
}
```

---

## 18. 트러블슈팅 경험

### 주요 이슈 및 해결 방법

#### 1. 입찰 베스트 리스트 성능 문제
- **문제**: 모든 페이지를 순회하여 데이터 수집 (비효율적)
- **해결**: Backend에서 입찰 수 기준 정렬 쿼리 추가 검토
- **개선**: Native Query로 한 번에 처리

#### 2. 시간대별 통계 조회 실패
- **문제**: Oracle의 EXTRACT 함수가 TIMESTAMP와 호환성 문제
- **해결**: TO_NUMBER(TO_CHAR(maxBidTime, 'HH24')) 사용
- **학습**: Oracle 버전별 함수 차이 고려 필요

#### 3. 카테고리별 통계 카테고리명 표시 오류
- **문제**: Recharts의 PieChart에서 카테고리명이 "count"로 표시
- **해결**: nameKey="category" 설정 및 Tooltip/Legend formatter 수정
- **학습**: 라이브러리 문서 상세 확인 필요

#### 4. 판매 재개 후 상태 미변경
- **문제**: API 호출 후 즉시 데이터 조회 시 변경사항 미반영
- **해결**: setTimeout으로 200ms 지연 후 데이터 조회
- **개선**: WebSocket 또는 Polling으로 실시간 업데이트 고려

---

## 19. 프로젝트 성과 및 학습 내용

### 구현 완료 기능
- ✅ 경매 시스템 (등록, 입찰, 관리, 통계)
- ✅ 회원 관리 시스템 (가입, 로그인, 정지, 해제)
- ✅ 게시판 시스템 (일반/공구이벤트)
- ✅ 관리자 시스템 (회원/게시판/경매 관리)
- ✅ 통계 및 분석 (거래 통계, 카테고리별, 시간대별)
- ✅ CSS/차트셋 동적 관리
- ✅ 비속어 필터
- ✅ 알림 시스템

### 기술 역량 향상
- **React**: Hooks, Router, 동적 컴포넌트 로딩
- **Spring Boot**: JPA, RESTful API, 트랜잭션 관리
- **Oracle DB**: 복잡한 통계 쿼리, 인덱스 최적화
- **프로젝트 관리**: 모듈화, 코드 재사용, 문서화

### 아키텍처 이해
- **3-Tier Architecture**: 레이어 분리 및 역할 이해
- **RESTful API**: HTTP 메서드 및 상태 코드 활용
- **ORM**: JPA를 통한 객체-관계 매핑
- **SPA**: React Router를 통한 클라이언트 사이드 라우팅

---

## 20. 향후 개선 방향

### 기능 개선
1. **실시간 알림**: WebSocket을 통한 실시간 알림
2. **결제 시스템**: PG사 연동 (토스페이먼츠, 이니시스 등)
3. **이메일 인증**: 회원 가입 시 이메일 인증
4. **모바일 앱**: React Native를 통한 모바일 앱 개발

### 성능 개선
1. **캐싱 시스템**: Redis 도입
2. **CDN 활용**: 정적 파일 CDN 배포
3. **데이터베이스 샤딩**: 대용량 데이터 처리
4. **로드 밸런싱**: 서버 부하 분산

### 보안 강화
1. **JWT 토큰**: 세션 대신 JWT 토큰 사용
2. **HTTPS**: SSL/TLS 인증서 적용
3. **Rate Limiting**: API 호출 제한
4. **로그 관리**: 로그 수집 및 분석 시스템

---

## 21. 마무리

### 핵심 가치
- **사용자 중심**: 직관적인 UI/UX 설계
- **안정성**: 데이터 무결성 보장 및 트랜잭션 관리
- **확장성**: 모듈화된 구조로 기능 추가 용이
- **성능**: 최적화된 쿼리 및 인덱스 설계

### 프로젝트 특징
- **풀스택 개발**: Frontend부터 Backend, Database까지 전 과정 구현
- **실무 경험**: 실제 사용 가능한 수준의 시스템 구축
- **문서화**: 상세한 기술 문서 및 가이드 작성

### 감사합니다
**골드옥션 시스템**
- 골드 및 귀금속 경매 플랫폼
- React + Spring Boot + Oracle DB
- 안전하고 투명한 경매 시스템

---

## 발표 시간 배분 (6~10분)

1. **프로젝트 개요** (30초)
2. **시스템 아키텍처 상세** (1분)
3. **전체 시스템 흐름 - 경매 등록** (1분)
4. **전체 시스템 흐름 - 입찰 프로세스** (1분)
5. **페이징 처리 기술** (30초)
6. **데이터베이스 설계 상세** (30초)
7. **입찰 베스트 리스트 알고리즘** (30초)
8. **거래 통계 시스템** (1분)
9. **이미지 처리 시스템** (30초)
10. **계정 정지 시스템** (30초)
11. **CSS/차트셋 동적 로딩** (30초)
12. **비속어 필터 시스템** (30초)
13. **공구이벤트 상품 관리** (30초)
14. **성능 최적화 전략** (30초)
15. **보안 및 검증** (30초)
16. **에러 처리 및 예외 관리** (30초)
17. **트러블슈팅 경험** (30초)
18. **프로젝트 성과** (30초)
19. **향후 개선 방향** (30초)
20. **마무리** (30초)

**총 발표 시간**: 약 9~10분

