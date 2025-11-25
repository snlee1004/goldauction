import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EventOrderDetail() {
    const navigate = useNavigate();
    const { orderSeq } = useParams();
    const [order, setOrder] = useState(null);
    const [product, setProduct] = useState(null);
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 관리자 권한 체크
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }

        if(orderSeq) {
            fetchOrderDetail();
        }
    }, [orderSeq, navigate]);

    // 주문 상세 조회
    const fetchOrderDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            // 주문 정보 조회
            const orderResponse = await fetch(`http://localhost:8080/event/order/detail?orderSeq=${orderSeq}`);
            const orderData = await orderResponse.json();
            
            if(orderData.rt === "OK") {
                setOrder(orderData.order);
                
                // 상품 정보 조회
                if(orderData.order.productSeq) {
                    const productResponse = await fetch(`http://localhost:8080/event/product/detail?productSeq=${orderData.order.productSeq}`);
                    const productData = await productResponse.json();
                    if(productData.rt === "OK") {
                        setProduct(productData.product);
                    }
                }
                
                // 회원 정보 조회
                if(orderData.order.memberId) {
                    const memberResponse = await fetch(`http://localhost:8080/member/getMember?id=${orderData.order.memberId}`);
                    const memberData = await memberResponse.json();
                    if(memberData.rt === "OK") {
                        setMember(memberData.member);
                    }
                }
            } else {
                setError(orderData.msg || "주문 정보를 찾을 수 없습니다.");
            }
        } catch(err) {
            console.error("주문 상세 조회 오류:", err);
            setError("주문 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 주문 상태 업데이트
    const handleUpdateStatus = async (newStatus) => {
        if(!window.confirm(`주문 상태를 "${newStatus}"로 변경하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/event/order/status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderSeq: parseInt(orderSeq),
                    orderStatus: newStatus
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "주문 상태가 업데이트되었습니다.");
                fetchOrderDetail(); // 주문 정보 새로고침
            } else {
                alert(data.msg || "주문 상태 업데이트에 실패했습니다.");
            }
        } catch(err) {
            console.error("주문 상태 업데이트 오류:", err);
            alert("주문 상태 업데이트 중 오류가 발생했습니다.");
        }
    };

    if(loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>로딩 중...</div>
            </div>
        );
    }

    if(error) {
        return (
            <div style={{ padding: "20px" }}>
                <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
                <button onClick={() => navigate(-1)}>뒤로 가기</button>
            </div>
        );
    }

    if(!order) {
        return (
            <div style={{ padding: "20px" }}>
                <div>주문 정보를 찾을 수 없습니다.</div>
                <button onClick={() => navigate(-1)}>뒤로 가기</button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "1000px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            <h2 style={{
                marginBottom: "30px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center"
            }}>
                주문 상세 정보
            </h2>

            {/* 주문 기본 정보 */}
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
                    주문 정보
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%" }}>주문번호</td>
                            <td style={{ padding: "10px", fontSize: "14px" }}>#{order.orderSeq}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>주문일시</td>
                            <td style={{ padding: "10px", fontSize: "14px" }}>
                                {new Date(order.createdDate).toLocaleString("ko-KR")}
                            </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>주문상태</td>
                            <td style={{ padding: "10px", fontSize: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{
                                        padding: "4px 12px",
                                        borderRadius: "4px",
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                        backgroundColor: order.orderStatus === "주문완료" ? "#d4edda" :
                                                       order.orderStatus === "배송중" ? "#cce5ff" :
                                                       order.orderStatus === "배송완료" ? "#d1ecf1" : "#f8d7da",
                                        color: order.orderStatus === "주문완료" ? "#155724" :
                                              order.orderStatus === "배송중" ? "#004085" :
                                              order.orderStatus === "배송완료" ? "#0c5460" : "#721c24"
                                    }}>
                                        {order.orderStatus}
                                    </span>
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        style={{
                                            padding: "6px 12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            fontSize: "13px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <option value="주문완료">주문완료</option>
                                        <option value="배송중">배송중</option>
                                        <option value="배송완료">배송완료</option>
                                        <option value="취소">취소</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 상품 정보 */}
            {product && (
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
                        상품 정보
                    </h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%" }}>상품명</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>
                                    <a 
                                        href={`/event/product/${product.productSeq}`}
                                        style={{ color: "#337ab7", textDecoration: "none" }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(`/event/product/${product.productSeq}`);
                                        }}
                                    >
                                        {product.productName}
                                    </a>
                                </td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>주문 수량</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>{order.orderQuantity}개</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>단가</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>
                                    ₩ {product.salePrice?.toLocaleString() || 0}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>주문 금액</td>
                                <td style={{ padding: "10px", fontSize: "16px", fontWeight: "bold", color: "#dc3545" }}>
                                    ₩ {order.orderPrice?.toLocaleString() || 0}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* 회원 정보 */}
            {member && (
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
                        회원 정보
                    </h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%" }}>회원ID</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>{member.id}</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>이름</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>{member.name || "-"}</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>닉네임</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>{member.nickname || "-"}</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>이메일</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>
                                    {member.email1 && member.email2 ? `${member.email1}@${member.email2}` : "-"}
                                </td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>전화번호</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>
                                    {member.tel1 && member.tel2 && member.tel3 
                                        ? `${member.tel1}-${member.tel2}-${member.tel3}` 
                                        : (member.tel1 || "-")}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>주소</td>
                                <td style={{ padding: "10px", fontSize: "14px" }}>{member.addr || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* 배송 정보 */}
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
                    배송 정보
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px", width: "30%" }}>배송 주소</td>
                            <td style={{ padding: "10px", fontSize: "14px" }}>
                                {order.deliveryAddress || (member?.addr || "-")}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "10px", fontWeight: "bold", fontSize: "14px" }}>연락처</td>
                            <td style={{ padding: "10px", fontSize: "14px" }}>
                                {order.deliveryPhone || (member?.tel1 && member?.tel2 && member?.tel3 
                                    ? `${member.tel1}-${member.tel2}-${member.tel3}` 
                                    : (member?.tel1 || "-"))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 버튼 영역 */}
            <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "30px"
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    목록으로
                </button>
            </div>
        </div>
    );
}

export default EventOrderDetail;

