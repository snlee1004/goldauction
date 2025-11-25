import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

function BoardList() {
    const navigate = useNavigate();
    const [boardList, setBoardList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [boardType, setBoardType] = useState("");  // 기본값: 전체 (빈 문자열은 전체 조회)
    const [productCounts, setProductCounts] = useState({}); // 게시판별 상품 수 (진행중, 마감, 종료)

    // 게시판 목록 조회
    const fetchBoardList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 캐시 방지를 위한 타임스탬프 추가
            const timestamp = new Date().getTime();
            let url = boardType && boardType.trim() !== "" 
                ? `http://localhost:8080/board/list?boardType=${encodeURIComponent(boardType)}&_t=${timestamp}`
                : `http://localhost:8080/board/list?_t=${timestamp}`;
            console.log("게시판 목록 API 호출:", url);
            
            // 캐시 방지 헤더 추가
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            console.log("게시판 목록 API 응답 상태:", response.status);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("게시판 목록 API 응답 데이터:", data);
            
            if(data.rt === "OK") {
                const boards = data.list || [];
                console.log("게시판 개수:", boards.length);
                setBoardList(boards);
                
                if(boards.length === 0) {
                    console.log("게시판이 없습니다. boardType:", boardType);
                }
            } else {
                const errorMsg = data.msg || data.message || "게시판 목록을 불러오는 중 오류가 발생했습니다.";
                setError(errorMsg);
                console.error("게시판 목록 조회 실패:", errorMsg);
            }
        } catch(err) {
            console.error("게시판 목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    }, [boardType]);

    useEffect(() => {
        fetchBoardList();
    }, [fetchBoardList]);

    // 각 게시판의 상품 수 조회 (진행중, 마감, 종료)
    useEffect(() => {
        const fetchProductCounts = async () => {
            const counts = {};
            for(const board of boardList) {
                // 공구이벤트 타입인 경우에만 조회
                if(board.boardType === "공구이벤트" && board.boardSeq) {
                    try {
                        // 진행중, 마감, 종료 상태별로 조회
                        const [activeRes, closedRes, endedRes] = await Promise.all([
                            fetch(`http://localhost:8080/event/product/list/status?boardSeq=${board.boardSeq}&eventStatus=진행중`),
                            fetch(`http://localhost:8080/event/product/list/status?boardSeq=${board.boardSeq}&eventStatus=마감`),
                            fetch(`http://localhost:8080/event/product/list/status?boardSeq=${board.boardSeq}&eventStatus=종료`)
                        ]);

                        const activeData = await activeRes.json();
                        const closedData = await closedRes.json();
                        const endedData = await endedRes.json();

                        counts[board.boardSeq] = {
                            진행중: activeData.rt === "OK" ? (activeData.total || 0) : 0,
                            마감: closedData.rt === "OK" ? (closedData.total || 0) : 0,
                            종료: endedData.rt === "OK" ? (endedData.total || 0) : 0
                        };
                    } catch(err) {
                        console.error(`게시판 ${board.boardSeq} 상품 수 조회 오류:`, err);
                        counts[board.boardSeq] = {
                            진행중: 0,
                            마감: 0,
                            종료: 0
                        };
                    }
                }
            }
            setProductCounts(counts);
        };

        if(boardList.length > 0) {
            fetchProductCounts();
        }
    }, [boardList]);

    // 페이지 포커스 시 데이터 새로고침 (다른 페이지에서 돌아왔을 때 최신 데이터 표시)
    useEffect(() => {
        const handleFocus = () => {
            fetchBoardList();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchBoardList]);

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            {/* 상단 헤더 영역 */}
            <div style={{
                marginBottom: "30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px"
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#333"
                }}>
                    특가이벤트 /공동구매
                </h2>
                
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap"
                }}>
                    {/* 게시판 타입 필터 */}
                    <div style={{
                        display: "flex",
                        gap: "5px"
                    }}>
                        <button
                            onClick={() => setBoardType("")}
                            style={{
                                padding: "4px 10px",
                                backgroundColor: boardType === "" ? "#337ab7" : "#6c757d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px"
                            }}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => setBoardType("일반")}
                            style={{
                                padding: "4px 10px",
                                backgroundColor: boardType === "일반" ? "#337ab7" : "#6c757d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px"
                            }}
                        >
                            일반게시판
                        </button>
                        <button
                            onClick={() => setBoardType("공구이벤트")}
                            style={{
                                padding: "4px 10px",
                                backgroundColor: boardType === "공구이벤트" ? "#337ab7" : "#6c757d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px"
                            }}
                        >
                            공구이벤트
                        </button>
                    </div>
                    
                    {/* 관리자 버튼 */}
                    {sessionStorage.getItem("managerId") && (
                        <>
                            <Link
                                to="/board/create"
                                style={{
                                    display: "inline-block",
                                    padding: "8px 16px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    textDecoration: "none",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                            >
                                <i className="bi bi-plus-circle"></i> 게시판 생성
                            </Link>
                            <Link
                                to="/manager/managerInfo"
                                style={{
                                    display: "inline-block",
                                    padding: "8px 16px",
                                    backgroundColor: "#6c757d",
                                    color: "#fff",
                                    textDecoration: "none",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                            >
                                관리자 페이지
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {loading && (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#d9534f",
                    backgroundColor: "#f8d7da",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div>
                    {boardList.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666"
                        }}>
                            등록된 게시판이 없습니다.
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "20px"
                        }}>
                            {boardList.map((board) => (
                                <div
                                    key={board.boardSeq}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        backgroundColor: "#fff",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        transition: "transform 0.2s",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                    }}
                                    onClick={() => navigate(`/board/${board.boardSeq}/posts`)}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "10px",
                                        marginBottom: "10px"
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            flex: 1
                                        }}>
                                            <h3 style={{
                                                margin: 0,
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                                color: "#337ab7"
                                            }}>
                                                {board.boardName}
                                            </h3>
                                            {board.isActive === "N" && (
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: "#dc3545",
                                                    fontWeight: "bold"
                                                }}>
                                                    비활성화
                                                </span>
                                            )}
                                        </div>
                                        {/* 상품 수 표시 (공구이벤트만) */}
                                        {board.boardType === "공구이벤트" && productCounts[board.boardSeq] && (
                                            <div style={{
                                                display: "flex",
                                                gap: "15px",
                                                alignItems: "flex-end"
                                            }}>
                                                {/* 진행중 */}
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "2px"
                                                }}>
                                                    <span style={{
                                                        fontSize: "28px",
                                                        fontWeight: "bold",
                                                        color: "#337ab7",
                                                        lineHeight: "1"
                                                    }}>
                                                        {productCounts[board.boardSeq].진행중 || 0}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "12px",
                                                        color: "#666"
                                                    }}>
                                                        진행중
                                                    </span>
                                                </div>
                                                {/* 마감 */}
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "2px"
                                                }}>
                                                    <span style={{
                                                        fontSize: "28px",
                                                        fontWeight: "bold",
                                                        color: "#ffc107",
                                                        lineHeight: "1"
                                                    }}>
                                                        {productCounts[board.boardSeq].마감 || 0}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "12px",
                                                        color: "#666"
                                                    }}>
                                                        마감
                                                    </span>
                                                </div>
                                                {/* 종료 */}
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "2px"
                                                }}>
                                                    <span style={{
                                                        fontSize: "28px",
                                                        fontWeight: "bold",
                                                        color: "#dc3545",
                                                        lineHeight: "1"
                                                    }}>
                                                        {productCounts[board.boardSeq].종료 || 0}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "12px",
                                                        color: "#666"
                                                    }}>
                                                        종료
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {board.boardDescription && (
                                        <p style={{
                                            marginBottom: "10px",
                                            color: "#666",
                                            fontSize: "14px",
                                            lineHeight: "1.5"
                                        }}>
                                            {board.boardDescription}
                                        </p>
                                    )}
                                    {board.boardCategory && (
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 8px",
                                            backgroundColor: "#e9ecef",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            color: "#666",
                                            marginBottom: "10px"
                                        }}>
                                            {board.boardCategory}
                                        </span>
                                    )}
                                    <div style={{
                                        marginTop: "10px",
                                        paddingTop: "10px",
                                        borderTop: "1px solid #eee",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <span style={{
                                            fontSize: "12px",
                                            color: "#999"
                                        }}>
                                            타입: {board.boardType}
                                        </span>
                                        {sessionStorage.getItem("managerId") && (
                                            <Link
                                                to={board.boardType === '일반' ? `/board/${board.boardSeq}/manage` : `/board/${board.boardSeq}/event/manage`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    padding: "4px 8px",
                                                    backgroundColor: "#337ab7",
                                                    color: "#fff",
                                                    textDecoration: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "11px"
                                                }}
                                            >
                                                관리
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

export default BoardList;

