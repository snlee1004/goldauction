import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function TransactionComplete() {
    const [transactionData, setTransactionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const imageboardSeq = parseInt(queryParams.get("seq"));
        
        if(imageboardSeq) {
            fetchTransactionInfo(imageboardSeq);
        } else {
            setError("경매 번호가 없습니다.");
            setLoading(false);
        }
    }, [location]);

    // 거래 성립 정보 조회
    const fetchTransactionInfo = async (imageboardSeq) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/bid/transactionInfo?imageboardSeq=${imageboardSeq}`);
            const data = await response.json();
            
            if(response.ok && data.rt === "OK") {
                setTransactionData(data);
            } else {
                setError(data.msg || "거래 성립 정보를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("거래 성립 정보 조회 오류:", err);
            setError("거래 성립 정보 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 이메일 포맷팅
    const formatEmail = (email1, email2) => {
        if(email1 && email2) {
            return `${email1}@${email2}`;
        }
        return "-";
    };

    // 전화번호 포맷팅
    const formatPhone = (tel1, tel2, tel3) => {
        if(tel1 && tel2 && tel3) {
            return `${tel1}-${tel2}-${tel3}`;
        }
        return "-";
    };

    if(loading) {
        return (
            <div className="container" style={{maxWidth: "900px", margin: "auto", padding: "20px", marginTop: "70px"}}>
                <div style={{textAlign: "center", padding: "40px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{marginTop: "20px"}}>거래 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if(error) {
        return (
            <div className="container" style={{maxWidth: "900px", margin: "auto", padding: "20px", marginTop: "70px"}}>
                <div style={{
                    padding: "20px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: "4px",
                    color: "#721c24",
                    textAlign: "center"
                }}>
                    <h4 style={{marginBottom: "10px"}}>오류 발생</h4>
                    <p>{error}</p>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                        style={{marginTop: "10px"}}
                    >
                        이전 페이지로
                    </button>
                </div>
            </div>
        );
    }

    if(!transactionData) {
        return null;
    }

    const { buyer, seller, auction } = transactionData;

    return (
        <div className="container" style={{maxWidth: "900px", margin: "auto", padding: "20px", marginTop: "70px"}}>
            {/* 헤더 */}
            <div style={{
                textAlign: "center",
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "8px"
            }}>
                <h2 style={{color: "#155724", marginBottom: "10px"}}>
                    <i className="bi bi-check-circle-fill" style={{marginRight: "10px"}}></i>
                    거래가 성립되었습니다
                </h2>
                <p style={{color: "#155724", margin: 0}}>
                    구매자와 판매자의 연락처 정보를 확인하세요
                </p>
            </div>

            {/* 경매 정보 */}
            <div style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{
                    marginBottom: "20px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "2px solid #D4AF37",
                    paddingBottom: "10px"
                }}>
                    <i className="bi bi-gem" style={{marginRight: "8px"}}></i>
                    경매 정보
                </h3>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <tbody>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%"}}>상품명</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{auction.imagename || "-"}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>최종 낙찰 금액</td>
                            <td style={{padding: "10px", fontSize: "14px", color: "#d9534f", fontWeight: "bold"}}>
                                ₩ {auction.finalPrice ? auction.finalPrice.toLocaleString() : "-"}
                            </td>
                        </tr>
                        <tr>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>거래 방식</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{auction.transactionMethod || "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 구매자 정보 */}
            <div style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{
                    marginBottom: "20px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "2px solid #337ab7",
                    paddingBottom: "10px"
                }}>
                    <i className="bi bi-person-check" style={{marginRight: "8px"}}></i>
                    구매자 정보
                </h3>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <tbody>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%"}}>이름</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{buyer.name || "-"}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>닉네임</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{buyer.nickname || buyer.id || "-"}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>이메일</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{formatEmail(buyer.email1, buyer.email2)}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>전화번호</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{formatPhone(buyer.tel1, buyer.tel2, buyer.tel3)}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>주소</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{buyer.addr || "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 판매자 정보 */}
            <div style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{
                    marginBottom: "20px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "2px solid #5cb85c",
                    paddingBottom: "10px"
                }}>
                    <i className="bi bi-person-badge" style={{marginRight: "8px"}}></i>
                    판매자 정보
                </h3>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <tbody>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%"}}>이름</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{seller.name || "-"}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>닉네임</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{seller.nickname || seller.id || "-"}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>이메일</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{formatEmail(seller.email1, seller.email2)}</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>전화번호</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{formatPhone(seller.tel1, seller.tel2, seller.tel3)}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "10px", fontWeight: "bold", fontSize: "14px"}}>주소</td>
                            <td style={{padding: "10px", fontSize: "14px"}}>{seller.addr || "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 안내 메시지 */}
            <div style={{
                padding: "15px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                marginBottom: "30px"
            }}>
                <p style={{margin: 0, fontSize: "14px", color: "#856404"}}>
                    <i className="bi bi-info-circle" style={{marginRight: "5px"}}></i>
                    구매자와 판매자는 위 연락처 정보를 통해 거래를 진행하시기 바랍니다.
                </p>
            </div>

            {/* 버튼 영역 */}
            <div style={{textAlign: "center"}}>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/imageboard/imageboardView?seq=${auction.seq}`)}
                    style={{
                        marginRight: "10px",
                        padding: "8px 20px"
                    }}
                >
                    <i className="bi bi-arrow-left" style={{marginRight: "5px"}}></i>
                    경매 상세보기
                </button>
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate("/imageboard/imageboardList")}
                    style={{
                        padding: "8px 20px"
                    }}
                >
                    <i className="bi bi-list" style={{marginRight: "5px"}}></i>
                    경매 목록
                </button>
            </div>
        </div>
    );
}

export default TransactionComplete;

