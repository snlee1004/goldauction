import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function EventBoardManage() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const loginCheckedRef = useRef(false);
    
    const [board, setBoard] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("products"); // products, orders, posts, comments, settings
    const [searchKeyword, setSearchKeyword] = useState("");
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
            fetchBoardDetail();
            fetchProducts();
        }
    }, [boardSeq, navigate]);

    // 게시판 정보 조회
    const fetchBoardDetail = async () => {
        try {
            const response = await fetch(`http://localhost:8080/board/detail?boardSeq=${boardSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setBoard(data.board);
            } else {
                setError(data.msg || "게시판 정보를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("게시판 정보 조회 오류:", err);
            setError("게시판 정보를 불러오는 중 오류가 발생했습니다.");
        }
    };

    // 상품 목록 조회
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
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
        } finally {
            setLoading(false);
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
                        data.list.forEach(order => {
                            allOrders.push({
                                ...order,
                                productName: product.productName
                            });
                        });
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
            
            setOrders(filteredOrders);
        } catch(err) {
            console.error("주문 목록 조회 오류:", err);
            setError("주문 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 게시글 목록 조회
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/board/post/list?boardSeq=${boardSeq}&page=0&size=100`;
            if(searchKeyword) {
                url = `http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(searchKeyword)}&page=0&size=100`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            if(data.rt === "OK") {
                setPosts(data.list || []);
            } else {
                setError(data.msg || "게시글 목록을 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("게시글 목록 조회 오류:", err);
            setError("게시글 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 댓글 목록 조회
    const fetchComments = async () => {
        setLoading(true);
        setError(null);
        try {
            const postsResponse = await fetch(`http://localhost:8080/board/post/list/all?boardSeq=${boardSeq}`);
            const postsData = await postsResponse.json();
            
            if(postsData.rt === "OK") {
                const allComments = [];
                for(const post of postsData.list || []) {
                    try {
                        const commentsResponse = await fetch(`http://localhost:8080/board/comment/list?postSeq=${post.postSeq}`);
                        const commentsData = await commentsResponse.json();
                        if(commentsData.rt === "OK" && commentsData.list) {
                            commentsData.list.forEach(comment => {
                                allComments.push({
                                    ...comment,
                                    postTitle: post.postTitle,
                                    postSeq: post.postSeq
                                });
                            });
                        }
                    } catch(err) {
                        console.error(`게시글 ${post.postSeq}의 댓글 조회 오류:`, err);
                    }
                }
                setComments(allComments);
            }
        } catch(err) {
            console.error("댓글 목록 조회 오류:", err);
            setError("댓글 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 탭 변경 시 데이터 로드
    useEffect(() => {
        if(activeTab === "orders" && products.length > 0) {
            fetchOrders();
        } else if(activeTab === "posts" && boardSeq) {
            fetchPosts();
        } else if(activeTab === "comments" && boardSeq) {
            fetchComments();
        }
    }, [activeTab, boardSeq, products, orderStatusFilter]);

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

    // 게시글 삭제
    const handleDeletePost = async (postSeq) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/post/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ postSeq: postSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "게시글이 삭제되었습니다.");
                fetchPosts();
            } else {
                alert(data.msg || "게시글 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시글 삭제 오류:", err);
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentSeq) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/comment/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ commentSeq: commentSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "댓글이 삭제되었습니다.");
                fetchComments();
            } else {
                alert(data.msg || "댓글 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 삭제 오류:", err);
            alert("댓글 삭제 중 오류가 발생했습니다.");
        }
    };

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
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
                공구이벤트 게시판 관리
            </h2>

            {/* 게시판 정보 */}
            {board && (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <h3 style={{ marginBottom: "10px", fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                        {board.boardName}
                    </h3>
                    {board.boardDescription && (
                        <p style={{ color: "#666", marginBottom: "10px" }}>
                            {board.boardDescription}
                        </p>
                    )}
                    <div style={{ fontSize: "14px", color: "#999" }}>
                        타입: {board.boardType} | 활성화: {board.isActive === "Y" ? "예" : "아니오"}
                    </div>
                </div>
            )}

            {/* 탭 메뉴 */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                borderBottom: "2px solid #dee2e6",
                flexWrap: "wrap"
            }}>
                <button
                    onClick={() => setActiveTab("products")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "products" ? "#28a745" : "transparent",
                        color: activeTab === "products" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "products" ? "3px solid #28a745" : "3px solid transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "products" ? "bold" : "normal"
                    }}
                >
                    상품 관리
                </button>
                <button
                    onClick={() => setActiveTab("orders")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "orders" ? "#dc3545" : "transparent",
                        color: activeTab === "orders" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "orders" ? "3px solid #dc3545" : "3px solid transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "orders" ? "bold" : "normal"
                    }}
                >
                    주문 관리
                </button>
                <button
                    onClick={() => setActiveTab("posts")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "posts" ? "#337ab7" : "transparent",
                        color: activeTab === "posts" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "posts" ? "3px solid #337ab7" : "3px solid transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "posts" ? "bold" : "normal"
                    }}
                >
                    게시글 관리
                </button>
                <button
                    onClick={() => setActiveTab("comments")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "comments" ? "#ffc107" : "transparent",
                        color: activeTab === "comments" ? "#333" : "#333",
                        border: "none",
                        borderBottom: activeTab === "comments" ? "3px solid #ffc107" : "3px solid transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "comments" ? "bold" : "normal"
                    }}
                >
                    댓글 관리
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "settings" ? "#6c757d" : "transparent",
                        color: activeTab === "settings" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "settings" ? "3px solid #6c757d" : "3px solid transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "settings" ? "bold" : "normal"
                    }}
                >
                    게시판 설정
                </button>
            </div>

            {/* 상품 관리 탭 */}
            {activeTab === "products" && (
                <div>
                    <div style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                            상품 목록 ({products.length})
                        </h3>
                        <Link
                            to={`/board/${boardSeq}/products/manage`}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontSize: "14px"
                            }}
                        >
                            상품 관리 페이지로
                        </Link>
                    </div>
                    {products.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666"
                        }}>
                            등록된 상품이 없습니다.
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                            gap: "15px"
                        }}>
                            {products.slice(0, 6).map((product) => (
                                <div
                                    key={product.productSeq}
                                    style={{
                                        padding: "15px",
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #dee2e6"
                                    }}
                                >
                                    <div style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        marginBottom: "10px",
                                        color: "#333"
                                    }}>
                                        {product.productName}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                                        정가: ₩ {product.originalPrice?.toLocaleString() || 0}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#dc3545", fontWeight: "bold", marginBottom: "5px" }}>
                                        할인가: ₩ {product.salePrice?.toLocaleString() || 0}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "5px" }}>
                                        재고: {product.stockQuantity || 0} | 판매: {product.soldQuantity || 0}
                                    </div>
                                    <div style={{
                                        fontSize: "12px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        backgroundColor: product.eventStatus === "진행중" ? "#d4edda" :
                                                       product.eventStatus === "마감" ? "#fff3cd" : "#f8d7da",
                                        color: product.eventStatus === "진행중" ? "#155724" :
                                              product.eventStatus === "마감" ? "#856404" : "#721c24"
                                    }}>
                                        {product.eventStatus}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 주문 관리 탭 */}
            {activeTab === "orders" && (
                <div>
                    <div style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                            주문 목록 ({orders.length})
                        </h3>
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
                    </div>
                    {loading ? (
                        <div style={{textAlign: "center", padding: "20px"}}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden"
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: "#f8f9fa",
                                    borderBottom: "2px solid #dee2e6"
                                }}>
                                    <th style={{ padding: "12px", textAlign: "center", width: "8%" }}>주문번호</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "20%" }}>상품명</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%" }}>회원ID</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "8%" }}>수량</th>
                                    <th style={{ padding: "12px", textAlign: "right", width: "12%" }}>주문금액</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%" }}>주문상태</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%" }}>주문일</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "16%" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{
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
                                                color: "#666"
                                            }}>
                                                {order.memberId}
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
                                                {new Date(order.createdDate).toLocaleDateString()}
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
            )}

            {/* 게시글 관리 탭 */}
            {activeTab === "posts" && (
                <div>
                    <form onSubmit={handleSearch} style={{
                        marginBottom: "20px",
                        display: "flex",
                        gap: "10px"
                    }}>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="제목 또는 내용 검색"
                            style={{
                                flex: 1,
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px"
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            검색
                        </button>
                    </form>

                    {loading ? (
                        <div style={{textAlign: "center", padding: "20px"}}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden"
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: "#f8f9fa",
                                    borderBottom: "2px solid #dee2e6"
                                }}>
                                    <th style={{ padding: "12px", textAlign: "center", width: "5%" }}>번호</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "40%" }}>제목</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>작성자</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>작성일</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>조회수</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{
                                            padding: "40px",
                                            textAlign: "center",
                                            color: "#666"
                                        }}>
                                            등록된 게시글이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post, index) => (
                                        <tr
                                            key={post.postSeq}
                                            style={{
                                                borderBottom: "1px solid #dee2e6",
                                                backgroundColor: post.isNotice === "Y" ? "#fff3cd" : "#fff"
                                            }}
                                        >
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666"
                                            }}>
                                                {post.isNotice === "Y" ? (
                                                    <span style={{
                                                        padding: "2px 6px",
                                                        backgroundColor: "#dc3545",
                                                        color: "#fff",
                                                        borderRadius: "4px",
                                                        fontSize: "11px"
                                                    }}>
                                                        공지
                                                    </span>
                                                ) : (
                                                    posts.length - index
                                                )}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <Link
                                                    to={`/board/post/${post.postSeq}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "#333",
                                                        fontWeight: post.isNotice === "Y" ? "bold" : "normal"
                                                    }}
                                                >
                                                    {post.postTitle}
                                                </Link>
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666"
                                            }}>
                                                {post.memberId}
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "13px"
                                            }}>
                                                {new Date(post.createdDate).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666"
                                            }}>
                                                {post.viewCount || 0}
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center"
                                            }}>
                                                <button
                                                    onClick={() => handleDeletePost(post.postSeq)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        backgroundColor: "#dc3545",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* 댓글 관리 탭 */}
            {activeTab === "comments" && (
                <div>
                    {loading ? (
                        <div style={{textAlign: "center", padding: "20px"}}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden"
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: "#f8f9fa",
                                    borderBottom: "2px solid #dee2e6"
                                }}>
                                    <th style={{ padding: "12px", textAlign: "center", width: "5%" }}>번호</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "25%" }}>게시글</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "35%" }}>댓글 내용</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>작성자</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>작성일</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{
                                            padding: "40px",
                                            textAlign: "center",
                                            color: "#666"
                                        }}>
                                            등록된 댓글이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    comments.map((comment, index) => (
                                        <tr
                                            key={comment.commentSeq}
                                            style={{
                                                borderBottom: "1px solid #dee2e6"
                                            }}
                                        >
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666"
                                            }}>
                                                {comments.length - index}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <Link
                                                    to={`/board/post/${comment.postSeq}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "#337ab7"
                                                    }}
                                                >
                                                    {comment.postTitle}
                                                </Link>
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                color: "#333",
                                                fontSize: "14px"
                                            }}>
                                                {comment.commentContent.length > 50
                                                    ? comment.commentContent.substring(0, 50) + "..."
                                                    : comment.commentContent}
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666"
                                            }}>
                                                {comment.memberId}
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "13px"
                                            }}>
                                                {new Date(comment.createdDate).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: "12px",
                                                textAlign: "center"
                                            }}>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.commentSeq)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        backgroundColor: "#dc3545",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* 게시판 설정 탭 */}
            {activeTab === "settings" && board && (
                <div style={{
                    padding: "20px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <h3 style={{
                        marginBottom: "20px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        게시판 설정
                    </h3>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px"
                    }}>
                        <div>
                            <strong>게시판명:</strong> {board.boardName}
                        </div>
                        <div>
                            <strong>게시판 타입:</strong> {board.boardType}
                        </div>
                        <div>
                            <strong>활성화 여부:</strong> {board.isActive === "Y" ? "활성" : "비활성"}
                        </div>
                        <div>
                            <strong>공지사항 상단 노출 개수:</strong> {board.noticeDisplayCount || 5}
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <strong>게시판 설명:</strong>
                            <div style={{
                                marginTop: "5px",
                                padding: "10px",
                                backgroundColor: "#fff",
                                borderRadius: "4px",
                                color: "#666"
                            }}>
                                {board.boardDescription || "-"}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        marginTop: "20px",
                        display: "flex",
                        gap: "10px"
                    }}>
                        <Link
                            to={`/board/${boardSeq}/modify`}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontSize: "14px"
                            }}
                        >
                            게시판 수정
                        </Link>
                    </div>
                </div>
            )}

            {/* 뒤로가기 버튼 */}
            <div style={{
                marginTop: "30px",
                textAlign: "center"
            }}>
                <button
                    onClick={() => navigate("/manager/managerInfo")}
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
                    관리자 페이지로
                </button>
            </div>
        </div>
    );
}

export default EventBoardManage;

