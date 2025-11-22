import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function ManagerInfo() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false); // 로그인 체크 중복 방지

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
    }, [navigate]);

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
                        회원관리
                    </h3>
                    <div style={{textAlign: "center", marginTop: "15px"}}>
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
                        팝업창 관리
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
                                fontSize: "13px",
                                marginBottom: "8px"
                            }}
                        >
                            chart 그래프 관리
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
                            챗봇관리
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
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0
                    }}>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 생성
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 생성시 비속어 검색기능
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 수정
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 내용 수정
                        </li>
                    </ul>
                </div>

                {/* 4. 공지사항 관리 */}
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
                        공지사항 관리
                    </h3>
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0
                    }}>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            공지사항
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            상단 노출
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            공지사항 상단 노출 줄수
                        </li>
                    </ul>
                </div>

                {/* 5. CSS 관리 */}
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
                        CSS 관리
                    </h3>
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0
                    }}>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 CSS 관리
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            imageboard CSS 관리
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            챗봇관리
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            ??
                        </li>
                    </ul>
                </div>

                {/* 6. 공동구매*이벤트* 게시판 */}
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
                        공동구매*이벤트* 게시판
                    </h3>
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0
                    }}>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 생성
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 생성시 비속어 검색기능
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 수정
                        </li>
                        <li style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            게시판 내용 수정
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ManagerInfo;

