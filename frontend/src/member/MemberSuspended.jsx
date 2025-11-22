import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function MemberSuspended() {
    const [suspendInfo, setSuspendInfo] = useState({
        endDate: null,
        reason: ""
    });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // URL 파라미터에서 정지 정보 가져오기
        const endDateParam = searchParams.get("endDate");
        const reasonParam = searchParams.get("reason");
        
        if(endDateParam) {
            setSuspendInfo({
                endDate: new Date(endDateParam),
                reason: reasonParam || "관리자에 의해 계정이 정지되었습니다."
            });
        } else {
            // 세션 스토리지에서 정지 정보 가져오기
            const storedEndDate = sessionStorage.getItem("suspendEndDate");
            const storedReason = sessionStorage.getItem("suspendReason");
            
            if(storedEndDate) {
                setSuspendInfo({
                    endDate: new Date(storedEndDate),
                    reason: storedReason || "관리자에 의해 계정이 정지되었습니다."
                });
            }
        }
    }, [searchParams]);

    // 남은 일수 계산
    const getRemainingDays = () => {
        if(!suspendInfo.endDate) return 0;
        const today = new Date();
        const endDate = new Date(suspendInfo.endDate);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // 로그아웃 처리
    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/member/loginForm");
    };

    return (
        <div className="container" style={{
            maxWidth: "600px", 
            margin: "auto", 
            padding: "20px", 
            marginTop: "70px", 
            paddingTop: "30px"
        }}>
            <div style={{
                border: "3px solid #d9534f",
                borderRadius: "10px",
                padding: "40px",
                backgroundColor: "#fff",
                textAlign: "center"
            }}>
                {/* 경고 아이콘 */}
                <div style={{marginBottom: "20px"}}>
                    <i className="bi bi-exclamation-triangle-fill" style={{
                        fontSize: "64px",
                        color: "#d9534f"
                    }}></i>
                </div>

                {/* 제목 */}
                <h2 style={{
                    color: "#d9534f",
                    marginBottom: "20px",
                    fontSize: "28px",
                    fontWeight: "bold"
                }}>
                    계정이 정지되었습니다
                </h2>

                {/* 안내 문구 */}
                <div style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                    textAlign: "left"
                }}>
                    <p style={{
                        fontSize: "16px",
                        lineHeight: "1.6",
                        color: "#856404",
                        margin: "0 0 15px 0"
                    }}>
                        죄송합니다. 귀하의 계정이 관리자에 의해 정지되었습니다.
                    </p>

                    {suspendInfo.endDate && (
                        <>
                            <div style={{
                                marginBottom: "15px",
                                padding: "10px",
                                backgroundColor: "#fff",
                                borderRadius: "4px",
                                border: "1px solid #ddd"
                            }}>
                                <div style={{
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                    color: "#333"
                                }}>
                                    정지 종료일:
                                </div>
                                <div style={{color: "#d9534f", fontSize: "18px", fontWeight: "bold"}}>
                                    {suspendInfo.endDate.toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                {getRemainingDays() > 0 && (
                                    <div style={{
                                        marginTop: "10px",
                                        color: "#666",
                                        fontSize: "14px"
                                    }}>
                                        (약 {getRemainingDays()}일 후 해제 예정)
                                    </div>
                                )}
                            </div>

                            {suspendInfo.reason && (
                                <div style={{
                                    marginTop: "15px",
                                    padding: "10px",
                                    backgroundColor: "#fff",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd"
                                }}>
                                    <div style={{
                                        fontWeight: "bold",
                                        marginBottom: "5px",
                                        color: "#333"
                                    }}>
                                        정지 사유:
                                    </div>
                                    <div style={{
                                        color: "#666",
                                        fontSize: "14px",
                                        lineHeight: "1.5"
                                    }}>
                                        {suspendInfo.reason}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {!suspendInfo.endDate && (
                        <div style={{
                            color: "#666",
                            fontSize: "14px"
                        }}>
                            정지 기간 정보를 확인할 수 없습니다. 관리자에게 문의하세요.
                        </div>
                    )}
                </div>

                {/* 문의 안내 */}
                <div style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "20px",
                    fontSize: "14px",
                    color: "#666"
                }}>
                    <p style={{margin: "0 0 10px 0"}}>
                        <strong>문의사항이 있으시면 관리자에게 연락해주세요.</strong>
                    </p>
                    <p style={{margin: 0}}>
                        이메일: admin@goldauction.com
                    </p>
                </div>

                {/* 버튼 */}
                <div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-primary"
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#6c757d",
                            borderColor: "#6c757d",
                            color: "#fff"
                        }}
                    >
                        <i className="bi bi-box-arrow-right"></i> 로그인 페이지로 이동
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MemberSuspended;

