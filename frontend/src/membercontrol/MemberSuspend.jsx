import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function MemberSuspend() {
    const [memberId, setMemberId] = useState("");
    const [memberName, setMemberName] = useState("");
    const [suspendDays, setSuspendDays] = useState(30);
    const [reason, setReason] = useState("");
    
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
        
        const id = searchParams.get("id");
        if(id) {
            setMemberId(id);
            fetchMemberName(id);
        } else {
            alert("회원 ID가 필요합니다.");
            navigate("/membercontrol/list");
        }
    }, [navigate, searchParams]);

    // 회원 이름 조회
    const fetchMemberName = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/member/getMember?id=${encodeURIComponent(id)}`);
            const data = await response.json();
            
            if(data.rt === "OK" && data.member) {
                setMemberName(data.member.name || id);
            } else {
                setMemberName(id);
            }
        } catch(err) {
            console.error("회원 정보 조회 오류:", err);
            setMemberName(id);
        }
    };

    // 계정 정지 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!reason || reason.trim() === "") {
            alert("정지 사유를 입력하세요.");
            return;
        }
        
        if(!window.confirm(`${memberName}(${memberId}) 회원을 ${suspendDays}일간 정지하시겠습니까?`)) {
            return;
        }
        
        try {
            const response = await fetch("http://localhost:8080/membercontrol/suspend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: memberId,
                    suspendDays: suspendDays,
                    reason: reason
                })
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("계정이 정지되었습니다.");
                navigate("/membercontrol/list");
            } else {
                alert(data.msg || "계정 정지에 실패했습니다.");
            }
        } catch(err) {
            console.error("계정 정지 오류:", err);
            alert("계정 정지 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="container" style={{maxWidth: "600px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "10px"}}>
            <h2 style={{textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold"}}>
                계정 정지 설정
            </h2>

            <form onSubmit={handleSubmit}>
                <div style={{border: "2px solid #ccc", borderRadius: "8px", padding: "20px"}}>
                    <table style={{width: "100%", margin: 0}}>
                        <tbody>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold", width: "150px"}}>회원 ID</td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="text"
                                        value={memberId}
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
                                <td style={{padding: "8px", fontWeight: "bold"}}>회원 이름</td>
                                <td style={{padding: "8px"}}>
                                    <input
                                        type="text"
                                        value={memberName}
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
                                <td style={{padding: "8px", fontWeight: "bold"}}>정지 기간 <span style={{color: "red"}}>*</span></td>
                                <td style={{padding: "8px"}}>
                                    <select
                                        value={suspendDays}
                                        onChange={(e) => setSuspendDays(parseInt(e.target.value))}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    >
                                        <option value="30">30일</option>
                                        <option value="60">60일 (2개월)</option>
                                        <option value="90">90일 (3개월)</option>
                                        <option value="180">180일 (6개월)</option>
                                        <option value="365">365일 (1년)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "8px", fontWeight: "bold", verticalAlign: "top"}}>정지 사유 <span style={{color: "red"}}>*</span></td>
                                <td style={{padding: "8px"}}>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        rows="5"
                                        placeholder="정지 사유를 입력하세요"
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            resize: "vertical"
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
                        className="btn btn-warning"
                        style={{
                            padding: "8px 16px",
                            marginRight: "10px"
                        }}
                    >
                        정지 설정
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

export default MemberSuspend;

