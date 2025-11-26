✅ 금시세 / 은시세 무료 API 제공 사이트 예시

[Fred API] 달러 인덱스와 금, 은, 구리 비교 그래프 URL=https://yenpa.tistory.com/76
[React] React를 통한 간단 댓글구현              URL=https://ambious12.tistory.com/54
React에서 ApexCharts로 차트 그리기 - BLOG_YHUJ  URL=https://yhuj79.github.io/React/240909/


다음은 금(Gold, XAU), 은(Silver, XAG) 시세를 실시간 또는 거의 실시간으로 제공하는 무료 API들입니다:

API	설명
Freegoldprice.org	금, 은, 플래티넘, 팔라듐 등 귀금속 실시간 가격 제공. 무료 플랜에서도 60초 주기(1분) 갱신 가능. 
freegoldprice.org

Metals-API	금(XAU), 은(XAG) 등의 실시간 / 과거 시세 제공. JSON 형태로 받기 가능. 
api.metals-api.com
+1

MetalpriceAPI	실시간 금/은 가격 + 과거 시세 제공. 여러 통화(150개 이상) 지원. 
metalpriceapi.com
+1

GoldpriceZ	무료 Gold / Silver 가격 API. 시간당 요청 제한이 있음 (“30-60 API 요청 / 시간”)이라는 안내가 있음. 
Gold Price Z

Metals.Dev	실시간 스팟 가격 + 통화 변환 기능 제공. 무료 키를 발급받을 수 있고, 처음 100 요청은 무료. 
Metals.Dev

Gold Rate API (goldapi.net)	금, 은, 플래티넘 실시간 가격 데이터 제공. 무료 플랜 있음. 
GoldAPI
⚠ 고려할 점 / 주의사항

갱신 주기: 일부 무료 API는 “최소 1분 간격”으로 갱신 가능하지만, 진짜 초 단위 실시간 스트림은 제한이 있을 수 있습니다.

요청 제한(Rate Limit): 무료 플랜은 요청 수에 제한이 있는 경우가 많습니다. 예: MetalAPI는 월간 요청 수 제한이 있음. 
MetalAPI

단위 및 통화: 금/은 가격을 **트로이 온스(troy ounce)**로 주는 경우가 많고, 그 외 단위(그램, 킬로그램)나 통화를 지원하는지 확인해야 합니다.

사용 목적: “실시간 데이터” API라 해도 전문 트레이딩 수준의 초단위 가격 스트림(트레이딩 봇용)에는 적합하지 않을 수 있습니다.

신뢰도: 무료 API는 데이터 공급원이나 정확도에 제한이 있을 수 있으니, 중요한 비즈니스 용도라면 제공사 안정성이나 SLA(가동성)도 확인하는 것이 좋습니다.

📌 예제: MetalpriceAPI 사용법 (금/은 실시간 가격 조회)

아래는 MetalpriceAPI를 사용해서 금(XAU)과 은(XAG) 현재 가격을 가져오는 간단한 예제입니다.





예제: MetalpriceAPI 사용법 (금/은 실시간 가격 조회)
API_KEY = "YOUR_API_KEY"  # MetalpriceAPI에서 발급받은 키
BASE_URL = "https://metalpriceapi.com/api"




// Alpha Vantage API 키
const API_KEY = 'GNYJONLPYPY5UC5E'

// 실제 금시세 데이터를 가져오는 함수
const fetchGoldPrice = async () => {
  try {
    // Alpha Vantage API로 실제 금시세 가져오기 (XAU = 금, USD = 미국 달러)
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`
    )
    

    
순위별 참고 사이트  
1. 금괴 경매
https://www.catawiki.com/en/a/th/4167-bullion-auction-gold-bars?gad_source=1&gad_campaignid=23247640976&gbraid=0AAAABB9Es6YilqLErpEE76HVvY4aKoJRK&gclid=Cj0KCQiAiebIBhDmARIsAE8PGNLIqNoLTWoitb3KV26haR2EmPKSzjLgaf9k6ujQxayJ6rA1zbQRMhoaAjpREALw_wcB

2. 그래프 표시 및 메뉴 (한국 금거래소)
https://www.koreagoldx.co.kr/

3. https://www.allsurplus.com/en/biopharma   -> 기기경매사이트
4. https://www.thebranfordgroup.com/ 		  -> 기기경매사이트	
5. https://www.bidbuy.co.kr/auctions/yahoo   -> 경매중계사이트 


API 참고 
:정보데이터 시스템에서 등록된 금거래소 API 가져오기
https://data.krx.co.kr/contents/MDC/DATA/datasale/index.cmd?viewNm=MDCDATA003
금거래소 API 를 가져와 오늘 금시세를 보여주게 한다.
금거래소에는 금 시세 변동에 대한 그래프가 있는데 -- 활용


(1) 오픈API 상세
-------------------------------------------------------------------------
KRX금시장에 상장된 금상품의 시세 정보를 제공
일반상품시세정보는 한국거래소에서 제공하는 주요 일반상품의 시장 시세 정보를 제공하는 데이터입니다. 해당 정보는 석유전자상거래시장, KRX 금시장, 탄소배출권시장에 상장된 상품들의 실시간 시세, 전일 대비 등락률, 거래량 등을 포함합니다.
https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15094805

방법2
-----------------------------------------------------------
https://yenpa.tistory.com/65#google_vignette         설명

API : https://fred.stlouisfed.org/

방법 3
-----------------------------------------------------------
챠트 모음 : https://kr.tradingview.com/

방법 4
-----------------------------------------------------------
chatgpt : react 구현 설명



(1) 챠트 구현 오픈API 
-------------------------------------------------------------------------
KRX금시장에 상장된 금상품의 시세 정보를 제공
일반상품시세정보는 한국거래소에서 제공하는 주요 일반상품의 시장 시세 정보를 제공하는 데이터입니다. 해당 정보는 석유전자상거래시장, KRX 금시장, 탄소배출권시장에 상장된 상품들의 실시간 시세, 전일 대비 등락률, 거래량 등을 포함합니다.
https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15094805

구현기술 : ApexCharts.js
모듈 설치 :  npm install react-apexcharts
참고구현설명 링크 : https://yhuj79.github.io/React/240909/


// Alpha Vantage API 키
const API_KEY = 'GNYJONLPYPY5UC5E'

// 실제 금시세 데이터를 가져오는 함수
const fetchGoldPrice = async () => {
  try {
    // Alpha Vantage API로 실제 금시세 가져오기 (XAU = 금, USD = 미국 달러)
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`
    )




(5-1) 게시판 댓글구현 
-------------------------------------------------------------------------
https://ambious12.tistory.com/54       --> 검토



/getGoldPriceInfo 금시세
Example Value
{
  "header": {
    "resultCode": "string",
    "resultMsg": "string"
  },
  "body": {
    "numOfRows": 0,
    "pageNo": 0,
    "totalCount": 0,
    "items": {
      "item": {
        "trqu": 0,
        "trPrc": 0,
        "basDt": "string",
        "srtnCd": "string",
        "isinCd": "string",
        "itmsNm": "string",
        "clpr": 0,
        "vs": 0,
        "fltRt": 0,
        "mkp": 0,
        "hipr": 0,
        "lopr": 0
      }
    }
  }
}

Model
{
header	Header{...}
body	Body_GoldPriceInfo{
numOfRows	[...]
pageNo	[...]
totalCount	[...]
items	item2{...}
}
}