# Transaction Statistics 구현 가능성 검토 결과

> **참고**: 공동구매 구현은 나중에 따로 만들 예정이므로, 본 문서는 **경매(IMAGEBOARD1)** 거래 통계만을 다룹니다.

## 📋 요구사항 분석

### 1. 총 거래 횟수
- **기간**: 1년, 1개월, 1주, 1일 선택시 집계
- **필요 데이터**: 완료된 거래의 개수

### 2. 총 거래 금액
- **기간**: 1년, 1개월, 1주, 1일 선택시 집계
- **필요 데이터**: 완료된 거래의 금액 합계

### 3. 시간대별 거래 현황
- **기간**: 1개월, 1주, 1일 선택시 집계
- **필요 데이터**: 시간대별(0시~23시) 거래 건수 및 금액

### 4. 카테고리별 거래 통계
- **기간**: 1년, 1개월, 1주, 1일 선택시 집계
- **필요 데이터**: 카테고리별 거래 건수와 비율 (그래프 표시)

### 5. 완료된 거래의 거래방식 통계
- **필요 데이터**: 직거래, 매장방문, 에스크로, 중계소이용별 건수와 비율 (그래프 표시)

---

## ✅ 현재 DB 구조 분석

### 1. IMAGEBOARD1 (경매 상품 테이블)
```sql
- SEQ: 상품 번호 (PK)
- STATUS: 상태 (진행중, 판매완료, 종료, 포기/판매중지)
- TRANSACTION_METHOD: 거래방식 (직거래, 매장방문, 에스크로, 중계소 이용)
- CATEGORY: 카테고리 (골드, 실버, 백금, 다이아, 귀금속, 주화, 금은정련, 유가증권)
- AUCTION_END_DATE: 경매 종료일
- LOGTIME: 등록일
- IMAGEPRICE: 경매 시작가격
- MAX_BID_PRICE: 최고 낙찰 가격 (즉시 구매 가격)
```

### 2. BID1 (입찰 테이블)
```sql
- BID_SEQ: 입찰 번호 (PK)
- IMAGEBOARD_SEQ: 경매 상품 번호 (FK)
- BID_AMOUNT: 입찰 금액
- BID_TIME: 입찰 시간
- STATUS: 상태 (유효, 취소, 낙찰)
```

### 3. EVENT_ORDER1 (공동구매 주문 테이블) - 참고용
> **참고**: 공동구매는 별도 구현 예정이므로 본 통계에서는 제외
```sql
- ORDER_SEQ: 주문 번호 (PK)
- PRODUCT_SEQ: 상품 번호 (FK)
- ORDER_PRICE: 주문 가격
- ORDER_STATUS: 주문 상태 (주문완료/취소/배송중/배송완료)
- CREATED_DATE: 주문일
```

### 4. EVENT_PRODUCT1 (공동구매 상품 테이블) - 참고용
> **참고**: 공동구매는 별도 구현 예정이므로 본 통계에서는 제외
```sql
- PRODUCT_SEQ: 상품 번호 (PK)
- EVENT_STATUS: 이벤트 상태 (진행중/마감/종료)
- CATEGORY: (카테고리 정보가 있는지 확인 필요)
```

---

## ✅ 구현 가능 여부

### **결론: Oracle DB를 새로 생성하지 않고도 구현 가능합니다!**

### ✅ 구현 가능한 항목

#### 1. 총 거래 횟수 ✅
- **경매 거래**: `IMAGEBOARD1` 테이블에서 `STATUS IN ('판매완료', '종료')` 조건으로 조회
- **기간 필터**: `AUCTION_END_DATE` 기준
- **구분**: 판매완료와 종료는 별도로 집계 가능

#### 2. 총 거래 금액 ✅
- **경매 거래**: `STATUS IN ('판매완료', '종료')`인 경매의 최고 입찰 금액 합계
  - `BidService.getMaxBidAmountByImageboardSeq()` 메서드 활용
  - 또는 `BID1` 테이블에서 `STATUS = '유효'`인 최고 금액 조회
- **조건**: 판매완료 + 판매종료 된 기준으로 최고 입찰금액 조회

#### 3. 시간대별 거래 현황 ✅
- **경매 거래**: `BID1.BID_TIME`에서 최고 입찰 시간 사용
- **처리 방법**: 각 경매의 최고 입찰 시간을 기준으로 시간대별 그룹화
- **주의**: `AUCTION_END_DATE`는 DATE 타입이므로 시간 정보 없음. `BID_TIME` (TIMESTAMP) 사용

