import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TransactionStatistics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState("1month"); // 1day, 1week, 1month, 1year
    
    // 통계 데이터 상태
    const [transactionCount, setTransactionCount] = useState({ total: 0, statusList: [] });
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [hourlyStats, setHourlyStats] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [methodStats, setMethodStats] = useState([]);
    
    // 관리자 권한 체크
    useEffect(() => {
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
        
        fetchStatistics();
    }, [navigate, period]);
    
    // 통계 데이터 조회
    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // 총 거래 횟수
            const countResponse = await fetch(`http://localhost:8080/statistics/transaction/count?period=${period}`);
            if(countResponse.ok) {
                const countData = await countResponse.json();
                if(countData.rt === "OK") {
                    setTransactionCount({
                        total: countData.totalCount || 0,
                        statusList: countData.statusList || []
                    });
                }
            }
            
            // 총 거래 금액
            const amountResponse = await fetch(`http://localhost:8080/statistics/transaction/amount?period=${period}`);
            if(amountResponse.ok) {
                const amountData = await amountResponse.json();
                if(amountData.rt === "OK") {
                    setTransactionAmount(amountData.totalAmount || 0);
                }
            }
            
            // 시간대별 거래 현황 (1개월, 1주, 1일만)
            if(period === "1month" || period === "1week" || period === "1day") {
                try {
                    const hourlyResponse = await fetch(`http://localhost:8080/statistics/transaction/hourly?period=${period}`);
                    if(hourlyResponse.ok) {
                        const hourlyData = await hourlyResponse.json();
                        if(hourlyData.rt === "OK") {
                            // 0시~23시 모든 시간대 데이터 생성 (없는 시간대는 0으로)
                            const hourlyMap = new Map();
                            for(let i = 0; i < 24; i++) {
                                hourlyMap.set(i, { hour: i, count: 0, amount: 0 });
                            }
                            (hourlyData.hourlyList || []).forEach(item => {
                                // hour가 숫자로 변환되어야 함
                                const hour = typeof item.hour === 'number' ? item.hour : parseInt(item.hour);
                                hourlyMap.set(hour, { hour: hour, count: item.count || 0, amount: item.amount || 0 });
                            });
                            setHourlyStats(Array.from(hourlyMap.values()));
                        } else {
                            console.error("시간대별 거래 현황 조회 실패:", hourlyData.msg);
                            setHourlyStats([]);
                        }
                    } else {
                        console.error("시간대별 거래 현황 HTTP 오류:", hourlyResponse.status);
                        setHourlyStats([]);
                    }
                } catch(err) {
                    console.error("시간대별 거래 현황 조회 오류:", err);
                    setHourlyStats([]);
                }
            } else {
                setHourlyStats([]);
            }
            
            // 카테고리별 거래 통계
            const categoryResponse = await fetch(`http://localhost:8080/statistics/transaction/category?period=${period}`);
            if(categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                if(categoryData.rt === "OK") {
                    setCategoryStats(categoryData.categoryList || []);
                }
            }
            
            // 거래방식별 통계
            const methodResponse = await fetch(`http://localhost:8080/statistics/transaction/method`);
            if(methodResponse.ok) {
                const methodData = await methodResponse.json();
                if(methodData.rt === "OK") {
                    setMethodStats(methodData.methodList || []);
                }
            }
        } catch(err) {
            console.error("통계 데이터 조회 오류:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // 그래프 색상 배열
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
    
    return (
        <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            {/* 헤더 */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1fr",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                {/* 좌측: 관리자 페이지 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <Link
                        to="/manager/managerInfo"
                        style={{
                            textDecoration: "none",
                            display: "inline-block",
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}
                    >
                        관리자 페이지
                    </Link>
                </div>
                
                {/* 중앙: 제목 */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#333" }}>
                        상품거래 통계
                    </h2>
                </div>
                
                {/* 우측: 기간 선택 드롭다운 */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>
                        검색기간
                    </span>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{
                            padding: "6px 12px",
                            fontSize: "13px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            color: "#333",
                            cursor: "pointer",
                            minWidth: "100px"
                        }}
                    >
                        <option value="1day">1일</option>
                        <option value="1week">1주</option>
                        <option value="1month">1개월</option>
                        <option value="1year">1년</option>
                    </select>
                </div>
            </div>
            
            {loading ? (
                <div style={{ textAlign: "center", padding: "50px", fontSize: "16px", color: "#666" }}>
                    데이터를 불러오는 중...
                </div>
            ) : (
                <>
                    {/* 요약 카드 */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "20px",
                        marginBottom: "30px"
                    }}>
                        <div style={{
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "2px solid #337ab7",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                                총 거래 횟수
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#337ab7" }}>
                                {transactionCount.total.toLocaleString()}건
                            </div>
                            {transactionCount.statusList.length > 0 && (
                                <div style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
                                    {transactionCount.statusList.map((item, idx) => (
                                        <span key={idx} style={{ marginRight: "10px" }}>
                                            {item.status}: {item.count}건
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div style={{
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "2px solid #28a745",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                                총 거래 금액
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>
                                ₩ {transactionAmount.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    
                    {/* 카테고리별 거래 통계 */}
                    <div style={{
                        padding: "20px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        marginBottom: "30px"
                    }}>
                        <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                            카테고리별 거래 통계
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ category, percentage, cx, cy, midAngle, innerRadius, outerRadius }) => {
                                            // 비율이 0이거나 너무 작으면 표시하지 않음
                                            if (!percentage || percentage < 2) return null;
                                            
                                            // 레이블 위치 계산
                                            const RADIAN = Math.PI / 180;
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                            
                                            return (
                                                <text 
                                                    x={x} 
                                                    y={y} 
                                                    fill="#333" 
                                                    textAnchor={x > cx ? 'start' : 'end'} 
                                                    dominantBaseline="central"
                                                    style={{ fontSize: "10px", fontWeight: "500" }}
                                                >
                                                    <tspan x={x} dy="-6">{category || '미분류'}</tspan>
                                                    <tspan x={x} dy="12">{percentage.toFixed(1)}%</tspan>
                                                </text>
                                            );
                                        }}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="category"
                                    >
                                        {categoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value, name, props) => {
                                            const payload = props.payload || props;
                                            return [`${value}건`, payload.category || payload.name || '미분류'];
                                        }}
                                        contentStyle={{ fontSize: "12px" }}
                                    />
                                    <Legend 
                                        formatter={(value, entry) => {
                                            const payload = entry.payload || entry;
                                            return payload.category || payload.name || '미분류';
                                        }}
                                        wrapperStyle={{ fontSize: "11px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            <div style={{ padding: "10px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                                            <th style={{ padding: "10px", textAlign: "left", fontSize: "13px" }}>카테고리</th>
                                            <th style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>건수</th>
                                            <th style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>금액</th>
                                            <th style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>비율</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryStats.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                                                    데이터가 없습니다.
                                                </td>
                                            </tr>
                                        ) : (
                                            categoryStats.map((item, index) => {
                                                const color = COLORS[index % COLORS.length];
                                                return (
                                                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                                                        <td style={{ 
                                                            padding: "10px", 
                                                            fontSize: "13px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        }}>
                                                            <span style={{
                                                                display: "inline-block",
                                                                width: "12px",
                                                                height: "12px",
                                                                backgroundColor: color,
                                                                borderRadius: "2px"
                                                            }}></span>
                                                            {item.category}
                                                        </td>
                                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>{item.count}건</td>
                                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>₩ {item.amount.toLocaleString()}</td>
                                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", color: "#666" }}>{item.percentage}%</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    {/* 거래방식별 통계 */}
                    <div style={{
                        padding: "20px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        marginBottom: "30px"
                    }}>
                        <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                            거래방식별 통계
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={methodStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="method" 
                                        tick={{ fontSize: 11 }}
                                        style={{ fontSize: "11px" }}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ fontSize: "12px" }} />
                                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                                    <Bar dataKey="count" name="거래 건수">
                                        {methodStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            
                            <div style={{ padding: "10px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                                            <th style={{ padding: "10px", textAlign: "left", fontSize: "13px" }}>거래방식</th>
                                            <th style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>건수</th>
                                            <th style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>금액</th>
                                            <th style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>비율</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {methodStats.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                                                    데이터가 없습니다.
                                                </td>
                                            </tr>
                                        ) : (
                                            methodStats.map((item, index) => {
                                                const color = COLORS[index % COLORS.length];
                                                return (
                                                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                                                        <td style={{ 
                                                            padding: "10px", 
                                                            fontSize: "13px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        }}>
                                                            <span style={{
                                                                display: "inline-block",
                                                                width: "12px",
                                                                height: "12px",
                                                                backgroundColor: color,
                                                                borderRadius: "2px"
                                                            }}></span>
                                                            {item.method}
                                                        </td>
                                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>{item.count}건</td>
                                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px" }}>₩ {item.amount.toLocaleString()}</td>
                                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", color: "#666" }}>{item.percentage}%</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    {/* 시간대별 거래 현황 (맨 아래로 이동) */}
                    {period === "1month" || period === "1week" || period === "1day" ? (
                        <div style={{
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            marginBottom: "30px"
                        }}>
                            <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                                시간대별 거래 현황
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={hourlyStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" label={{ value: '시간', position: 'insideBottom', offset: -5 }} />
                                    <YAxis yAxisId="left" label={{ value: '거래 건수', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: '거래 금액 (원)', angle: 90, position: 'insideRight' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="거래 건수" />
                                    <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" name="거래 금액" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}

export default TransactionStatistics;

