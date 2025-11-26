import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function ManagerInfo() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false); // 로그인 체크 중복 방지
    const [stats, setStats] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [boardStats, setBoardStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(loginCheckedRef.current) return; // 이미 체크했으면 리턴
        loginCheckedRef.current = true;
        
        // 관리자 권한 체크
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
        
        // 대시보드 데이터 로드
        fetchDashboardData();
    }, [navigate]);

    // 페이지 포커스 시 데이터 새로고침 (다른 페이지에서 돌아왔을 때 최신 데이터 표시)
    useEffect(() => {
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) return; // 관리자가 아니면 리턴
        
        const handleFocus = () => {
            fetchDashboardData();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // 대시보드 데이터 조회
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 캐시 방지를 위한 타임스탬프 추가
            const timestamp = new Date().getTime();
            const cacheHeaders = {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            };

            // 통계 조회
            const statsResponse = await fetch(`http://localhost:8080/admin/dashboard/stats?_t=${timestamp}`, {
                method: 'GET',
                headers: cacheHeaders
            });
            if(statsResponse.ok) {
                const statsData = await statsResponse.json();
                if(statsData.rt === "OK") {
                    setStats(statsData);
                } else {
                    console.error("통계 조회 실패:", statsData.msg || statsData.message);
                }
            } else {
                console.error("통계 조회 HTTP 오류:", statsResponse.status);
            }

            // 최근 게시글 조회
            const postsResponse = await fetch(`http://localhost:8080/admin/dashboard/recent-posts?limit=5&_t=${timestamp}`, {
                method: 'GET',
                headers: cacheHeaders
            });
            if(postsResponse.ok) {
                const postsData = await postsResponse.json();
                if(postsData.rt === "OK") {
                    setRecentPosts(postsData.list || []);
                } else {
                    console.error("최근 게시글 조회 실패:", postsData.msg || postsData.message);
                }
            } else {
                console.error("최근 게시글 조회 HTTP 오류:", postsResponse.status);
            }

            // 최근 주문 조회
            const ordersResponse = await fetch(`http://localhost:8080/admin/dashboard/recent-orders?limit=5&_t=${timestamp}`, {
                method: 'GET',
                headers: cacheHeaders
            });
            if(ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                if(ordersData.rt === "OK") {
                    setRecentOrders(ordersData.list || []);
                } else {
                    console.error("최근 주문 조회 실패:", ordersData.msg || ordersData.message);
                }
            } else {
                console.error("최근 주문 조회 HTTP 오류:", ordersResponse.status);
            }

            // 게시판별 통계 조회
            const boardStatsResponse = await fetch(`http://localhost:8080/admin/dashboard/board-stats?_t=${timestamp}`, {
                method: 'GET',
                headers: cacheHeaders
            });
            if(boardStatsResponse.ok) {
                const boardStatsData = await boardStatsResponse.json();
                if(boardStatsData.rt === "OK") {
                    setBoardStats(boardStatsData.list || []);
                } else {
                    console.error("게시판별 통계 조회 실패:", boardStatsData.msg || boardStatsData.message);
                }
            } else {
                console.error("게시판별 통계 조회 HTTP 오류:", boardStatsResponse.status);
            }
        } catch(err) {
            console.error("대시보드 데이터 조회 오류:", err);
        } finally {
            setLoading(false);
        }
    };

    // 로그아웃 처리
    const handleLogout = () => {
        if(window.confirm("로그아웃하시겠습니까?")) {
            sessionStorage.removeItem("managerId");
            sessionStorage.removeItem("managerName");
            sessionStorage.removeItem("managerRole");
            alert("로그아웃되었습니다.");
            navigate("/manager/loginForm");
        }
    };

    return (
        <div style={{
            maxWidth: "1200px", 
            margin: "auto", 
            padding: "20px", 
            marginTop: "70px", 
            paddingTop: "10px"
        }}>
            {/* 헤더 영역 - 제목과 로그아웃 버튼 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "40px"
            }}>
                {/* 로그아웃 버튼 (왼쪽) */}
                <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                    style={{
                        padding: "6px 12px",
                        fontSize: "13px"
                    }}
                >
                    <i className="bi bi-box-arrow-right"></i> 로그아웃
                </button>

                {/* 제목 (가운데) */}
                <h2 style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#333",
                    flex: 1,
                    textAlign: "center"
                }}>
                    관리자페이지
                </h2>

                {/* 오른쪽 공간 (균형을 위해) */}
                <div style={{width: "100px"}}></div>
            </div>

            {/* 대시보드 통계 카드 */}
            {!loading && stats && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                    marginBottom: "15px"
                }}>
                    <div style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        border: "1px solid #337ab7",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#337ab7", marginBottom: "2px" }}>
                            {stats.totalBoards || 0}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>전체 게시판</div>
                        <div style={{ fontSize: "9px", color: "#999", marginTop: "2px" }}>
                            (활성: {stats.activeBoards || 0})
                        </div>
                    </div>
                    <div style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        border: "1px solid #28a745",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#28a745", marginBottom: "2px" }}>
                            {stats.totalPosts || 0}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>전체 게시글</div>
                        <div style={{ fontSize: "9px", color: "#999", marginTop: "2px" }}>
                            (오늘: {stats.todayPosts || 0})
                        </div>
                    </div>
                    <div style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        border: "1px solid #ffc107",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#ffc107", marginBottom: "2px" }}>
                            {stats.totalComments || 0}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>전체 댓글</div>
                        <div style={{ fontSize: "9px", color: "#999", marginTop: "2px" }}>
                            (오늘: {stats.todayComments || 0})
                        </div>
                    </div>
                    <div style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        border: "1px solid #dc3545",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#dc3545", marginBottom: "2px" }}>
                            {stats.totalOrders || 0}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>전체 주문</div>
                        <div style={{ fontSize: "9px", color: "#999", marginTop: "2px" }}>
                            (오늘: {stats.todayOrders || 0})
                        </div>
                    </div>
                </div>
            )}

            {/* 관리 기능 섹션들 - 2행 3열 그리드 */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "30px"
            }}>
                {/* 1. 회원관리 */}
                <div style={{
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                    minHeight: "200px"
                }}>
                    <h3 style={{
                        marginBottom: "15px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#337ab7",
                        borderBottom: "2px solid #337ab7",
                        paddingBottom: "10px"
                    }}>
                        회원&상품정보
                    </h3>
                    <div style={{
                        textAlign: "center", 
                        marginTop: "15px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        <Link 
                            to="/membercontrol/list" 
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            회원정보 상세 관리
                        </Link>
                        <Link
                            to="/manager/imageboardProductManage"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            경매 상품 관리
                        </Link>
                        <Link
                            to="/chatbot/manage"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            상품거래 통계
                        </Link>
                    </div>
                </div>

                {/* 2. 팝업창 관리 */}
                <div style={{
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                    minHeight: "200px"
                }}>
                    <h3 style={{
                        marginBottom: "15px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#337ab7",
                        borderBottom: "2px solid #337ab7",
                        paddingBottom: "10px"
                    }}>
                        팝업창 & Chart 관리
                    </h3>
                    <div style={{
                        textAlign: "center", 
                        marginTop: "15px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        <Link
                            to="/popup/manage"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            팝업 상세 관리
                        </Link>
                        <Link
                            to="/chart/manage"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            chart 그래프 관리
                        </Link>
                    </div>
                </div>

                {/* 3. 게시판관리 */}
                <div style={{
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                    minHeight: "200px"
                }}>
                    <h3 style={{
                        marginBottom: "15px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#337ab7",
                        borderBottom: "2px solid #337ab7",
                        paddingBottom: "10px"
                    }}>
                        게시판관리
                    </h3>
                    <div style={{
                        textAlign: "center", 
                        marginTop: "15px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        <Link
                            to="/board/create"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            게시판 생성
                        </Link>
                        <Link
                            to="/board/list"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            게시판 목록
                        </Link>
                        <Link
                            to="/profanity/manage"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#dc3545",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            비속어 필터 관리
                        </Link>
                    </div>
                </div>

                {/* 4. CSS 관리 */}
                <div style={{
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                    minHeight: "200px"
                }}>
                    <h3 style={{
                        marginBottom: "15px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#337ab7",
                        borderBottom: "2px solid #337ab7",
                        paddingBottom: "10px"
                    }}>
                        천체 CSS 관리
                    </h3>
                    <div style={{
                        textAlign: "center", 
                        marginTop: "15px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        <Link
                            to="/manager/cssSetManage"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                        >
                            골드옥션 CSS 관리
                        </Link>
                        <Link
                            to="#"
                            style={{
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "6px 12px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "13px"
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                // 게시판 CSS 관리 기능은 추후 구현 예정
                                alert("게시판 CSS 관리 기능은 추후 구현 예정입니다.");
                            }}
                        >
                            게시판 CSS 관리
                        </Link>
                    </div>
                </div>
            </div>

            {/* 최근 활동 섹션 - 관리자 메뉴 아래 */}
            {!loading && (recentPosts.length > 0 || recentOrders.length > 0) && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "30px"
                }}>
                    {/* 최근 게시글 */}
                    {recentPosts.length > 0 && (
                        <div style={{
                            border: "2px solid #ccc",
                            borderRadius: "8px",
                            padding: "20px",
                            backgroundColor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%"
                        }}>
                            <h3 style={{
                                marginBottom: "15px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#337ab7",
                                borderBottom: "2px solid #337ab7",
                                paddingBottom: "10px",
                                flexShrink: 0
                            }}>
                                최근 게시글
                            </h3>
                            <ul style={{ 
                                listStyle: "none", 
                                padding: 0, 
                                margin: 0,
                                overflowY: "auto",
                                maxHeight: "240px", // 4줄 기준 (각 항목 약 60px * 4 = 240px)
                                flex: 1
                            }}>
                                {recentPosts.map((post) => (
                                    <li key={post.postSeq} style={{
                                        padding: "10px 0",
                                        borderBottom: "1px solid #eee"
                                    }}>
                                        <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                                            {post.postTitle}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#666" }}>
                                            {post.memberId} | {new Date(post.createdDate).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 최근 주문 */}
                    {recentOrders.length > 0 && (
                        <div style={{
                            border: "2px solid #ccc",
                            borderRadius: "8px",
                            padding: "20px",
                            backgroundColor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%"
                        }}>
                            <h3 style={{
                                marginBottom: "15px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#dc3545",
                                borderBottom: "2px solid #dc3545",
                                paddingBottom: "10px",
                                flexShrink: 0
                            }}>
                                최근 주문
                            </h3>
                            <ul style={{ 
                                listStyle: "none", 
                                padding: 0, 
                                margin: 0,
                                overflowY: "auto",
                                maxHeight: "280px", // 4줄 기준 (각 항목 약 70px * 4 = 280px, 주문은 3줄이므로 조금 더 높게)
                                flex: 1
                            }}>
                                {recentOrders.map((order) => (
                                    <li key={order.orderSeq} style={{
                                        padding: "10px 0",
                                        borderBottom: "1px solid #eee"
                                    }}>
                                        <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                                            주문 #{order.orderSeq}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#666" }}>
                                            {order.memberId} | ₩ {order.orderPrice?.toLocaleString() || 0} | {order.orderStatus}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}>
                                            {new Date(order.createdDate).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ManagerInfo;

