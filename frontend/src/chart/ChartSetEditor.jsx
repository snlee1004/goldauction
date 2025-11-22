import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ChartSetEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const chartSetName = location.state?.chartSetName || "";

    const [formData, setFormData] = useState({
        name: chartSetName || "",
        chartCode: "",
        newsCode: "",
        cssCode: ""
    });
    const [activeTab, setActiveTab] = useState("chart");
    const [loading, setLoading] = useState(false);

    // 차트셋 조회 (수정 모드)
    const fetchChartSet = async () => {
        if(!chartSetName) {
            console.log("차트셋 이름이 없습니다.");
            return;
        }

        setLoading(true);
        try {
            console.log("차트셋 조회 시작:", chartSetName);
            const response = await fetch(`http://localhost:8080/chart/get?name=${encodeURIComponent(chartSetName)}`);
            console.log("차트셋 조회 응답 상태:", response.status);
            
            if(response.ok) {
                const data = await response.json();
                console.log("차트셋 조회 응답 데이터:", data);
                
                if(data.rt === "OK" && data.item) {
                    console.log("차트셋 데이터 설정:", {
                        name: data.item.name,
                        chartCodeLength: data.item.chartCode?.length || 0,
                        newsCodeLength: data.item.newsCode?.length || 0,
                        cssCodeLength: data.item.cssCode?.length || 0
                    });
                    setFormData({
                        name: data.item.name || "",
                        chartCode: data.item.chartCode || "",
                        newsCode: data.item.newsCode || "",
                        cssCode: data.item.cssCode || ""
                    });
                } else {
                    console.error("차트셋 조회 실패:", data.msg || "알 수 없는 오류");
                    alert("차트셋 조회 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                const errorText = await response.text();
                console.error("차트셋 조회 HTTP 오류:", response.status, errorText);
                alert("차트셋 조회 중 오류가 발생했습니다. (HTTP " + response.status + ")");
            }
        } catch(err) {
            console.error("차트셋 조회 오류:", err);
            alert("차트셋 조회 중 오류가 발생했습니다: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("ChartSetEditor useEffect 실행, chartSetName:", chartSetName);
        if(chartSetName) {
            fetchChartSet();
        } else {
            console.log("차트셋 이름이 없어 조회를 건너뜁니다.");
        }
    }, [chartSetName]);

    // 저장
    const handleSave = async () => {
        if(!formData.name || formData.name.trim() === "") {
            alert("차트셋 이름을 입력하세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/chart/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("차트셋이 저장되었습니다.");
                    navigate("/chart/manage");
                } else {
                    alert("차트셋 저장 실패: " + (data.msg || "알 수 없는 오류"));
                }
            }
        } catch(err) {
            console.error("차트셋 저장 오류:", err);
            alert("차트셋 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{
            maxWidth: "1400px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            <h2 style={{
                marginBottom: "30px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333"
            }}>
                Chart 차트셋 편집: {chartSetName || "새 차트셋"}
            </h2>

            <div style={{
                marginBottom: "20px"
            }}>
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold"
                }}>
                    차트셋 이름
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: chartSet_1"
                    style={{
                        width: "300px",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                />
            </div>

            {/* 탭 */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                borderBottom: "2px solid #ccc"
            }}>
                <button
                    onClick={() => setActiveTab("chart")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "chart" ? "#337ab7" : "transparent",
                        color: activeTab === "chart" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "chart" ? "3px solid #337ab7" : "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "chart" ? "bold" : "normal"
                    }}
                >
                    Chart.jsx
                </button>
                <button
                    onClick={() => setActiveTab("news")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "news" ? "#337ab7" : "transparent",
                        color: activeTab === "news" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "news" ? "3px solid #337ab7" : "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "news" ? "bold" : "normal"
                    }}
                >
                    News.jsx
                </button>
                <button
                    onClick={() => setActiveTab("css")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "css" ? "#337ab7" : "transparent",
                        color: activeTab === "css" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "css" ? "3px solid #337ab7" : "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "css" ? "bold" : "normal"
                    }}
                >
                    chart.css
                </button>
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#666",
                    fontSize: "14px"
                }}>
                    차트셋을 불러오는 중...
                </div>
            )}

            {/* 코드 편집기 영역 */}
            {!loading && (
                <div style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    <textarea
                        value={
                            activeTab === "chart" ? formData.chartCode :
                            activeTab === "news" ? formData.newsCode :
                            formData.cssCode
                        }
                        onChange={(e) => {
                            if(activeTab === "chart") {
                                setFormData({ ...formData, chartCode: e.target.value });
                            } else if(activeTab === "news") {
                                setFormData({ ...formData, newsCode: e.target.value });
                            } else {
                                setFormData({ ...formData, cssCode: e.target.value });
                            }
                        }}
                        placeholder={
                            activeTab === "chart" ? "Chart.jsx 코드를 입력하세요..." :
                            activeTab === "news" ? "News.jsx 코드를 입력하세요..." :
                            "chart.css 코드를 입력하세요..."
                        }
                        style={{
                            width: "100%",
                            height: "500px",
                            padding: "15px",
                            border: "none",
                            fontFamily: "monospace",
                            fontSize: "13px",
                            lineHeight: "1.5",
                            resize: "vertical"
                        }}
                    />
                </div>
            )}

            {/* 버튼 */}
            <div style={{
                display: "flex",
                gap: "10px"
            }}>
                <button
                    onClick={handleSave}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#337ab7",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}
                >
                    저장
                </button>
                <button
                    onClick={() => navigate("/chart/manage")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}
                >
                    취소
                </button>
            </div>
        </div>
    );
}

export default ChartSetEditor;

