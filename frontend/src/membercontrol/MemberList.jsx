import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function MemberList() {
    const [memberList, setMemberList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
        fetchMemberList(1, null);
    }, [navigate]);

    // 회원 목록 조회
    const fetchMemberList = async (pg, searchKeyword) => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/membercontrol/list?pg=${pg}`;
            if(searchKeyword && searchKeyword.trim() !== "") {
                url += `&keyword=${encodeURIComponent(searchKeyword)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if(data.rt === "OK") {
                setMemberList(data.items || []);
                setTotalCount(data.total || 0);
                setCurrentPage(pg);
            } else {
                setError(data.msg || "회원 목록을 불러오는데 실패했습니다.");
                setMemberList([]);
            }
        } catch(err) {
            console.error("회원 목록 조회 오류:", err);
            setError("회원 목록 조회 중 오류가 발생했습니다.");
            setMemberList([]);
        } finally {
            setLoading(false);
        }
    };

    // 검색 처리
    const handleSearch = () => {
        fetchMemberList(1, keyword);
    };

    // 회원 삭제
    const handleDelete = async (id, name) => {
        if(!window.confirm(`정말로 ${name}(${id}) 회원을 삭제하시겠습니까?`)) {
            return;
        }
        
        try {
            const response = await fetch("http://localhost:8080/membercontrol/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: id })
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("회원이 삭제되었습니다.");
                fetchMemberList(currentPage, keyword || null);
            } else {
                alert(data.msg || "회원 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("회원 삭제 오류:", err);
            alert("회원 삭제 중 오류가 발생했습니다.");
        }
    };

    // 계정 정지
    const handleSuspend = (id) => {
        navigate(`/membercontrol/suspend?id=${id}`);
    };

    // 계정 정지 해제
    const handleUnsuspend = async (id) => {
        if(!window.confirm("계정 정지를 해제하시겠습니까?")) {
            return;
        }
        
        try {
            const response = await fetch("http://localhost:8080/membercontrol/unsuspend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: id })
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("계정 정지가 해제되었습니다.");
                fetchMemberList(currentPage, keyword || null);
            } else {
                alert(data.msg || "계정 정지 해제에 실패했습니다.");
            }
        } catch(err) {
            console.error("계정 정지 해제 오류:", err);
            alert("계정 정지 해제 중 오류가 발생했습니다.");
        }
    };

    // 회원 수정
    const handleModify = (id) => {
        navigate(`/membercontrol/modify?id=${id}`);
    };

    // 페이지네이션
    const totalPages = Math.ceil(totalCount / 10);
    const pageNumbers = [];
    for(let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // 정지 상태 표시
    const getSuspendStatus = (member) => {
        if(member.isSuspended === "Y") {
            const endDate = member.suspendEndDate ? new Date(member.suspendEndDate) : null;
            const today = new Date();
            if(endDate && endDate > today) {
                return `정지중 (${endDate.toLocaleDateString()}까지)`;
            } else {
                return "정지 만료";
            }
        }
        return "정상";
    };

    return (
        <div className="container" style={{maxWidth: "1200px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "10px"}}>
            <h2 style={{textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold"}}>
                회원 관리
            </h2>

            {error && (
                <div style={{
                    padding: "15px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#721c24",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            {/* 검색 */}
            <div style={{marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center"}}>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="이름, 아이디, 닉네임으로 검색"
                    style={{
                        flex: 1,
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                />
                <button
                    onClick={handleSearch}
                    className="btn btn-primary"
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#D4AF37",
                        borderColor: "#D4AF37",
                        color: "#000"
                    }}
                >
                    검색
                </button>
                <button
                    onClick={() => {
                        setKeyword("");
                        fetchMemberList(1, null);
                    }}
                    className="btn btn-secondary"
                    style={{padding: "8px 16px"}}
                >
                    전체보기
                </button>
            </div>

            {loading && (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* 회원 목록 */}
            <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden", marginBottom: "20px"}}>
                <div style={{maxHeight: "600px", overflowY: "auto"}}>
                    <table style={{margin: 0, width: "100%"}}>
                        <thead style={{position: "sticky", top: 0, backgroundColor: "#b3d9ff", zIndex: 1}}>
                            <tr>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>아이디</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>이름</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>닉네임</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>이메일</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>전화번호</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>상태</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>가입일</th>
                                <th style={{padding: "10px", fontWeight: "bold", textAlign: "center", fontSize: "13px"}}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberList.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{padding: "20px", textAlign: "center", color: "#666"}}>
                                        회원이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                memberList.map(member => (
                                    <tr key={member.id} style={{borderBottom: "1px solid #eee"}}>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>{member.id}</td>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>{member.name}</td>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>{member.nickname || "-"}</td>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>
                                            {member.email1 && member.email2 ? `${member.email1}@${member.email2}` : "-"}
                                        </td>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>
                                            {member.tel1 && member.tel2 && member.tel3 
                                                ? `${member.tel1}-${member.tel2}-${member.tel3}` 
                                                : "-"}
                                        </td>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>
                                            <span style={{
                                                color: member.isSuspended === "Y" ? "#d9534f" : "#5cb85c",
                                                fontWeight: "bold"
                                            }}>
                                                {getSuspendStatus(member)}
                                            </span>
                                        </td>
                                        <td style={{padding: "10px", textAlign: "center", fontSize: "13px"}}>
                                            {member.logtime ? new Date(member.logtime).toLocaleDateString() : "-"}
                                        </td>
                                        <td style={{padding: "10px", textAlign: "center"}}>
                                            <button
                                                onClick={() => handleModify(member.id)}
                                                className="btn btn-sm btn-primary"
                                                style={{
                                                    padding: "4px 8px",
                                                    marginRight: "5px",
                                                    fontSize: "12px",
                                                    backgroundColor: "#337ab7",
                                                    borderColor: "#337ab7"
                                                }}
                                            >
                                                수정
                                            </button>
                                            {member.isSuspended === "Y" ? (
                                                <button
                                                    onClick={() => handleUnsuspend(member.id)}
                                                    className="btn btn-sm btn-success"
                                                    style={{
                                                        padding: "4px 8px",
                                                        marginRight: "5px",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    정지해제
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSuspend(member.id)}
                                                    className="btn btn-sm btn-warning"
                                                    style={{
                                                        padding: "4px 8px",
                                                        marginRight: "5px",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    정지
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(member.id, member.name)}
                                                className="btn btn-sm btn-danger"
                                                style={{
                                                    padding: "4px 8px",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div style={{textAlign: "center", marginTop: "20px"}}>
                    {pageNumbers.map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => fetchMemberList(pageNum, keyword || null)}
                            className="btn btn-sm"
                            style={{
                                margin: "0 3px",
                                padding: "6px 12px",
                                backgroundColor: currentPage === pageNum ? "#D4AF37" : "#fff",
                                borderColor: "#ccc",
                                color: currentPage === pageNum ? "#000" : "#333"
                            }}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}

            {/* 관리자 페이지로 이동 */}
            <div style={{textAlign: "center", marginTop: "20px"}}>
                <button
                    onClick={() => navigate("/manager/managerInfo")}
                    className="btn btn-secondary"
                    style={{padding: "6px 12px"}}
                >
                    관리자 페이지로
                </button>
            </div>
        </div>
    );
}

export default MemberList;

