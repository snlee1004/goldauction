import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function ChartSetManage() {
    const navigate = useNavigate();
    const [chartSetList, setChartSetList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentChartSet, setCurrentChartSet] = useState("");

    // 차트셋 목록 조회
    const fetchChartSetList = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/chart/list");
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    setChartSetList(data.items || []);
                }
            }
        } catch(err) {
            console.error("차트셋 목록 조회 오류:", err);
        } finally {
            setLoading(false);
        }
    };

    // 현재 적용된 차트셋 조회
    const fetchCurrentChartSet = async () => {
        try {
            const response = await fetch("http://localhost:8080/chart/current");
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    setCurrentChartSet(data.name || "chartSet_1");
                }
            }
        } catch(err) {
            console.error("현재 차트셋 조회 오류:", err);
        }
    };

    // 차트셋 적용
    const handleApply = async (chartSetName) => {
        if(!window.confirm(`${chartSetName} 차트셋을 적용하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/chart/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: chartSetName })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("차트셋이 적용되었습니다.");
                    setCurrentChartSet(chartSetName);
                } else {
                    alert("차트셋 적용 실패: " + (data.msg || "알 수 없는 오류"));
                }
            }
        } catch(err) {
            console.error("차트셋 적용 오류:", err);
            alert("차트셋 적용 중 오류가 발생했습니다.");
        }
    };

    // 차트셋 삭제
    const handleDelete = async (chartSetName) => {
        if(!window.confirm(`${chartSetName} 차트셋을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/chart/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: chartSetName })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("차트셋이 삭제되었습니다.");
                    fetchChartSetList();
                } else {
                    alert("차트셋 삭제 실패: " + (data.msg || "알 수 없는 오류"));
                }
            }
        } catch(err) {
            console.error("차트셋 삭제 오류:", err);
            alert("차트셋 삭제 중 오류가 발생했습니다.");
        }
    };

    // 차트셋 복사
    const handleCopy = async (sourceName) => {
        // 복사할 차트셋 이름 입력 받기
        const targetName = window.prompt(`${sourceName} 차트셋을 복사할 새 차트셋 이름을 입력하세요:`, `chartSet_${Date.now()}`);
        
        if(!targetName || targetName.trim() === "") {
            return;
        }

        const trimmedTargetName = targetName.trim();

        // 차트셋 이름 유효성 검사
        if(!/^chartSet_\w+$/.test(trimmedTargetName)) {
            alert("차트셋 이름은 'chartSet_'로 시작해야 합니다.");
            return;
        }

        // 이미 존재하는 차트셋인지 확인
        if(chartSetList.some(set => set.name === trimmedTargetName)) {
            alert("이미 존재하는 차트셋 이름입니다.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/chart/copy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    sourceName: sourceName,
                    targetName: trimmedTargetName
                })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("차트셋이 복사되었습니다.");
                    fetchChartSetList();
                } else {
                    alert("차트셋 복사 실패: " + (data.msg || "알 수 없는 오류"));
                }
            }
        } catch(err) {
            console.error("차트셋 복사 오류:", err);
            alert("차트셋 복사 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        fetchChartSetList();
        fetchCurrentChartSet();
    }, []);

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            {/* 헤더 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#333"
                }}>
                    메인페이지 그래프 차트셋 관리
                </h2>
                <div style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center"
                }}>
                    <Link
                        to="/chart/editor"
                        state={{ chartSetName: "" }}
                        style={{
                            textDecoration: "none",
                            display: "inline-block",
                            padding: "8px 16px",
                            backgroundColor: "#337ab7",
                            color: "#fff",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    >
                        + 새 차트셋 생성
                    </Link>
                    <button
                        onClick={() => {
                            // 관리자 권한 체크
                            const managerId = sessionStorage.getItem("managerId");
                            if(!managerId) {
                                if(window.confirm("관리자 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                                    navigate("/manager/loginForm");
                                }
                            } else {
                                navigate("/manager/managerInfo");
                            }
                        }}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            cursor: "pointer"
                        }}
                    >
                        관리자 페이지
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    로딩 중...
                </div>
            ) : chartSetList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    등록된 차트셋이 없습니다.
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "20px"
                }}>
                    {chartSetList.map((chartSet) => (
                        <div
                            key={chartSet.name}
                            style={{
                                border: "2px solid #ccc",
                                borderRadius: "8px",
                                padding: "20px",
                                backgroundColor: "#fff",
                                position: "relative"
                            }}
                        >
                            <h3 style={{
                                margin: "0 0 10px 0",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#337ab7"
                            }}>
                                {chartSet.name}
                            </h3>
                            <p style={{
                                margin: "0 0 15px 0",
                                fontSize: "13px",
                                color: "#666"
                            }}>
                                {chartSet.description || chartSet.name}
                            </p>
                            
                            {currentChartSet === chartSet.name && (
                                <div style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    padding: "4px 8px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "bold"
                                }}>
                                    적용중
                                </div>
                            )}

                            <div style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap"
                            }}>
                                {/* chartSet_1은 수정 버튼 숨김 */}
                                {chartSet.name !== "chartSet_1" && (
                                    <Link
                                        to="/chart/editor"
                                        state={{ chartSetName: chartSet.name }}
                                        style={{
                                            textDecoration: "none",
                                            display: "inline-block",
                                            padding: "6px 12px",
                                            backgroundColor: "#337ab7",
                                            color: "#fff",
                                            borderRadius: "4px",
                                            fontSize: "12px"
                                        }}
                                    >
                                        수정
                                    </Link>
                                )}
                                <button
                                    onClick={() => handleCopy(chartSet.name)}
                                    style={{
                                        padding: "6px 12px",
                                        backgroundColor: "#17a2b8",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        cursor: "pointer"
                                    }}
                                >
                                    복사
                                </button>
                                <button
                                    onClick={() => handleApply(chartSet.name)}
                                    style={{
                                        padding: "6px 12px",
                                        backgroundColor: currentChartSet === chartSet.name ? "#6c757d" : "#28a745",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        cursor: currentChartSet === chartSet.name ? "not-allowed" : "pointer"
                                    }}
                                    disabled={currentChartSet === chartSet.name}
                                >
                                    {currentChartSet === chartSet.name ? "적용됨" : "적용"}
                                </button>
                                {/* chartSet_1은 삭제 버튼 숨김 */}
                                {chartSet.name !== "chartSet_1" && (
                                    <button
                                        onClick={() => handleDelete(chartSet.name)}
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#dc3545",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChartSetManage;

