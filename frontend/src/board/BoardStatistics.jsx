import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function BoardStatistics() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const loginCheckedRef = useRef(false);
    
    const [board, setBoard] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statType, setStatType] = useState("board"); // board, member, overall

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        // 관리자 권한 체크
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
        
        if(boardSeq) {
            fetchBoardDetail();
            fetchBoardStatistics();
        } else if(statType === "overall") {
            fetchOverallStatistics();
        }
    }, [boardSeq, navigate, statType]);

    // 게시판 정보 조회
    const fetchBoardDetail = async () => {
        try {
            const response = await fetch(`http://localhost:8080/board/detail?boardSeq=${boardSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setBoard(data.board);
            }
        } catch(err) {
            console.error("게시판 정보 조회 오류:", err);
        }
    };

    // 게시판별 통계 조회
    const fetchBoardStatistics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/board/statistics/board?boardSeq=${boardSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setStats(data);
            } else {
                setError(data.msg || "통계를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("통계 조회 오류:", err);
            setError("통계를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 전체 통계 조회
    const fetchOverallStatistics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/board/statistics/overall");
            const data = await response.json();
            if(data.rt === "OK") {
                setStats(data);
            } else {
                setError(data.msg || "통계를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("통계 조회 오류:", err);
            setError("통계를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            <h2 style={{
                marginBottom: "30px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center"
            }}>
                게시판 통계
            </h2>

            {/* 게시판 정보 */}
            {board && (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <h3 style={{ marginBottom: "10px", fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                        {board.boardName}
                    </h3>
                    {board.boardDescription && (
                        <p style={{ color: "#666", marginBottom: "10px" }}>
                            {board.boardDescription}
                        </p>
                    )}
                </div>
            )}

            {error && (
                <div style={{
                    padding: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : stats && (
                <div>
                    {/* 통계 카드 */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        marginBottom: "30px"
                    }}>
                        <div style={{
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "2px solid #337ab7",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#337ab7", marginBottom: "10px" }}>
                                {stats.totalPosts || 0}
                            </div>
                            <div style={{ fontSize: "14px", color: "#666" }}>전체 게시글</div>
                        </div>
                        <div style={{
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "2px solid #28a745",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745", marginBottom: "10px" }}>
                                {stats.totalComments || 0}
                            </div>
                            <div style={{ fontSize: "14px", color: "#666" }}>전체 댓글</div>
                        </div>
                        {stats.totalProducts !== undefined && (
                            <div style={{
                                padding: "20px",
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "2px solid #ffc107",
                                textAlign: "center"
                            }}>
                                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ffc107", marginBottom: "10px" }}>
                                    {stats.totalProducts || 0}
                                </div>
                                <div style={{ fontSize: "14px", color: "#666" }}>전체 상품</div>
                            </div>
                        )}
                        {stats.totalOrders !== undefined && (
                            <div style={{
                                padding: "20px",
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "2px solid #dc3545",
                                textAlign: "center"
                            }}>
                                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#dc3545", marginBottom: "10px" }}>
                                    {stats.totalOrders || 0}
                                </div>
                                <div style={{ fontSize: "14px", color: "#666" }}>전체 주문</div>
                            </div>
                        )}
                        {stats.totalOrderAmount !== undefined && (
                            <div style={{
                                padding: "20px",
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "2px solid #17a2b8",
                                textAlign: "center"
                            }}>
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#17a2b8", marginBottom: "10px" }}>
                                    ₩ {(stats.totalOrderAmount || 0).toLocaleString()}
                                </div>
                                <div style={{ fontSize: "14px", color: "#666" }}>총 주문 금액</div>
                            </div>
                        )}
                    </div>

                    {/* 일별 게시글 작성 통계 */}
                    {stats.dailyPosts && (
                        <div style={{
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #dee2e6",
                            marginBottom: "20px"
                        }}>
                            <h3 style={{
                                marginBottom: "15px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                최근 7일 게시글 작성 통계
                            </h3>
                            <div style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "flex-end",
                                height: "200px"
                            }}>
                                {Object.entries(stats.dailyPosts).map(([date, count]) => {
                                    const maxCount = Math.max(...Object.values(stats.dailyPosts).map(v => Number(v)));
                                    const height = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0;
                                    return (
                                        <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{
                                                width: "100%",
                                                backgroundColor: "#337ab7",
                                                height: `${height}%`,
                                                minHeight: count > 0 ? "20px" : "0",
                                                borderRadius: "4px 4px 0 0",
                                                marginBottom: "5px",
                                                display: "flex",
                                                alignItems: "flex-end",
                                                justifyContent: "center",
                                                padding: "5px",
                                                color: "#fff",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}>
                                                {count > 0 && count}
                                            </div>
                                            <div style={{
                                                fontSize: "11px",
                                                color: "#666",
                                                textAlign: "center",
                                                transform: "rotate(-45deg)",
                                                transformOrigin: "center",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {date.substring(5)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 뒤로가기 버튼 */}
            <div style={{
                marginTop: "30px",
                textAlign: "center"
            }}>
                <button
                    onClick={() => navigate("/manager/managerInfo")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    관리자 페이지로
                </button>
            </div>
        </div>
    );
}

export default BoardStatistics;