#### 4. 카테고리별 거래 통계 ✅
- **경매 거래**: `IMAGEBOARD1.CATEGORY`로 그룹화
- **조건**: `STATUS IN ('판매완료', '종료')`인 경매만 집계

#### 5. 완료된 거래의 거래방식 통계 ✅
- **경매 거래**: `IMAGEBOARD1.TRANSACTION_METHOD`로 그룹화
- **조건**: `STATUS IN ('판매완료', '종료')`인 경매만 집계
- **거래방식**: 직거래, 매장방문, 에스크로, 중계소 이용

---

## ⚠️ 주의사항 및 추가 작업 필요 사항

### 1. 거래 완료 기준 정의 ✅

**경매 상태 구분**:
- **경매**: `STATUS IN ('판매완료', '종료')` 모두 거래 완료로 간주 
- **구분**: 판매완료와 종료는 별도로 구분하여 집계 가능

**상태별 상세 설명**:

1. **판매완료** (`STATUS = '판매완료'`)
   - 즉시 구매 또는 낙찰 완료된 거래
   - 최고 입찰 금액 사용

2. **판매종료** (`STATUS = '종료'` + 입찰자 있음)
   - 종료일이 지나 자동 종료된 거래 중 입찰자가 있는 경우
   - 상품이 팔렸으므로 판매종료로 처리
   - 최고 입찰 금액 사용

3. **유찰종료** (`STATUS = '종료'` + 입찰자 없음)
   - 거래가 안되고 종료일만 지난 거래
   - 거래 금액이 없어 거래 없이 유찰종료 됨으로 처리
   - 총 거래 금액에 포함하지 않음 (0원 처리)

### 2. 최종 거래 금액 산정 방법 ✅

**사용 목적**: 통계 페이지의 "총 거래 금액" 표시에 사용
- 사용자가 기간(1년, 1개월, 1주, 1일)을 선택하면 해당 기간 동안 완료된 모든 거래의 금액 합계를 표시
- 예: "지난 1개월 총 거래 금액: 50,000,000원"

**산정 방법**:
- **경매**: 판매완료 + 판매종료 된 기준으로 최고 입찰금액 조회
  - `BidService.getMaxBidAmountByImageboardSeq()`로 최고 입찰 금액 조회
  - 또는 `BID1` 테이블에서 `STATUS = '유효'`인 최고 금액
  - 조건: `IMAGEBOARD1.STATUS IN ('판매완료', '종료')` **AND 입찰자가 있는 경우만**

**주의사항**:
- **판매완료**: 즉시 구매 또는 낙찰 완료된 거래 → 최고 입찰 금액 사용
- **판매종료**: 종료일이 지나 자동 종료된 거래 → 입찰자가 있으면 최고 입찰 금액 사용
- **유찰 처리**: 입찰자가 없는 거래는 거래 금액이 없으므로 총 거래 금액에 포함하지 않음



### 3. 시간대별 통계를 위한 데이터 타입 확인 ✅
- **처리 방법**: `BID1.BID_TIME`에서 최고 입찰 시간 사용
- `IMAGEBOARD1.AUCTION_END_DATE`는 `DATE` 타입이므로 시간 정보 없음
- `BID1.BID_TIME`은 `TIMESTAMP` 타입이므로 시간 정보 있음
- **구현**: 각 경매의 최고 입찰 시간을 기준으로 시간대별 그룹화

---

## 📊 구현 방법 제안

### 1. 백엔드 API 엔드포인트 설계

```
GET /statistics/transaction/count?period=1year|1month|1week|1day
GET /statistics/transaction/amount?period=1year|1month|1week|1day
GET /statistics/transaction/hourly?period=1month|1week|1day
GET /statistics/transaction/category?period=1year|1month|1week|1day
GET /statistics/transaction/method?period=all
```

### 2. 데이터 조회 로직

#### 총 거래 횟수
```java
// 경매 거래: 판매완료 + 종료 모두 포함
SELECT 
    STATUS,
    COUNT(*) as count
FROM IMAGEBOARD1 
WHERE STATUS IN ('판매완료', '종료')
AND AUCTION_END_DATE BETWEEN :startDate AND :endDate
GROUP BY STATUS

// 전체 거래 횟수 (판매완료 + 종료 합계)
SELECT COUNT(*) FROM IMAGEBOARD1 
WHERE STATUS IN ('판매완료', '종료')
AND AUCTION_END_DATE BETWEEN :startDate AND :endDate
```

