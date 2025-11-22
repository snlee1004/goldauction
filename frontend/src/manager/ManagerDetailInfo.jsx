import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ManagerDetailInfo() {
    const [managerData, setManagerData] = useState({});
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
        fetchManagerData(managerId);
    }, [navigate]);

    // 관리자 정보 조회
    const fetchManagerData = async (managerId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/manager/getManager?managerId=${encodeURIComponent(managerId)}`);
            const data = await response.json();
            if(response.ok && data.rt === "OK") {
                setManagerData(data.manager);
            } else {
                setError("관리자 정보를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("관리자 정보 조회 오류:", err);
            setError("관리자 정보 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 로그아웃 처리
    const handleLogout = () => {
        sessionStorage.removeItem("managerId");
        sessionStorage.removeItem("managerName");
        sessionStorage.removeItem("managerRole");
        alert("로그아웃되었습니다.");
        navigate("/manager/loginForm");
    };

    // 관리자 페이지로 이동
    const handleGoToManagerPage = () => {
        navigate("/manager/managerInfo");
    };

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "10px"}}>
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

            {loading && (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* 관리자 정보 섹션 */}
            <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden", marginBottom: "30px", display: "flex", justifyContent: "center", padding: "20px", maxWidth: "550px", margin: "0 auto 30px auto"}}>
                <table style={{margin: 0}}>
                    <tbody>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", width: "150px", textAlign: "left", fontSize: "13px"}}>관리자 ID</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{managerData.managerId || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>이름</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{managerData.managerName || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>이메일</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{managerData.managerEmail || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>전화번호</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{managerData.managerTel || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>권한</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{managerData.managerRole || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>등록일</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>
                                {managerData.logtime 
                                    ? new Date(managerData.logtime).toLocaleDateString() 
                                    : "-"}
                            </td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>마지막 로그인</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>
                                {managerData.lastLogin 
                                    ? new Date(managerData.lastLogin).toLocaleString() 
                                    : "-"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 버튼 */}
            <div style={{textAlign: "center", marginBottom: "30px"}}>
                <button 
                    className="btn btn-primary" 
                    onClick={handleGoToManagerPage}
                    style={{
                        padding: "6px 12px",
                        marginRight: "10px",
                        fontSize: "13px",
                        backgroundColor: "#D4AF37",
                        borderColor: "#D4AF37",
                        color: "#000"
                    }}
                >
                    <i className="bi bi-gear"></i> 관리자 페이지
                </button>
                <button 
                    className="btn btn-danger" 
                    onClick={handleLogout}
                    style={{
                        padding: "6px 12px",
                        fontSize: "13px"
                    }}
                >
                    <i className="bi bi-box-arrow-right"></i> 로그아웃
                </button>
            </div>
        </div>
    );
}

export default ManagerDetailInfo;

