import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Alpha Vantage API 키
const API_KEY = 'GNYJONLPYPY5UC5E';

function Intro() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("GOLD"); // GOLD, SILVER, PLATINUM
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
    
    // 경매 목록 데이터
    const [bestBidList, setBestBidList] = useState([]);
    const [recentList, setRecentList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 입찰 베스트 목록 조회 (입찰자 수 기준 정렬)
    const fetchBestBids = async () => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=1`);
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    // 입찰 수 기준으로 정렬 (내림차순)
                    const sorted = [...(data.items || [])].sort((a, b) => {
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
    
    // 경매 목록 조회
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchBestBids(), fetchRecentList()])
            .finally(() => setLoading(false));
    }, []);
    
    // 초기 로딩 및 탭 변경 시 금 시세 조회
    useEffect(() => {
        if(activeTab === "GOLD") {
            fetchGoldPrice();
        } else {
            // SILVER, PLATINUM 탭일 때는 데이터 초기화
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
            padding: "20px"
        }}>
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
                    onClick={() => setActiveTab("PLATINUM")}
                    style={{
                        padding: "6px 15px",
                        backgroundColor: activeTab === "PLATINUM" ? "#ff6b35" : "#f0f0f0",
                        color: activeTab === "PLATINUM" ? "#fff" : "#333",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    PLATINUM
                </button>
            </div>

            {/* 메인 콘텐츠 영역 */}
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
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                            국내 시세 (KRW/3.75g)
                        </h3>
                        <a href="#" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}>
                            국내 시세 전체보기 &gt;
                        </a>
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
                    
                    {/* 라인 차트 */}
                    <div style={{ marginBottom: "20px", height: "120px" }}>
                        {domesticChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={domesticChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis 
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${value.toLocaleString()}원`, "금"]}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#ff6b35" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ 
                                height: "100%", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                color: "#666"
                            }}>
                                {priceLoading ? "데이터를 불러오는 중..." : "데이터가 없습니다."}
                            </div>
                        )}
                    </div>
                    
                    {/* 바 차트 (전년 대비) */}
                    <div style={{ marginBottom: "20px", height: "100px" }}>
                        {yearComparisonData[1].value > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearComparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis 
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => `${value.toLocaleString()}원`}
                                    />
                                    <Bar dataKey="value" fill="#ff6b35" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ 
                                height: "100%", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                color: "#666"
                            }}>
                                {priceLoading ? "데이터를 불러오는 중..." : "데이터가 없습니다."}
                            </div>
                        )}
                    </div>
                    
                    {/* 요약 텍스트 */}
                    {yearComparisonData[1].value > 0 && (
                        <div style={{
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            fontSize: "14px",
                            lineHeight: "1.6"
                        }}>
                            <p style={{ margin: 0, marginBottom: "5px" }}>
                                오늘 금시세는 전년 동월동일 대비{" "}
                                <strong style={{ color: "#ff6b35" }}>
                                    {yearComparisonData[1].value > yearComparisonData[0].value 
                                        ? `${(yearComparisonData[1].value - yearComparisonData[0].value).toLocaleString()}원 ▲ ${(((yearComparisonData[1].value - yearComparisonData[0].value) / yearComparisonData[0].value) * 100).toFixed(2)}%`
                                        : `${(yearComparisonData[0].value - yearComparisonData[1].value).toLocaleString()}원 ▼ ${(((yearComparisonData[0].value - yearComparisonData[1].value) / yearComparisonData[0].value) * 100).toFixed(2)}%`}
                                </strong>{" "}
                                입니다.
                            </p>
                            <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                                美연준의 금리 인하 불확실성과 우크라이나...
                            </p>
                        </div>
                    )}
                </div>

                {/* 오른쪽 패널: 국제 시세 */}
                <div style={{
                    border: "1px solid #b3ffb3",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                            국제 시세 (USD/T.oz)
                        </h3>
                        <a href="#" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}>
                            국제 시세 전체보기 &gt;
                        </a>
                    </div>
                    
                    {/* 기간 선택 탭 */}
                    <div style={{
                        display: "flex",
                        gap: "5px",
                        marginBottom: "20px"
                    }}>
                        {["실시간", "1개월", "5개월", "1년", "3년"].map(period => (
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
                    
                    {/* 라인 차트 */}
                    <div style={{ marginBottom: "20px", height: "120px" }}>
                        {internationalChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={internationalChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis 
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, "금"]}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#ff6b35" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ 
                                height: "100%", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                color: "#666"
                            }}>
                                {priceLoading ? "데이터를 불러오는 중..." : "데이터가 없습니다."}
                            </div>
                        )}
                    </div>
                    
                    {/* 매매기준가 */}
                    <div style={{
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px"
                    }}>
                        <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666" }}>
                            고시시간: {tradingStandard.quotationTime || "로딩 중..."}
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px"
                        }}>
                            <span style={{ fontSize: "14px" }}>국제기준시세:</span>
                            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#ff6b35" }}>
                                {tradingStandard.internationalPrice > 0 
                                    ? `${tradingStandard.internationalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (USD/T.oz)` 
                                    : "로딩 중..."}
                                {tradingStandard.priceChange !== 0 && (
                                    <span style={{ color: tradingStandard.priceChange > 0 ? "#28a745" : "#dc3545" }}>
                                        {tradingStandard.priceChange > 0 ? " ▲" : " ▼"} {Math.abs(tradingStandard.priceChange).toFixed(2)}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            <span style={{ fontSize: "14px" }}>기준환율:</span>
                            <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                                {tradingStandard.exchangeRate > 0 
                                    ? `${tradingStandard.exchangeRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (KRW/USD)` 
                                    : "로딩 중..."}
                                {tradingStandard.rateChange !== 0 && (
                                    <span style={{ color: tradingStandard.rateChange > 0 ? "#28a745" : "#dc3545" }}>
                                        {tradingStandard.rateChange > 0 ? " ▲" : " ▼"} {Math.abs(tradingStandard.rateChange).toFixed(2)}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {priceLoading && (
                        <div style={{ textAlign: "center", padding: "10px", color: "#666", fontSize: "12px" }}>
                            시세 데이터를 불러오는 중...
                        </div>
                    )}
                </div>
            </div>

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
                                            {item.auctionEndDate ? new Date(item.auctionEndDate).toLocaleDateString() : "-"}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "12px", fontWeight: "bold", color: "#d9534f" }}>
                                            ₩ {item.maxBidAmount?.toLocaleString() || item.imageprice?.toLocaleString() || 0}
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
                                            {item.auctionEndDate ? new Date(item.auctionEndDate).toLocaleDateString() : "-"}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "12px", fontWeight: "bold", color: "#d9534f" }}>
                                            ₩ {item.maxBidAmount?.toLocaleString() || item.imageprice?.toLocaleString() || 0}
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
