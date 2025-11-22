import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function MemberModify() {
    const [memberData, setMemberData] = useState({
        id: "",
        name: "",
        nickname: "",
        pwd: "",
        gender: "",
        email1: "",
        email2: "",
        tel1: "",
        tel2: "",
        tel3: "",
        addr: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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
        
        const memberId = searchParams.get("id");
        if(memberId) {
            fetchMemberData(memberId);
        } else {
            alert("회원 ID가 필요합니다.");
            navigate("/membercontrol/list");
        }
    }, [navigate, searchParams]);

    // 회원 정보 조회
    const fetchMemberData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/member/getMember?id=${encodeURIComponent(id)}`);
            const data = await response.json();
            
            if(data.rt === "OK" && data.member) {
                const member = data.member;
                setMemberData({
                    id: member.id || "",
                    name: member.name || "",
                    nickname: member.nickname || "",
                    pwd: "",  // 비밀번호는 수정 시에만 입력
                    gender: member.gender || "",
                    email1: member.email1 || "",
                    email2: member.email2 || "",
                    tel1: member.tel1 || "",
                    tel2: member.tel2 || "",
                    tel3: member.tel3 || "",
                    addr: member.addr || ""
                });
            } else {
                setError("회원 정보를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("회원 정보 조회 오류:", err);
            setError("회원 정보 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 회원 정보 수정
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!memberData.name || memberData.name.trim() === "") {
            alert("이름을 입력하세요.");
            return;
        }
        
        try {
            const modifyData = {
                id: memberData.id,
                name: memberData.name,
                nickname: memberData.nickname,
                gender: memberData.gender,
                email1: memberData.email1,
                email2: memberData.email2,
                tel1: memberData.tel1,
                tel2: memberData.tel2,
                tel3: memberData.tel3,
                addr: memberData.addr
            };
            
            // 비밀번호가 입력된 경우에만 포함
            if(memberData.pwd && memberData.pwd.trim() !== "") {
                modifyData.pwd = memberData.pwd;
            }
            
            const response = await fetch("http://localhost:8080/membercontrol/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(modifyData)
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("회원 정보가 수정되었습니다.");
                navigate("/membercontrol/list");
            } else {
                alert(data.msg || "회원 정보 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("회원 정보 수정 오류:", err);
            alert("회원 정보 수정 중 오류가 발생했습니다.");
        }
    };

    if(loading) {
        return (
            <div style={{textAlign: "center", padding: "50px"}}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{maxWidth: "600px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "10px"}}>
            <h2 style={{textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold"}}>
                회원 정보 수정
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

            <form onSubmit={handleSubmit}>
                <div style={{border: "2px solid #ccc", borderRadius: "8px", padding: "20px"}}>
                    <table style={{width: "100%", margin: 0}}>
                        <tbody>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold", width: "120px"}}>아이디</td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="text"
                                        value={memberData.id}
                                        disabled
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            backgroundColor: "#f5f5f5"
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>이름 <span style={{color: "red"}}>*</span></td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="text"
                                        value={memberData.name}
                                        onChange={(e) => setMemberData({...memberData, name: e.target.value})}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>닉네임</td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="text"
                                        value={memberData.nickname}
                                        onChange={(e) => setMemberData({...memberData, nickname: e.target.value})}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>비밀번호</td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="password"
                                        value={memberData.pwd}
                                        onChange={(e) => setMemberData({...memberData, pwd: e.target.value})}
                                        placeholder="변경하지 않으려면 비워두세요"
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>성별</td>
                                <td style={{padding: "8px"}}>
                                    <select
                                        value={memberData.gender}
                                        onChange={(e) => setMemberData({...memberData, gender: e.target.value})}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="남">남</option>
                                        <option value="여">여</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>이메일</td>
                                <td style={{padding: "8px", display: "flex", gap: "5px"}}>
                                    <input
                                        type="text"
                                        value={memberData.email1}
                                        onChange={(e) => setMemberData({...memberData, email1: e.target.value})}
                                        placeholder="이메일 아이디"
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                    <span style={{padding: "8px 0"}}>@</span>
                                    <input
                                        type="text"
                                        value={memberData.email2}
                                        onChange={(e) => setMemberData({...memberData, email2: e.target.value})}
                                        placeholder="도메인"
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>전화번호</td>
                                <td style={{padding: "8px", display: "flex", gap: "5px"}}>
                                    <input
                                        type="text"
                                        value={memberData.tel1}
                                        onChange={(e) => setMemberData({...memberData, tel1: e.target.value})}
                                        placeholder="010"
                                        maxLength="3"
                                        style={{
                                            width: "80px",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                    <span style={{padding: "8px 0"}}>-</span>
                                    <input
                                        type="text"
                                        value={memberData.tel2}
                                        onChange={(e) => setMemberData({...memberData, tel2: e.target.value})}
                                        placeholder="1234"
                                        maxLength="4"
                                        style={{
                                            width: "100px",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                    <span style={{padding: "8px 0"}}>-</span>
                                    <input
                                        type="text"
                                        value={memberData.tel3}
                                        onChange={(e) => setMemberData({...memberData, tel3: e.target.value})}
                                        placeholder="5678"
                                        maxLength="4"
                                        style={{
                                            width: "100px",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold"}}>주소</td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="text"
                                        value={memberData.addr}
                                        onChange={(e) => setMemberData({...memberData, addr: e.target.value})}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{textAlign: "center", marginTop: "20px"}}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            padding: "8px 16px",
                            marginRight: "10px",
                            backgroundColor: "#D4AF37",
                            borderColor: "#D4AF37",
                            color: "#000"
                        }}
                    >
                        수정
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/membercontrol/list")}
                        className="btn btn-secondary"
                        style={{padding: "8px 16px"}}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default MemberModify;

