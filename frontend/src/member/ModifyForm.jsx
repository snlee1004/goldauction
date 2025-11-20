import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { validateModify } from "../script/memberValidation";

function ModifyForm() {
    const [nickname, setNickname] = useState("");
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [pwd, setPwd] = useState("");
    const [pwdConfirm, setPwdConfirm] = useState("");
    const [gender, setGender] = useState("");
    const [email1, setEmail1] = useState("");
    const [email2, setEmail2] = useState("");
    const [email2Select, setEmail2Select] = useState("");
    const [tel1, setTel1] = useState("");
    const [tel2, setTel2] = useState("");
    const [tel3, setTel3] = useState("");
    const [addr, setAddr] = useState("");

    const nicknameRef = useRef(null);
    const nameRef = useRef(null);
    const pwdRef = useRef(null);
    const pwdConfirmRef = useRef(null);
    const genderRef = useRef(null);
    const email1Ref = useRef(null);
    const tel1Ref = useRef(null);
    const addrRef = useRef(null);

    const navigate = useNavigate();
    const loginCheckedRef = useRef(false); // 로그인 체크 중복 방지

    // 회원정보 조회
    useEffect(() => {
        if(loginCheckedRef.current) return; // 이미 체크했으면 리턴
        loginCheckedRef.current = true;
        
        const memId = sessionStorage.getItem("memId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        fetchMemberData(memId);
    }, [navigate]);

    const fetchMemberData = async (memId) => {
        try {
            const response = await fetch(`http://localhost:8080/member/getMember?id=${memId}`);
            const data = await response.json();
            if(response.ok && data.rt === "OK") {
                const member = data.member;
                setNickname(member.nickname || "");
                setName(member.name);
                setId(member.id);
                setGender(member.gender);
                setEmail1(member.email1);
                setEmail2(member.email2);
                // 전화번호 분리
                if(member.tel1) setTel1(member.tel1);
                if(member.tel2) setTel2(member.tel2);
                if(member.tel3) setTel3(member.tel3);
                setAddr(member.addr);
            } else {
                alert("회원정보를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            alert("회원정보 조회 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    // 이메일 도메인 선택
    const handleEmail2Select = (e) => {
        const selected = e.target.value;
        setEmail2Select(selected);
        if(selected !== "직접입력") {
            setEmail2(selected);
        } else {
            setEmail2("");
        }
    };


    // 회원정보 수정 처리
    const fetchModifyData = async (memberData) => {
        try {
            const response = await fetch("http://localhost:8080/member/modify",
                                        {   method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(memberData)
                                        });
            const data = await response.json();
            if(response.ok) {
                if(data.rt === "OK") {
                    alert("회원정보 수정 성공");
                    navigate("/imageboard/imageboardList");
                } else {
                    alert("회원정보 수정 실패");
                }
            } else {
                alert("회원정보 수정에 실패했습니다.");
            }
        } catch(err) {
            alert("회원정보 수정 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            nickname, name, pwd, pwdConfirm, gender, email1, email2, tel1, tel2, tel3, addr
        };
        const refs = {
            nicknameRef, nameRef, pwdRef, pwdConfirmRef, genderRef, email1Ref, tel1Ref, addrRef
        };
        
        if(!validateModify(formData, refs)) {
            return false;
        }
        
        const memberData = {
            nickname: nickname,
            name: name,
            id: id,
            pwd: pwd,
            gender: gender,
            email1: email1,
            email2: email2,
            tel1: tel1,
            tel2: tel2,
            tel3: tel3,
            addr: addr
        };
        // 회원정보 수정 요청
        fetchModifyData(memberData);
    };

    const handleReset = () => {
        // 기존 데이터 다시 불러오기
        const memId = sessionStorage.getItem("memId");
        if(memId) {
            fetchMemberData(memId);
        }
    };

    return (
        <div className="container" style={{maxWidth: "800px", margin: "0 auto", padding: "20px", marginTop: "70px", paddingTop: "10px", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h3 align="center" style={{marginBottom: "20px", fontSize: "18px"}}>
                <i className="bi bi-pencil-square"></i> 회원정보 수정
            </h3>
            <form onSubmit={handleSubmit} style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <div style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    width: "100%",
                    maxWidth: "600px"
                }}>
                    <table className="table" style={{margin: "0 auto", width: "100%"}}>
                    <tbody>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-person-circle"></i> 닉네임
                            </td>
                            <td>
                                <input type="text" value={nickname} size="25"
                                        ref={nicknameRef} 
                                        disabled
                                        style={{backgroundColor: "#e9ecef", fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-person"></i> 이름
                            </td>
                            <td>
                                <input type="text" value={name} size="25"
                                        ref={nameRef} 
                                        disabled
                                        style={{backgroundColor: "#e9ecef", fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-person-badge"></i> 아이디
                            </td>
                            <td>
                                <input type="text" value={id} size="25"
                                        disabled
                                        style={{backgroundColor: "#e9ecef", fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-lock"></i> 비밀번호
                            </td>
                            <td>
                                <input type="password" value={pwd} size="25"
                                        ref={pwdRef} 
                                        onChange={(e) => setPwd(e.target.value)}
                                        placeholder="비밀번호 변경시 입력"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-lock-fill"></i> 비밀번호 확인
                            </td>
                            <td>
                                <input type="password" value={pwdConfirm} size="25"
                                        ref={pwdConfirmRef} 
                                        onChange={(e) => setPwdConfirm(e.target.value)}
                                        placeholder="비밀번호 변경시 다시 입력"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-gender-ambiguous"></i> 성별
                            </td>
                            <td style={{fontSize: "13px"}}>
                                <input type="radio" name="gender" value="남" 
                                        ref={genderRef}
                                        checked={gender === "남"}
                                        disabled/> 남
                                &nbsp;
                                <input type="radio" name="gender" value="여"
                                        checked={gender === "여"}
                                        disabled/> 여
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-envelope"></i> 이메일
                            </td>
                            <td>
                                <input type="text" value={email1} size="12"
                                        ref={email1Ref} 
                                        onChange={(e) => setEmail1(e.target.value)}
                                        placeholder="이메일"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                                @
                                <input type="text" value={email2} size="12"
                                        onChange={(e) => setEmail2(e.target.value)}
                                        placeholder="도메인"
                                        disabled={email2Select !== "직접입력" && email2Select !== ""}
                                        style={{fontSize: "13px", padding: "6px"}}/>
                                <select value={email2Select} onChange={handleEmail2Select} style={{marginLeft: "5px", fontSize: "13px", padding: "6px"}}>
                                    <option value="">선택하세요</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="gmail.com">gmail.com</option>
                                    <option value="daum.net">daum.net</option>
                                    <option value="직접입력">직접입력</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-telephone"></i> 전화번호
                            </td>
                            <td>
                                <input type="text" value={tel1} size="8"
                                        ref={tel1Ref} 
                                        onChange={(e) => setTel1(e.target.value)}
                                        placeholder="010"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                                -
                                <input type="text" value={tel2} size="8"
                                        onChange={(e) => setTel2(e.target.value)}
                                        placeholder="1234"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                                -
                                <input type="text" value={tel3} size="8"
                                        onChange={(e) => setTel3(e.target.value)}
                                        placeholder="5678"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style={{whiteSpace: "nowrap", width: "150px", fontSize: "13px"}}>
                                <i className="bi bi-house"></i> 주소
                            </td>
                            <td>
                                <input type="text" value={addr} size="30"
                                        ref={addrRef} 
                                        onChange={(e) => setAddr(e.target.value)}
                                        placeholder="주소를 입력하세요"
                                        style={{fontSize: "13px", padding: "6px"}}/>
                            </td>
                        </tr>
                        <tr>
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
                                    <i className="bi bi-check-circle"></i> 수정
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
                    </tbody>
                    </table>
                </div>
            </form>
        </div>
    );
}

export default ModifyForm;

