import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function ManagerLoginForm() {
    const [managerId, setManagerId] = useState("");
    const [managerPwd, setManagerPwd] = useState("");

    const managerIdRef = useRef(null);
    const managerPwdRef = useRef(null);

    const navigate = useNavigate();

    // 관리자 로그인 처리
    const fetchLoginData = async (loginData) => {
        try {
            const response = await fetch("http://localhost:8080/manager/login",
                                        {   method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(loginData)
                                        });
            const data = await response.json();
            console.log("관리자 로그인 응답:", data);
            if(response.ok) {
                if(data.rt === "OK") {
                    // 로그인 성공 - 세션 스토리지에 저장
                    sessionStorage.setItem("managerId", data.managerId);
                    sessionStorage.setItem("managerName", data.managerName);
                    sessionStorage.setItem("managerRole", data.managerRole);
                    alert("관리자 로그인 성공");
                    navigate("/manager/managerInfo");
                } else {
                    alert("아이디 또는 비밀번호가 일치하지 않습니다.");
                }
            } else {
                alert("로그인에 실패했습니다.");
            }
        } catch(err) {
            alert("로그인 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!managerId || managerId.trim() === "") {
            alert("관리자 ID를 입력하세요.");
            if(managerIdRef.current) managerIdRef.current.focus();
            return false;
        }

        if(!managerPwd || managerPwd.trim() === "") {
            alert("비밀번호를 입력하세요.");
            if(managerPwdRef.current) managerPwdRef.current.focus();
            return false;
        }

        // 로그인 데이터 준비
        const loginData = {
            managerId: managerId,
            managerPwd: managerPwd
        };
        // 로그인 요청
        fetchLoginData(loginData);
    };

    const handleReset = () => {
        setManagerId("");
        setManagerPwd("");
    };

    return (
        <div className="container" style={{maxWidth: "400px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "30px"}}>
            <h3 align="center" style={{marginBottom: "20px", fontSize: "18px"}}>
                <i className="bi bi-shield-lock"></i> 관리자 로그인
            </h3>
            <form onSubmit={handleSubmit}>
                <div style={{
                    borderRadius: "8px",
                    overflow: "hidden"
                }}>
                    <table className="table" style={{margin: 0, width: "100%", border: "none"}}>
                    <tbody>
                        <tr style={{borderBottom: "1px solid #ccc"}}>
                            <td align="left" style={{fontSize: "13px"}}>
                                <i className="bi bi-person"></i> 관리자 ID
                            </td>
                            <td>
                                <input type="text" value={managerId} size="25"
                                        ref={managerIdRef} 
                                        onChange={(e) => setManagerId(e.target.value)}
                                        placeholder="관리자 ID를 입력하세요"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #ccc"}}>
                            <td align="left" style={{fontSize: "13px"}}>
                                <i className="bi bi-lock"></i> 비밀번호
                            </td>
                            <td>
                                <input type="password" value={managerPwd} size="25"
                                        ref={managerPwdRef} 
                                        onChange={(e) => setManagerPwd(e.target.value)}
                                        placeholder="비밀번호를 입력하세요"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #ccc"}}>
                            <td align="center" colSpan="2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    style={{
                                        padding: "6px 12px",
                                        fontSize: "13px",
                                        backgroundColor: "#D4AF37",
                                        borderColor: "#D4AF37",
                                        color: "#000"
                                    }}
                                >
                                    <i className="bi bi-box-arrow-in-right"></i> 로그인
                                </button>
                                &nbsp;
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleReset}
                                    style={{
                                        padding: "6px 12px",
                                        fontSize: "13px"
                                    }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i> 다시 작성
                                </button>
                            </td>                            
                        </tr>
                        <tr>
                            <td colSpan="2" align="center" style={{fontSize: "13px"}}>
                                <Link to="/member/loginForm">
                                    <i className="bi bi-arrow-left"></i> 일반 회원 로그인
                                </Link>
                            </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
            </form>
        </div>
    );
}

export default ManagerLoginForm;

