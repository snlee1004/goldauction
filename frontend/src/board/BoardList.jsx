import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function BoardList() {
    const navigate = useNavigate();
    const [boardList, setBoardList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [boardType, setBoardType] = useState("");  // 기본값: 전체 (빈 문자열은 전체 조회)

    useEffect(() => {
        fetchBoardList();
    }, [boardType]);

    // 게시판 목록 조회
    const fetchBoardList = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = boardType && boardType.trim() !== "" 
                ? `http://localhost:8080/board/list?boardType=${encodeURIComponent(boardType)}`
                : `http://localhost:8080/board/list`;
            console.log("게시판 목록 API 호출:", url);
            
            const response = await fetch(url);
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
                게시판 목록
            </h2>

            {/* 게시판 타입 필터 */}
            <div style={{
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                justifyContent: "center"
            }}>
                <button
                    onClick={() => setBoardType("")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: boardType === "" ? "#337ab7" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    전체
                </button>
                <button
                    onClick={() => setBoardType("일반")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: boardType === "일반" ? "#337ab7" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    일반 게시판
                </button>
                <button
                    onClick={() => setBoardType("공구이벤트")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: boardType === "공구이벤트" ? "#337ab7" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    공구이벤트 게시판
                </button>
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
                                        gap: "10px",
                                        marginBottom: "10px"
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

            {/* 관리자 메뉴 */}
            {sessionStorage.getItem("managerId") && (
                <div style={{
                    marginTop: "30px",
                    textAlign: "center"
                }}>
                    <Link
                        to="/board/create"
                        style={{
                            display: "inline-block",
                            padding: "10px 20px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            marginRight: "10px"
                        }}
                    >
                        <i className="bi bi-plus-circle"></i> 게시판 생성
                    </Link>
                    <Link
                        to="/manager/managerInfo"
                        style={{
                            display: "inline-block",
                            padding: "10px 20px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    >
                        관리자 페이지
                    </Link>
                </div>
            )}
        </div>
    );
}

export default BoardList;