#### 총 거래 금액
```java
// 경매 거래: 판매완료 + 판매종료(입찰자 있는 종료) 기준으로 최고 입찰 금액 합계
// 유찰종료(입찰자 없는 종료)는 제외
SELECT SUM(maxBidAmount) FROM (
    SELECT 
        i.SEQ,
        MAX(b.BID_AMOUNT) as maxBidAmount
    FROM IMAGEBOARD1 i
    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ
    WHERE i.STATUS IN ('판매완료', '종료')
    AND b.STATUS = '유효'
    AND i.AUCTION_END_DATE BETWEEN :startDate AND :endDate
    GROUP BY i.SEQ
    HAVING COUNT(b.BID_SEQ) > 0  -- 입찰자가 있는 경우만 (유찰 제외)
)
```

#### 시간대별 거래 현황
```java
// 경매 거래: 최고 입찰 시간 기준 (판매완료 + 판매종료, 유찰 제외)
SELECT 
    EXTRACT(HOUR FROM maxBidTime) as hour,
    COUNT(*) as count,
    SUM(maxBidAmount) as amount
FROM (
    SELECT 
        i.SEQ,
        MAX(b.BID_AMOUNT) as maxBidAmount,
        MAX(b.BID_TIME) as maxBidTime
    FROM IMAGEBOARD1 i
    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ
    WHERE i.STATUS IN ('판매완료', '종료')
    AND b.STATUS = '유효'
    AND b.BID_TIME BETWEEN :startDate AND :endDate
    GROUP BY i.SEQ
    HAVING COUNT(b.BID_SEQ) > 0  -- 입찰자가 있는 경우만
)
GROUP BY EXTRACT(HOUR FROM maxBidTime)
ORDER BY hour
```

#### 카테고리별 거래 통계
```java
// 경매 거래: 판매완료 + 판매종료 기준 (유찰 제외)
SELECT 
    CATEGORY,
    COUNT(*) as count,
    SUM(maxBidAmount) as amount,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
    SELECT 
        i.SEQ,
        i.CATEGORY,
        MAX(b.BID_AMOUNT) as maxBidAmount
    FROM IMAGEBOARD1 i
    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ
    WHERE i.STATUS IN ('판매완료', '종료')
    AND b.STATUS = '유효'
    AND i.AUCTION_END_DATE BETWEEN :startDate AND :endDate
    GROUP BY i.SEQ, i.CATEGORY
    HAVING COUNT(b.BID_SEQ) > 0  -- 입찰자가 있는 경우만
)
GROUP BY CATEGORY
ORDER BY count DESC
```

#### 거래방식별 통계
```java
// 경매 거래: 판매완료 + 판매종료 기준 (유찰 제외)
SELECT 
    TRANSACTION_METHOD,
    COUNT(*) as count,
    SUM(maxBidAmount) as amount,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
    SELECT 
        i.SEQ,
        i.TRANSACTION_METHOD,
        MAX(b.BID_AMOUNT) as maxBidAmount
    FROM IMAGEBOARD1 i
    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ
    WHERE i.STATUS IN ('판매완료', '종료')
    AND b.STATUS = '유효'
    GROUP BY i.SEQ, i.TRANSACTION_METHOD
    HAVING COUNT(b.BID_SEQ) > 0  -- 입찰자가 있는 경우만
)
GROUP BY TRANSACTION_METHOD
ORDER BY count DESC
```

---

## ✅ 최종 결론

**Oracle DB를 새로 생성하지 않고도 모든 통계 기능을 구현할 수 있습니다!**

### 필요한 작업:
1. ✅ 기존 테이블 구조로 구현 가능 (경매 거래만)
2. ✅ 백엔드 통계 API 컨트롤러/서비스/DAO 구현
3. ✅ 프론트엔드 통계 페이지 및 그래프 컴포넌트 구현
4. ✅ 판매완료와 종료를 구분하여 표시하는 기능 구현

### 장점:
- 기존 DB 구조 활용 가능
- 추가 테이블 생성 불필요
- 기존 데이터로 바로 통계 생성 가능

### 단점:
- 복잡한 JOIN 쿼리 필요
- 성능 최적화를 위한 인덱스 확인 필요

