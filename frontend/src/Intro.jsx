import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    fetchRecentList, 
    fetchGoldNews, 
    fetchGoldPrice, 
    fetchVisiblePopups, 
    handleClosePopup, 
    loadChartSet 
} from "./script/intro.js";

function Intro() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("GOLD"); // GOLD, SILVER, COIN
    const [domesticPeriod, setDomesticPeriod] = useState("5개월"); // 1개월, 5개월, 1년, 3년
    const [internationalPeriod, setInternationalPeriod] = useState("5개월"); // 실시간, 1개월, 5개월, 1년, 3년
    
    // 금 시세 데이터 상태
    const [domesticChartData, setDomesticChartData] = useState([]);
    const [internationalChartData, setInternationalChartData] = useState([]);
    const [yearComparisonData, setYearComparisonData] = useState([
        { name: "전년", value: 0 },
        { name: "오늘", value: 0 }
    ]);
    const [tradingStandard, setTradingStandard] = useState({
        quotationTime: "",
        internationalPrice: 0,
        exchangeRate: 0,
        priceChange: 0,
        rateChange: 0
    });
    const [priceLoading, setPriceLoading] = useState(false);
    
    // 네이버 경제 뉴스 데이터
    const [newsList, setNewsList] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState(null);
    
    // 경매 목록 데이터
    const [bestBidList, setBestBidList] = useState([]);
    const [recentList, setRecentList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 팝업 데이터
    const [popupList, setPopupList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [currentPopup, setCurrentPopup] = useState(null);
    const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
    
    // 차트셋 관련 상태
    const [currentChartSet, setCurrentChartSet] = useState("chartSet_1");
    const [ChartComponent, setChartComponent] = useState(null);
    const [NewsComponent, setNewsComponent] = useState(null);
    const [chartComponentsLoaded, setChartComponentsLoaded] = useState(false);
    
    // 현재 적용된 차트셋 조회 및 컴포넌트 로드
    useEffect(() => {
        loadChartSet(setCurrentChartSet, setChartComponent, setNewsComponent, setChartComponentsLoaded);
    }, []);

    // 입찰 베스트 목록 조회 (입찰자 수 기준 정렬, 경매 진행 중인 것만)
    const fetchBestBids = async () => {
        try {
            // 모든 페이지를 조회하여 진행중인 상품을 모두 수집
            let allActiveItems = [];
            let currentPage = 1;
            let hasMorePages = true;
            
            while(hasMorePages) {
                const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=${currentPage}`);
                if(response.ok) {
                    const data = await response.json();
                    if(data.rt === "OK") {
                        const items = data.items || [];
                        
                        // 경매 진행 중인 항목만 필터링 (STATUS === '진행중')
                        const activeItems = items.filter(item => {
                            return item.status === '진행중';
                        });
                        
                        allActiveItems = [...allActiveItems, ...activeItems];
                        
                        // 다음 페이지가 있는지 확인
                        const totalPages = data.totalP || 1;
                        if(currentPage >= totalPages || items.length === 0) {
                            hasMorePages = false;
                        } else {
                            currentPage++;
                        }
                    } else {
                        hasMorePages = false;
                    }
                } else {
                    hasMorePages = false;
                }
            }
            
            // 입찰 수 기준으로 정렬 (내림차순 - 입찰 수가 많은 순서)
            const sorted = [...allActiveItems].sort((a, b) => {
                const bidCountA = Number(a.bidCount) || 0;
                const bidCountB = Number(b.bidCount) || 0;
                
                // 입찰 수가 많은 순서로 정렬
                if(bidCountB !== bidCountA) {
                    return bidCountB - bidCountA;
                }
                
                // 입찰 수가 같으면 최근 등록일 순으로 정렬 (내림차순)
                const timeA = a.logtime ? new Date(a.logtime).getTime() : 0;
                const timeB = b.logtime ? new Date(b.logtime).getTime() : 0;
                return timeB - timeA;
            });
            
            setBestBidList(sorted.slice(0, 5)); // 상위 5개만
        } catch(err) {
            console.error("입찰 베스트 조회 오류:", err);
        }
    };

    // 경매 목록 조회 및 뉴스 조회
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchBestBids(), 
            fetchRecentList(setRecentList), 
            fetchGoldNews(setNewsList, setNewsLoading, setNewsError), 
            fetchVisiblePopups(setPopupList, setShowPopup, setCurrentPopup, setCurrentPopupIndex)
        ])
            .finally(() => setLoading(false));
    }, []);
    
    // 초기 로딩 및 탭 변경 시 금 시세 조회
    useEffect(() => {
        if(activeTab === "GOLD") {
            fetchGoldPrice(
                activeTab, 
                setPriceLoading, 
                setTradingStandard, 
                setYearComparisonData, 
                setDomesticChartData, 
                setInternationalChartData
            );
        } else {
            // SILVER, COIN 탭일 때는 데이터 초기화
            setDomesticChartData([]);
            setInternationalChartData([]);
            setYearComparisonData([{ name: "전년", value: 0 }, { name: "오늘", value: 0 }]);
            setTradingStandard({
                quotationTime: "",
                internationalPrice: 0,
                exchangeRate: 0,
                priceChange: 0,
                rateChange: 0
            });
        }
    }, [activeTab, domesticPeriod, internationalPeriod]);

    return (
        <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "20px",
            marginTop: "70px",
            paddingTop: "0"
        }}>
            {/* 팝업 표시 - 모든 팝업을 동시에 표시 */}
            {showPopup && popupList.length > 0 && popupList.map((popup, index) => (
                <div 
                    key={popup.popupSeq}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: index === 0 ? "rgba(0, 0, 0, 0.5)" : "transparent",  // 첫 번째 팝업만 배경 표시
                        zIndex: 9999 - index,  // 첫 번째 팝업이 가장 위에
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        padding: "65px",
                        pointerEvents: index === 0 ? "auto" : "none"  // 첫 번째 팝업만 클릭 가능
                    }}
                >
                    <div style={{
                        position: "relative",
                        maxWidth: "600px",
                        maxHeight: "80vh",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                        marginLeft: `${-450 + (index * 300)}px`,  // 각 팝업마다 50px씩 오른쪽으로 이동
                        marginTop: `${index * 50}px`,  // 각 팝업마다 50px씩 아래로 이동
                        pointerEvents: "auto"  // 팝업 자체는 클릭 가능
                    }}>
                        {/* 백그라운드 이미지 */}
                        {popup.backgroundImage && (
                            <div style={{
                                width: "100%",
                                height: "200px",
                                backgroundImage: `url(http://localhost:8080/storage/${popup.backgroundImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}></div>
                        )}
                        
                        {/* 팝업 내용 */}
                        <div style={{
                            padding: "20px"
                        }}>
                            <h3 style={{
                                marginTop: 0,
                                marginBottom: "15px",
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                {popup.popupTitle}
                            </h3>
                            
                            <div style={{
                                marginBottom: "20px",
                                fontSize: "14px",
                                color: "#666",
                                lineHeight: "1.6",
                                whiteSpace: "pre-wrap"
                            }}>
                                {popup.popupContent}
                            </div>
                            
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <label style={{
                                    fontSize: "13px",
                                    color: "#999",
                                    cursor: "pointer"
                                }}>
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if(e.target.checked) {
                                                // 오늘 하루 보지 않기 (localStorage에 저장)
                                                localStorage.setItem(`popup_${popup.popupSeq}_hidden`, new Date().toDateString());
                                                // 현재 팝업을 리스트에서 제거하고 다음 팝업 표시
                                                const updatedList = popupList.filter(p => p.popupSeq !== popup.popupSeq);
                                                if(updatedList.length > 0) {
                                                    setPopupList(updatedList);
                                                    setCurrentPopup(updatedList[0]);
                                                    setCurrentPopupIndex(0);
                                                } else {
                                                    handleClosePopup(currentPopupIndex, popupList, setCurrentPopupIndex, setCurrentPopup, setShowPopup);
                                                }
                                            }
                                        }}
                                    />
                                    {" "}오늘 하루 보지 않기
                                </label>
                                
                                <span
                                    onClick={() => {
                                        // 현재 팝업을 리스트에서 제거하고 다음 팝업 표시
                                        const updatedList = popupList.filter(p => p.popupSeq !== popup.popupSeq);
                                        if(updatedList.length > 0) {
                                            setPopupList(updatedList);
                                            setCurrentPopup(updatedList[0]);
                                            setCurrentPopupIndex(0);
                                        } else {
                                            handleClosePopup(currentPopupIndex, popupList, setCurrentPopupIndex, setCurrentPopup, setShowPopup);
                                        }
                                    }}
                                    style={{
                                        fontSize: "14px",
                                        color: "#666",
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        marginLeft: "20px"
                                    }}
                                >
                                    [× 닫기]
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {/* 상단 탭 */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "30px"
            }}>
                <button
                    onClick={() => setActiveTab("GOLD")}
                    style={{
                        padding: "6px 15px",
                        backgroundColor: activeTab === "GOLD" ? "#ff6b35" : "#f0f0f0",
                        color: activeTab === "GOLD" ? "#fff" : "#333",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    GOLD
                </button>
                <button
                    onClick={() => setActiveTab("SILVER")}
                    style={{
                        padding: "6px 15px",
                        backgroundColor: activeTab === "SILVER" ? "#ff6b35" : "#f0f0f0",
                        color: activeTab === "SILVER" ? "#fff" : "#333",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    SILVER
                </button>
                <button
                    onClick={() => setActiveTab("COIN")}
                    style={{
                        padding: "6px 15px",
                        backgroundColor: activeTab === "COIN" ? "#ff6b35" : "#f0f0f0",
                        color: activeTab === "COIN" ? "#fff" : "#333",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    COIN
                </button>
            </div>

            {/* 메인 콘텐츠 영역 */}
            {activeTab === "SILVER" ? (
                // 실버 탭: 골드 시세처럼 두 개의 박스
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "40px"
                }}>
                    {/* 왼쪽 패널: 은시세 */}
                    <div style={{
                        border: "1px solid #c0c0c0",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff"
                    }}>
                        <div style={{
                            marginBottom: "15px"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                                은 시세 (XAG/USD)
                            </h3>
                        </div>
                        
                        {/* 기간 선택 탭 */}
                        <div style={{
                            display: "flex",
                            gap: "5px",
                            marginBottom: "20px"
                        }}>
                            {["1개월", "5개월", "1년", "3년"].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setDomesticPeriod(period)}
                                    style={{
                                        padding: "4px 8px",
                                        backgroundColor: domesticPeriod === period ? "#007bff" : "#f0f0f0",
                                        color: domesticPeriod === period ? "#fff" : "#333",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "10px"
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                        
                        {/* TradingView 은시세 그래프 */}
                        <div style={{ marginBottom: "20px", height: "250px" }}>
                            <div style={{ width: "100%", height: "100%" }}>
                                {(() => {
                                    const getInterval = (period) => {
                                        switch(period) {
                                            case "1개월": return "D";
                                            case "5개월": return "W";
                                            case "1년": return "M";
                                            case "3년": return "12M";
                                            default: return "D";
                                        }
                                    };
                                    
                                    const interval = getInterval(domesticPeriod);
                                    const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_silver_${domesticPeriod}&symbol=OANDA:XAGUSD&interval=${interval}&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Asia%2FSeoul&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=kr&utm_source=www.koreagoldx.co.kr&utm_medium=widget&utm_campaign=chart&utm_term=OANDA:XAGUSD`;
                                    
                                    return (
                                        <iframe
                                            key={domesticPeriod}
                                            src={widgetUrl}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                            title="은시세 차트"
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                        
                        {/* 데이터 출처 표기 */}
                        <div style={{
                            marginTop: "10px",
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#999"
                        }}>
                            데이터 출처: TradingView
                        </div>
                    </div>

                    {/* 오른쪽 패널: Platinum 시세 */}
                    <div style={{
                        border: "1px solid #e5e4e2",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff"
                    }}>
                        <div style={{
                            marginBottom: "15px"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                                Platinum 시세 (XPT/USD)
                            </h3>
                        </div>
                        
                        {/* 기간 선택 탭 */}
                        <div style={{
                            display: "flex",
                            gap: "5px",
                            marginBottom: "20px"
                        }}>
                            {["1개월", "5개월", "1년", "3년"].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setInternationalPeriod(period)}
                                    style={{
                                        padding: "4px 8px",
                                        backgroundColor: internationalPeriod === period ? "#007bff" : "#f0f0f0",
                                        color: internationalPeriod === period ? "#fff" : "#333",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "10px"
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                        
                        {/* TradingView Platinum 시세 그래프 */}
                        <div style={{ marginBottom: "20px", height: "250px" }}>
                            <div style={{ width: "100%", height: "100%" }}>
                                {(() => {
                                    const getInterval = (period) => {
                                        switch(period) {
                                            case "1개월": return "D";
                                            case "5개월": return "W";
                                            case "1년": return "M";
                                            case "3년": return "12M";
                                            default: return "D";
                                        }
                                    };
                                    
                                    const interval = getInterval(internationalPeriod);
                                    const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_platinum_${internationalPeriod}&symbol=OANDA:XPTUSD&interval=${interval}&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Asia%2FSeoul&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=kr&utm_source=www.koreagoldx.co.kr&utm_medium=widget&utm_campaign=chart&utm_term=OANDA:XPTUSD`;
                                    
                                    return (
                                        <iframe
                                            key={internationalPeriod}
                                            src={widgetUrl}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                            title="Platinum 시세 차트"
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                        
                        {/* 데이터 출처 표기 */}
                        <div style={{
                            marginTop: "10px",
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#999"
                        }}>
                            데이터 출처: TradingView
                        </div>
                    </div>
                </div>
            ) : activeTab === "COIN" ? (
                // COIN 탭: 환율 정보 + 비트코인 그래프
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "40px"
                }}>
                    {/* 왼쪽 패널: 환율 정보 (USD/KRW) */}
                    <div style={{
                        border: "1px solid #4a90e2",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff"
                    }}>
                        <div style={{
                            marginBottom: "15px"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                                환율 정보 (USD/KRW)
                            </h3>
                        </div>
                        
                        {/* 기간 선택 탭 */}
                        <div style={{
                            display: "flex",
                            gap: "5px",
                            marginBottom: "20px"
                        }}>
                            {["1개월", "5개월", "1년", "3년"].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setDomesticPeriod(period)}
                                    style={{
                                        padding: "4px 8px",
                                        backgroundColor: domesticPeriod === period ? "#007bff" : "#f0f0f0",
                                        color: domesticPeriod === period ? "#fff" : "#333",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "10px"
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                        
                        {/* TradingView 환율 그래프 */}
                        <div style={{ marginBottom: "20px", height: "250px" }}>
                            <div style={{ width: "100%", height: "100%" }}>
                                {(() => {
                                    const getInterval = (period) => {
                                        switch(period) {
                                            case "1개월": return "D";
                                            case "5개월": return "W";
                                            case "1년": return "M";
                                            case "3년": return "12M";
                                            default: return "D";
                                        }
                                    };
                                    
                                    const interval = getInterval(domesticPeriod);
                                    const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_usdkrw_${domesticPeriod}&symbol=FX_IDC:USDKRW&interval=${interval}&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Asia%2FSeoul&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=kr&utm_source=www.koreagoldx.co.kr&utm_medium=widget&utm_campaign=chart&utm_term=FX_IDC:USDKRW`;
                                    
                                    return (
                                        <iframe
                                            key={domesticPeriod}
                                            src={widgetUrl}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                            title="환율 차트"
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                        
                        {/* 데이터 출처 표기 */}
                        <div style={{
                            marginTop: "10px",
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#999"
                        }}>
                            데이터 출처: TradingView
                        </div>
                    </div>

                    {/* 오른쪽 패널: 비트코인 정보 */}
                    <div style={{
                        border: "1px solid #f7931a",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff"
                    }}>
                        <div style={{
                            marginBottom: "15px"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                                비트코인 시세 (BTC/USD)
                            </h3>
                        </div>
                        
                        {/* 기간 선택 탭 */}
                        <div style={{
                            display: "flex",
                            gap: "5px",
                            marginBottom: "20px"
                        }}>
                            {["1개월", "5개월", "1년", "3년"].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setInternationalPeriod(period)}
                                    style={{
                                        padding: "4px 8px",
                                        backgroundColor: internationalPeriod === period ? "#007bff" : "#f0f0f0",
                                        color: internationalPeriod === period ? "#fff" : "#333",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "10px"
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                        
                        {/* TradingView 비트코인 그래프 */}
                        <div style={{ marginBottom: "20px", height: "250px" }}>
                            <div style={{ width: "100%", height: "100%" }}>
                                {(() => {
                                    const getInterval = (period) => {
                                        switch(period) {
                                            case "1개월": return "D";
                                            case "5개월": return "W";
                                            case "1년": return "M";
                                            case "3년": return "12M";
                                            default: return "D";
                                        }
                                    };
                                    
                                    const interval = getInterval(internationalPeriod);
                                    const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc_${internationalPeriod}&symbol=BINANCE:BTCUSDT&interval=${interval}&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Asia%2FSeoul&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=kr&utm_source=www.koreagoldx.co.kr&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE:BTCUSDT`;
                                    
                                    return (
                                        <iframe
                                            key={internationalPeriod}
                                            src={widgetUrl}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                            title="비트코인 시세 차트"
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                        
                        {/* 데이터 출처 표기 */}
                        <div style={{
                            marginTop: "10px",
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#999"
                        }}>
                            데이터 출처: TradingView
                        </div>
                    </div>
                </div>
            ) : (
                // GOLD 탭: 차트셋 컴포넌트 사용
                chartComponentsLoaded && ChartComponent && NewsComponent ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        marginBottom: "40px"
                    }}>
                        <ChartComponent 
                            domesticPeriod={domesticPeriod}
                            setDomesticPeriod={setDomesticPeriod}
                        />
                        <NewsComponent 
                            newsList={newsList}
                            newsLoading={newsLoading}
                            newsError={newsError}
                        />
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        marginBottom: "40px"
                    }}>
                        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                            차트 로딩 중...
                        </div>
                        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                            뉴스 로딩 중...
                        </div>
                    </div>
                )
            )}

            {/* 하단 경매 목록 */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}>
                {/* 입찰 베스트 */}
                <div style={{
                    border: "1px solid #ffb366",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff"
                }}>
                    <h4 style={{ margin: 0, marginBottom: "15px", fontSize: "16px", fontWeight: "bold", color: "#ff6b35" }}>
                        입찰 베스트
                    </h4>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>상품코드</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>상품명</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>거래방식</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>종료일</th>
                                <th style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>현재입찰가</th>
                                <th style={{ padding: "10px", textAlign: "center", fontSize: "13px", fontWeight: "bold" }}>입찰수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bestBidList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                bestBidList.map(item => (
                                    <tr key={item.seq} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                        onClick={() => navigate(`/imageboard/imageboardView?seq=${item.seq}`)}>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>{item.seq}</td>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>{item.imagename}</td>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>{item.transactionMethod || "-"}</td>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>
                                            {(() => {
                                                // DB의 status 값을 우선 확인
                                                const status = item.status || "";
                                                
                                                // 판매완료, 종료, 포기 상태 처리
                                                if(status === "판매완료") {
                                                    return <span style={{ color: "#28a745", fontWeight: "bold" }}>판매완료</span>;
                                                } else if(status === "종료") {
                                                    return <span style={{ color: "#dc3545", fontWeight: "bold" }}>경매종료</span>;
                                                } else if(status === "포기") {
                                                    return <span style={{ color: "#d9534f", fontWeight: "bold" }}>경매포기</span>;
                                                }
                                                
                                                // status가 없거나 "진행중"인 경우 종료일 확인
                                                if(!item.auctionEndDate) {
                                                    return "-";
                                                }
                                                
                                                const endDate = new Date(item.auctionEndDate);
                                                endDate.setHours(0, 0, 0, 0);
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);
                                                
                                                // 경매 종료일이 지났으면 "종료" 표시
                                                if(endDate < now) {
                                                    return <span style={{ color: "#dc3545", fontWeight: "bold" }}>종료</span>;
                                                }
                                                
                                                // 진행 중인 경우 종료일 표시
                                                return new Date(item.auctionEndDate).toLocaleDateString();
                                            })()}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>
                                            {(() => {
                                                // 상태에 따라 색상 결정
                                                const status = item.status || "";
                                                let priceColor = "#d9534f"; // 기본값: 빨간색
                                                
                                                // 판매완료인 경우 초록색
                                                if(status === "판매완료") {
                                                    priceColor = "#28a745";
                                                } 
                                                // 진행중인 경우 아주 진한 파란색
                                                else if(status === "진행중" || (!status && item.auctionEndDate)) {
                                                    // 종료일이 있고 아직 지나지 않았으면 진행중
                                                    if(item.auctionEndDate) {
                                                        const endDate = new Date(item.auctionEndDate);
                                                        endDate.setHours(0, 0, 0, 0);
                                                        const now = new Date();
                                                        now.setHours(0, 0, 0, 0);
                                                        if(endDate >= now) {
                                                            priceColor = "#000080"; // 아주 진한 파란색
                                                        }
                                                    } else if(status === "진행중") {
                                                        priceColor = "#000080"; // 아주 진한 파란색
                                                    }
                                                }
                                                
                                                // 입찰이 진행된 경우 최고 입찰금액, 그렇지 않으면 최초 등록 금액 표시
                                                const maxBid = item.maxBidAmount !== undefined && item.maxBidAmount !== null && Number(item.maxBidAmount) > 0 
                                                    ? Number(item.maxBidAmount) 
                                                    : null;
                                                const startPrice = item.imageprice !== undefined && item.imageprice !== null 
                                                    ? Number(item.imageprice) 
                                                    : 0;
                                                const displayPrice = maxBid !== null ? maxBid : startPrice;
                                                return <span style={{ color: priceColor }}>₩ {displayPrice.toLocaleString()}</span>;
                                            })()}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "12px" }}>{item.bidCount || 0}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 경매목록 */}
                <div style={{
                    border: "1px solid #b3d9ff",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff"
                }}>
                    <h4 style={{ margin: 0, marginBottom: "15px", fontSize: "16px", fontWeight: "bold" }}>
                        경매목록
                    </h4>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>상품코드</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>상품명</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>거래방식</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: "bold" }}>종료일</th>
                                <th style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>현재입찰가</th>
                                <th style={{ padding: "10px", textAlign: "center", fontSize: "13px", fontWeight: "bold" }}>입찰수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                recentList.map(item => (
                                    <tr key={item.seq} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                        onClick={() => navigate(`/imageboard/imageboardView?seq=${item.seq}`)}>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>{item.seq}</td>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>{item.imagename}</td>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>{item.transactionMethod || "-"}</td>
                                        <td style={{ padding: "10px", fontSize: "13px" }}>
                                            {(() => {
                                                // DB의 status 값을 우선 확인
                                                const status = item.status || "";
                                                
                                                // 판매완료, 종료, 포기 상태 처리
                                                if(status === "판매완료") {
                                                    return <span style={{ color: "#28a745", fontWeight: "bold" }}>판매완료</span>;
                                                } else if(status === "종료") {
                                                    return <span style={{ color: "#dc3545", fontWeight: "bold" }}>경매종료</span>;
                                                } else if(status === "포기") {
                                                    return <span style={{ color: "#d9534f", fontWeight: "bold" }}>경매포기</span>;
                                                }
                                                
                                                // status가 없거나 "진행중"인 경우 종료일 확인
                                                if(!item.auctionEndDate) {
                                                    return "-";
                                                }
                                                
                                                const endDate = new Date(item.auctionEndDate);
                                                endDate.setHours(0, 0, 0, 0);
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);
                                                
                                                // 경매 종료일이 지났으면 "종료" 표시
                                                if(endDate < now) {
                                                    return <span style={{ color: "#dc3545", fontWeight: "bold" }}>종료</span>;
                                                }
                                                
                                                // 진행 중인 경우 종료일 표시
                                                return new Date(item.auctionEndDate).toLocaleDateString();
                                            })()}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>
                                            {(() => {
                                                // 상태에 따라 색상 결정
                                                const status = item.status || "";
                                                let priceColor = "#d9534f"; // 기본값: 빨간색
                                                
                                                // 판매완료인 경우 초록색
                                                if(status === "판매완료") {
                                                    priceColor = "#28a745";
                                                } 
                                                // 진행중인 경우 아주 진한 파란색
                                                else if(status === "진행중" || (!status && item.auctionEndDate)) {
                                                    // 종료일이 있고 아직 지나지 않았으면 진행중
                                                    if(item.auctionEndDate) {
                                                        const endDate = new Date(item.auctionEndDate);
                                                        endDate.setHours(0, 0, 0, 0);
                                                        const now = new Date();
                                                        now.setHours(0, 0, 0, 0);
                                                        if(endDate >= now) {
                                                            priceColor = "#000080"; // 아주 진한 파란색
                                                        }
                                                    } else if(status === "진행중") {
                                                        priceColor = "#000080"; // 아주 진한 파란색
                                                    }
                                                }
                                                
                                                // 입찰이 진행된 경우 최고 입찰금액, 그렇지 않으면 최초 등록 금액 표시
                                                const maxBid = item.maxBidAmount !== undefined && item.maxBidAmount !== null && Number(item.maxBidAmount) > 0 
                                                    ? Number(item.maxBidAmount) 
                                                    : null;
                                                const startPrice = item.imageprice !== undefined && item.imageprice !== null 
                                                    ? Number(item.imageprice) 
                                                    : 0;
                                                const displayPrice = maxBid !== null ? maxBid : startPrice;
                                                return <span style={{ color: priceColor }}>₩ {displayPrice.toLocaleString()}</span>;
                                            })()}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "12px" }}>{item.bidCount || 0}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Intro;
