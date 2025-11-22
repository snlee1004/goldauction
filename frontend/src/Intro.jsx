import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Alpha Vantage API 키
const API_KEY = 'GNYJONLPYPY5UC5E';

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
    
    // 입찰 베스트 목록 조회 (입찰자 수 기준 정렬)
    const fetchBestBids = async () => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=1`);
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    // 현재 날짜
                    const now = new Date();
                    now.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교
                    
                    // 경매 종료되지 않은 항목만 필터링
                    const activeItems = (data.items || []).filter(item => {
                        if(!item.auctionEndDate) {
                            return true; // 종료일이 없으면 진행 중으로 간주
                        }
                        const endDate = new Date(item.auctionEndDate);
                        endDate.setHours(0, 0, 0, 0);
                        return endDate >= now; // 종료일이 오늘 이후이거나 오늘인 경우만 포함
                    });
                    
                    // 입찰 수 기준으로 정렬 (내림차순)
                    const sorted = [...activeItems].sort((a, b) => {
                        const bidCountA = a.bidCount || 0;
                        const bidCountB = b.bidCount || 0;
                        return bidCountB - bidCountA;
                    });
                    setBestBidList(sorted.slice(0, 5)); // 상위 5개만
                }
            }
        } catch(err) {
            console.error("입찰 베스트 조회 오류:", err);
        }
    };
    
    // 최근 등록순 목록 조회
    const fetchRecentList = async () => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=1`);
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    // 등록일 기준으로 정렬 (내림차순)
                    const sorted = [...(data.items || [])].sort((a, b) => {
                        const timeA = a.logtime ? new Date(a.logtime).getTime() : 0;
                        const timeB = b.logtime ? new Date(b.logtime).getTime() : 0;
                        return timeB - timeA;
                    });
                    setRecentList(sorted.slice(0, 5)); // 상위 5개만
                }
            }
        } catch(err) {
            console.error("최근 등록순 조회 오류:", err);
        }
    };
    
    // 네이버 경제 뉴스 조회 (금 관련) - 백엔드 프록시를 통해 호출
    const fetchGoldNews = async () => {
        setNewsLoading(true);
        setNewsError(null);
        try {
            // 백엔드 프록시 API 호출
            const apiUrl = `http://localhost:8080/news/gold?query=${encodeURIComponent('금 시세 경제')}&display=10`;
            
            console.log("뉴스 API 호출 시작:", apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("뉴스 API 응답 상태:", response.status, response.statusText);
            
            if(response.ok) {
                const result = await response.json();
                console.log("뉴스 API 응답 데이터:", result);
                
                if(result.rt === "OK" && result.data && result.data.items && Array.isArray(result.data.items) && result.data.items.length > 0) {
                    console.log("뉴스 개수:", result.data.items.length);
                    setNewsList(result.data.items);
                    setNewsError(null);
                } else {
                    console.warn("뉴스 데이터가 없거나 배열이 아닙니다:", result);
                    setNewsList([]);
                    setNewsError(result.msg || "뉴스 데이터를 찾을 수 없습니다.");
                }
            } else {
                const errorText = await response.text();
                console.error("뉴스 API 호출 실패:", response.status, errorText);
                setNewsList([]);
                setNewsError(`API 호출 실패 (${response.status}): ${errorText}`);
            }
        } catch(err) {
            console.error("뉴스 조회 오류:", err);
            setNewsList([]);
            setNewsError(`오류 발생: ${err.message}`);
        } finally {
            setNewsLoading(false);
        }
    };
    
    // 임시 데이터로 금 시세 설정
    const fetchGoldPrice = async () => {
        if(activeTab !== "GOLD") return; // GOLD 탭일 때만 조회
        
        setPriceLoading(true);
        try {
            // 임시 데이터 설정
            const now = new Date();
            const lastUpdate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
            // 임시 매매기준가 데이터
            setTradingStandard({
                quotationTime: lastUpdate,
                internationalPrice: 2650.50,
                exchangeRate: 1467.03,
                priceChange: 23.44,
                rateChange: -1.68
            });
            
            // 임시 전년 대비 데이터
            setYearComparisonData([
                { name: "전년", value: 600000 },
                { name: "오늘", value: 845000 }
            ]);
            
            // 임시 국내 시세 차트 데이터
            setDomesticChartData([
                { date: "06-01", price: 600000 },
                { date: "07-01", price: 638000 },
                { date: "08-01", price: 720000 },
                { date: "09-01", price: 900000 },
                { date: "10-01", price: 845000 },
                { date: "11-01", price: 850000 },
                { date: "12-01", price: 880000 }
            ]);
            
            // 임시 국제 시세 차트 데이터
            setInternationalChartData([
                { date: "06-01", price: 3200 },
                { date: "07-01", price: 3400 },
                { date: "08-01", price: 3800 },
                { date: "09-01", price: 4400 },
                { date: "10-01", price: 4108 },
                { date: "11-01", price: 4150 },
                { date: "12-01", price: 4300 }
            ]);
        } catch(err) {
            console.error("금 시세 데이터 설정 오류:", err);
        } finally {
            setPriceLoading(false);
        }
    };
    
    // 노출 중인 팝업 조회
    const fetchVisiblePopups = async () => {
        try {
            const response = await fetch("http://localhost:8080/popup/visible");
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK" && data.items && data.items.length > 0) {
                    // 오늘 하루 보지 않기 체크
                    const today = new Date().toDateString();
                    const visiblePopups = data.items.filter(popup => {
                        const hiddenDate = localStorage.getItem(`popup_${popup.popupSeq}_hidden`);
                        // localStorage에 저장된 날짜가 오늘이 아니면 표시
                        return hiddenDate !== today;
                    });
                    
                    if(visiblePopups.length > 0) {
                        setPopupList(visiblePopups);
                        setCurrentPopupIndex(0);
                        setCurrentPopup(visiblePopups[0]); // 첫 번째 팝업 표시
                        setShowPopup(true);
                    }
                }
            }
        } catch(err) {
            console.error("팝업 조회 오류:", err);
        }
    };
    
    // 팝업 닫기 (다음 팝업이 있으면 표시)
    const handleClosePopup = () => {
        const nextIndex = currentPopupIndex + 1;
        if(nextIndex < popupList.length) {
            // 다음 팝업 표시
            setCurrentPopupIndex(nextIndex);
            setCurrentPopup(popupList[nextIndex]);
        } else {
            // 모든 팝업을 표시했으면 닫기
            setShowPopup(false);
            setCurrentPopup(null);
            setCurrentPopupIndex(0);
        }
    };
    
    // 경매 목록 조회 및 뉴스 조회
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchBestBids(), fetchRecentList(), fetchGoldNews(), fetchVisiblePopups()])
            .finally(() => setLoading(false));
    }, []);
    
    // 초기 로딩 및 탭 변경 시 금 시세 조회
    useEffect(() => {
        if(activeTab === "GOLD") {
            fetchGoldPrice();
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
                                                    handleClosePopup();
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
                                            handleClosePopup();
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
                // GOLD 탭: 기존 레이아웃
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "40px"
                }}>
                    {/* 왼쪽 패널: 국내 시세 */}
                    <div style={{
                        border: "1px solid #ffeb99",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff"
                    }}>
                        <div style={{
                            marginBottom: "15px"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                                국제 금 시세 (KRW/3.75g)
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
                    
                    {/* TradingView Mini Chart - 국내 금시세 (KRW) */}
                    {/* API 키 없이 TradingView 위젯 사용 */}
                    <div style={{ marginBottom: "20px", height: "250px" }}>
                        <div style={{ width: "100%", height: "100%" }}>
                            {(() => {
                                // 기간에 따라 interval 조정
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
                                // 한국 금시세는 TradingView에서 직접 제공하지 않으므로
                                // 국제 금시세를 KRW로 변환하거나, 다른 방법 사용
                                // 일단 국제 금시세를 기반으로 표시 (실제로는 한국 금시장 데이터 필요)
                                const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_domestic_${domesticPeriod}&symbol=OANDA:XAUUSD&interval=${interval}&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Asia%2FSeoul&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=kr&utm_source=www.koreagoldx.co.kr&utm_medium=widget&utm_campaign=chart&utm_term=OANDA:XAUUSD`;
                                
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
                                        title="국내 금시세 차트"
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

                {/* 오른쪽 패널: 네이버 경제 뉴스 */}
                <div style={{
                    border: "1px solid #b3ffb3",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff"
                }}>
                    <div style={{
                        marginBottom: "15px"
                    }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                            경제 뉴스 브리핑
                        </h3>
                    </div>
                    
                    {/* 네이버 뉴스 목록 */}
                    <div style={{
                        maxHeight: "250px",
                        overflowY: "auto"
                    }}>
                        {newsLoading ? (
                            <div style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#666"
                            }}>
                                뉴스를 불러오는 중...
                            </div>
                        ) : newsError ? (
                            <div style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#dc3545",
                                fontSize: "12px"
                            }}>
                                <div style={{ marginBottom: "10px" }}>⚠️ {newsError}</div>
                                <div style={{ fontSize: "11px", color: "#999" }}>
                                    브라우저 콘솔을 확인해주세요.
                                </div>
                            </div>
                        ) : newsList.length === 0 ? (
                            <div style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#666"
                            }}>
                                뉴스가 없습니다.
                            </div>
                        ) : (
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px"
                            }}>
                                {newsList.map((news, index) => {
                                    // HTML 태그 제거 및 텍스트만 추출
                                    const cleanTitle = news.title.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                    const cleanDescription = news.description ? news.description.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : '';
                                    
                                    // 출처 추출
                                    let source = '뉴스 출처';
                                    try {
                                        if(news.originallink) {
                                            source = new URL(news.originallink).hostname;
                                        } else if(news.link) {
                                            source = new URL(news.link).hostname;
                                        }
                                    } catch(e) {
                                        source = '뉴스 출처';
                                    }
                                    
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                padding: "12px",
                                                border: "1px solid #e0e0e0",
                                                borderRadius: "6px"
                                            }}
                                        >
                                            {/* 타이틀 */}
                                            <div style={{
                                                fontSize: "13px",
                                                fontWeight: "bold",
                                                marginBottom: "8px",
                                                color: "#333",
                                                lineHeight: "1.4"
                                            }}>
                                                {cleanTitle}
                                            </div>
                                            
                                            {/* 내용 (2줄로 제한) */}
                                            {cleanDescription && (
                                                <div style={{
                                                    fontSize: "11px",
                                                    color: "#666",
                                                    marginBottom: "8px",
                                                    lineHeight: "1.4",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>
                                                    {cleanDescription}
                                                </div>
                                            )}
                                            
                                            {/* 출처 */}
                                            <div style={{
                                                fontSize: "10px",
                                                color: "#999"
                                            }}>
                                                <span>{source}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    {/* 데이터 출처 표기 */}
                    <div style={{
                        marginTop: "15px",
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#999"
                    }}>
                        데이터 출처: <a href="https://news.deepsearch.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#999", textDecoration: "none" }}>https://news.deepsearch.com/</a>
                    </div>
                </div>
            </div>
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
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>상품코드</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>상품명</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>거래방식</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>종료일</th>
                                <th style={{ padding: "10px", textAlign: "right", fontSize: "12px", fontWeight: "bold" }}>현재입찰가</th>
                                <th style={{ padding: "10px", textAlign: "center", fontSize: "12px", fontWeight: "bold" }}>입찰수</th>
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
                                        <td style={{ padding: "10px", fontSize: "12px" }}>{item.seq}</td>
                                        <td style={{ padding: "10px", fontSize: "12px" }}>{item.imagename}</td>
                                        <td style={{ padding: "10px", fontSize: "12px" }}>{item.transactionMethod || "-"}</td>
                                        <td style={{ padding: "10px", fontSize: "12px" }}>
                                            {(() => {
                                                if(!item.auctionEndDate) {
                                                    return "-";
                                                }
                                                const endDate = new Date(item.auctionEndDate);
                                                endDate.setHours(0, 0, 0, 0);
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);
                                                
                                                // 경매 종료 여부 확인
                                                if(endDate < now) {
                                                    return <span style={{ color: "#dc3545", fontWeight: "bold" }}>종료</span>;
                                                }
                                                return new Date(item.auctionEndDate).toLocaleDateString();
                                            })()}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "12px", fontWeight: "bold", color: "#d9534f" }}>
                                            {(() => {
                                                // 입찰이 진행된 경우 최고 입찰금액, 그렇지 않으면 최초 등록 금액 표시
                                                const maxBid = item.maxBidAmount !== undefined && item.maxBidAmount !== null && Number(item.maxBidAmount) > 0 
                                                    ? Number(item.maxBidAmount) 
                                                    : null;
                                                const startPrice = item.imageprice !== undefined && item.imageprice !== null 
                                                    ? Number(item.imageprice) 
                                                    : 0;
                                                const displayPrice = maxBid !== null ? maxBid : startPrice;
                                                return `₩ ${displayPrice.toLocaleString()}`;
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
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>상품코드</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>상품명</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>거래방식</th>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>종료일</th>
                                <th style={{ padding: "10px", textAlign: "right", fontSize: "12px", fontWeight: "bold" }}>현재입찰가</th>
                                <th style={{ padding: "10px", textAlign: "center", fontSize: "12px", fontWeight: "bold" }}>입찰수</th>
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
                                        <td style={{ padding: "10px", fontSize: "12px" }}>{item.seq}</td>
                                        <td style={{ padding: "10px", fontSize: "12px" }}>{item.imagename}</td>
                                        <td style={{ padding: "10px", fontSize: "12px" }}>{item.transactionMethod || "-"}</td>
                                        <td style={{ padding: "10px", fontSize: "12px" }}>
                                            {(() => {
                                                if(!item.auctionEndDate) {
                                                    return "-";
                                                }
                                                const endDate = new Date(item.auctionEndDate);
                                                endDate.setHours(0, 0, 0, 0);
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);
                                                
                                                // 경매 종료 여부 확인
                                                if(endDate < now) {
                                                    return <span style={{ color: "#dc3545", fontWeight: "bold" }}>종료</span>;
                                                }
                                                return new Date(item.auctionEndDate).toLocaleDateString();
                                            })()}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "12px", fontWeight: "bold", color: "#d9534f" }}>
                                            {(() => {
                                                // 입찰이 진행된 경우 최고 입찰금액, 그렇지 않으면 최초 등록 금액 표시
                                                const maxBid = item.maxBidAmount !== undefined && item.maxBidAmount !== null && Number(item.maxBidAmount) > 0 
                                                    ? Number(item.maxBidAmount) 
                                                    : null;
                                                const startPrice = item.imageprice !== undefined && item.imageprice !== null 
                                                    ? Number(item.imageprice) 
                                                    : 0;
                                                const displayPrice = maxBid !== null ? maxBid : startPrice;
                                                return `₩ ${displayPrice.toLocaleString()}`;
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
