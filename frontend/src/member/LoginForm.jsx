import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { validateLogin } from "../script/memberValidation";

function LoginForm() {
    const [id, setId] = useState("");
    const [pwd, setPwd] = useState("");

    const idRef = useRef(null);
    const pwdRef = useRef(null);

    const navigate = useNavigate();

    // 로그인 처리
    const fetchLoginData = async (loginData) => {
        try {
            const response = await fetch("http://localhost:8080/member/login",
                                        {   method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(loginData)
                                        });
            const data = await response.json();
            console.log("로그인 응답:", data); // 디버깅용
            if(response.ok) {
                if(data.rt === "OK") {
                    // 로그인 성공 - 세션 스토리지에 저장
                    sessionStorage.setItem("memName", data.name);
                    const nickname = data.nickname || data.name || ""; // 닉네임이 없으면 이름 사용
                    sessionStorage.setItem("memNickname", nickname);
                    sessionStorage.setItem("memId", data.id);
                    console.log("저장된 닉네임:", nickname); // 디버깅용
                    alert("로그인 성공");
                    navigate("/imageboard/imageboardList");
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

        if(!validateLogin(id, pwd, idRef, pwdRef)) {
            return false;
        }
        // 로그인 데이터 준비
        const loginData = {
            id: id,
            pwd: pwd
        };
        // 로그인 요청
        fetchLoginData(loginData);
    };

    const handleReset = () => {
        setId("");
        setPwd("");
    };

    return (
        <div className="container" style={{maxWidth: "400px", margin: "auto", padding: "20px"}}>
            <h3 align="center" style={{marginBottom: "20px", fontSize: "18px"}}>
                <i className="bi bi-box-arrow-in-right"></i> 로그인
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
                                <i className="bi bi-person"></i> 아이디
                            </td>
                            <td>
                                <input type="text" value={id} size="25"
                                        ref={idRef} 
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder="아이디를 입력하세요"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #ccc"}}>
                            <td align="left" style={{fontSize: "13px"}}>
                                <i className="bi bi-lock"></i> 비밀번호
                            </td>
                            <td>
                                <input type="password" value={pwd} size="25"
                                        ref={pwdRef} 
                                        onChange={(e) => setPwd(e.target.value)}
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
                                <Link to="/member/writeForm">
                                    <i className="bi bi-person-plus"></i> 회원가입
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

export default LoginForm;

