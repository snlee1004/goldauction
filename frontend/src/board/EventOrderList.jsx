import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EventOrderList() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const loginCheckedRef = useRef(false);
    
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderStatusFilter, setOrderStatusFilter] = useState("전체");

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        // 관리자 권한 체크
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
        
        if(boardSeq) {
            fetchProducts();
        }
    }, [boardSeq, navigate]);

    useEffect(() => {
        if(products.length > 0) {
            fetchOrders();
        }
    }, [products, orderStatusFilter]);

    // 상품 목록 조회
    const fetchProducts = async () => {
        try {
            const response = await fetch(`http://localhost:8080/event/product/list/all?boardSeq=${boardSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setProducts(data.list || []);
            } else {
                setError(data.msg || "상품 목록을 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 목록 조회 오류:", err);
            setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
        }
    };

    // 주문 목록 조회
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            // 모든 상품의 주문 조회
            const allOrders = [];
            for(const product of products) {
                try {
                    const response = await fetch(`http://localhost:8080/event/order/list/product?productSeq=${product.productSeq}`);
                    const data = await response.json();
                    if(data.rt === "OK" && data.list) {
                        // 각 주문에 회원 정보 추가
                        for(const order of data.list) {
                            let orderWithMember = {
                                ...order,
                                productName: product.productName
                            };
                            
                            // 회원 정보 조회
                            try {
                                const memberResponse = await fetch(`http://localhost:8080/member/getMember?id=${order.memberId}`);
                                const memberData = await memberResponse.json();
                                if(memberData.rt === "OK" && memberData.member) {
                                    const member = memberData.member;
                                    orderWithMember.memberName = member.name || "";
                                    orderWithMember.memberNickname = member.nickname || "";
                                    orderWithMember.memberEmail = `${member.email1 || ""}@${member.email2 || ""}`;
                                    orderWithMember.memberPhone = member.tel1 && member.tel2 && member.tel3 
                                        ? `${member.tel1}-${member.tel2}-${member.tel3}` 
                                        : (member.tel1 || "");
                                    orderWithMember.memberAddress = member.addr || "";
                                }
                            } catch(err) {
                                console.error(`회원 ${order.memberId} 정보 조회 오류:`, err);
                            }
                            
                            allOrders.push(orderWithMember);
                        }
                    }
                } catch(err) {
                    console.error(`상품 ${product.productSeq}의 주문 조회 오류:`, err);
                }
            }
            
            // 상태 필터링
            let filteredOrders = allOrders;
            if(orderStatusFilter !== "전체") {
                filteredOrders = allOrders.filter(order => order.orderStatus === orderStatusFilter);
            }
            
            // 최신순 정렬
            filteredOrders.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            
            setOrders(filteredOrders);
        } catch(err) {
            console.error("주문 목록 조회 오류:", err);
            setError("주문 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 주문 상태 업데이트
    const handleUpdateOrderStatus = async (orderSeq, newStatus) => {
        try {
            const response = await fetch("http://localhost:8080/event/order/status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderSeq: orderSeq,
                    orderStatus: newStatus
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "주문 상태가 업데이트되었습니다.");
                fetchOrders();
            } else {
                alert(data.msg || "주문 상태 업데이트에 실패했습니다.");
            }
        } catch(err) {
            console.error("주문 상태 업데이트 오류:", err);
            alert("주문 상태 업데이트 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{
            maxWidth: "1400px",
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
                주문 리스트
            </h2>

            <div style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ fontSize: "16px", color: "#666" }}>
                    총 {orders.length}건의 주문
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontSize: "14px", color: "#666" }}>상태 필터:</label>
                    <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    >
                        <option value="전체">전체</option>
                        <option value="주문완료">주문완료</option>
                        <option value="배송중">배송중</option>
                        <option value="배송완료">배송완료</option>
                        <option value="취소">취소</option>
                    </select>
                    <button
                        onClick={() => navigate(`/board/${boardSeq}/event/manage`)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            cursor: "pointer"
                        }}
                    >
                        상품관리/현황판
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div style={{
                    padding: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    textAlign: "center"
                }}>
                    {error}
                </div>
            ) : (
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <thead>
                        <tr style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6"
                        }}>
                            <th style={{ padding: "12px", textAlign: "center", width: "6%" }}>주문번호</th>
                            <th style={{ padding: "12px", textAlign: "left", width: "15%" }}>상품명</th>
                            <th style={{ padding: "12px", textAlign: "center", width: "8%" }}>회원ID</th>
                            <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>구매자명</th>
                            <th style={{ padding: "12px", textAlign: "center", width: "6%" }}>수량</th>
                            <th style={{ padding: "12px", textAlign: "right", width: "10%" }}>주문금액</th>
                            <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>주문상태</th>
                            <th style={{ padding: "12px", textAlign: "center", width: "12%" }}>주문일</th>
                            <th style={{ padding: "12px", textAlign: "center", width: "13%" }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#666"
                                }}>
                                    등록된 주문이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr
                                    key={order.orderSeq}
                                    style={{
                                        borderBottom: "1px solid #dee2e6"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#fff";
                                    }}
                                >
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        color: "#666"
                                    }}>
                                        #{order.orderSeq}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        {order.productName || "-"}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        color: "#666",
                                        fontSize: "13px"
                                    }}>
                                        {order.memberId}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        color: "#333",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        textDecoration: "underline"
                                    }}
                                    onClick={() => navigate(`/event/order/${order.orderSeq}`)}
                                    >
                                        {order.memberName || "-"}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        color: "#666"
                                    }}>
                                        {order.orderQuantity || 0}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "right",
                                        color: "#333",
                                        fontWeight: "bold"
                                    }}>
                                        ₩ {order.orderPrice?.toLocaleString() || 0}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center"
                                    }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            backgroundColor: order.orderStatus === "주문완료" ? "#d4edda" :
                                                           order.orderStatus === "배송중" ? "#cce5ff" :
                                                           order.orderStatus === "배송완료" ? "#d1ecf1" : "#f8d7da",
                                            color: order.orderStatus === "주문완료" ? "#155724" :
                                                  order.orderStatus === "배송중" ? "#004085" :
                                                  order.orderStatus === "배송완료" ? "#0c5460" : "#721c24"
                                        }}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        color: "#666",
                                        fontSize: "13px"
                                    }}>
                                        {new Date(order.createdDate).toLocaleString("ko-KR")}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "center"
                                    }}>
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => handleUpdateOrderStatus(order.orderSeq, e.target.value)}
                                            style={{
                                                padding: "4px 8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <option value="주문완료">주문완료</option>
                                            <option value="배송중">배송중</option>
                                            <option value="배송완료">배송완료</option>
                                            <option value="취소">취소</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default EventOrderList;

