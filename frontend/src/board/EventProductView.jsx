import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function EventProductView() {
    const navigate = useNavigate();
    const { productSeq } = useParams();
    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [managerIds, setManagerIds] = useState(new Set());
    const [postSeq, setPostSeq] = useState(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderQuantity, setOrderQuantity] = useState(1);

    useEffect(() => {
        if(productSeq) {
            fetchProductDetail();
            fetchProductImages();
        }
    }, [productSeq]);

    useEffect(() => {
        if(product && board) {
            findPostAndFetchComments();
        }
    }, [product, board]);

    // 상품 상세 조회
    const fetchProductDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/event/product/detail?productSeq=${productSeq}`);
            const data = await response.json();
            
            if(data.rt === "OK") {
                setProduct(data.product);
                
                // 게시판 정보 조회
                if(data.product.boardSeq) {
                    fetchBoardDetail(data.product.boardSeq);
                }
            } else {
                setError(data.msg || "상품을 찾을 수 없습니다.");
            }
        } catch(err) {
            console.error("상품 조회 오류:", err);
            setError("상품을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 게시판 정보 조회
    const fetchBoardDetail = async (boardSeq) => {
        try {
            const response = await fetch(`http://localhost:8080/board/detail?boardSeq=${boardSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setBoard(data.board);
            }
        } catch(err) {
            console.error("게시판 조회 오류:", err);
        }
    };

    // 상품 이미지 목록 조회
    const fetchProductImages = async () => {
        try {
            const response = await fetch(`http://localhost:8080/event/product/images?productSeq=${productSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setProductImages(data.list || []);
            }
        } catch(err) {
            console.error("이미지 조회 오류:", err);
        }
    };

    // 상품명으로 게시글 찾기 및 댓글 조회
    const findPostAndFetchComments = async () => {
        if(!product || !board) return;
        
        try {
            // 상품명으로 게시글 검색
            const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${board.boardSeq}&keyword=${encodeURIComponent(product.productName)}&page=0&size=1`);
            const searchData = await searchResponse.json();
            
            if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                const foundPostSeq = searchData.list[0].postSeq;
                setPostSeq(foundPostSeq);
                fetchComments(foundPostSeq);
            } else {
                setPostSeq(null);
                setComments([]);
            }
        } catch(err) {
            console.error("게시글 검색 오류:", err);
        }
    };

    // 댓글 목록 조회
    const fetchComments = async (targetPostSeq) => {
        if(!targetPostSeq) return;
        
        try {
            const response = await fetch(`http://localhost:8080/board/comment/list?postSeq=${targetPostSeq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setComments(data.list || []);
                
                // 댓글 작성자 중 관리자인지 확인
                const managerIdSet = new Set();
                for(const comment of data.list || []) {
                    try {
                        const managerResponse = await fetch(`http://localhost:8080/manager/getManager?managerId=${encodeURIComponent(comment.memberId)}`);
                        const managerData = await managerResponse.json();
                        if(managerData.rt === "OK" && managerData.manager) {
                            managerIdSet.add(comment.memberId);
                        }
                    } catch(err) {
                        // 관리자 확인 실패 시 무시
                    }
                }
                setManagerIds(managerIdSet);
            }
        } catch(err) {
            console.error("댓글 목록 조회 오류:", err);
        }
    };

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if(!commentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        // board와 product가 로드되지 않았으면 대기
        if(!board || !product) {
            alert("상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        // 게시글이 없으면 먼저 검색 시도
        let targetPostSeq = postSeq;
        
        // postSeq가 없으면 다시 한 번 검색 시도
        if(!targetPostSeq && board && product) {
            try {
                const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${board.boardSeq}&keyword=${encodeURIComponent(product.productName)}&page=0&size=1`);
                const searchData = await searchResponse.json();
                
                if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                    targetPostSeq = searchData.list[0].postSeq;
                    setPostSeq(targetPostSeq);
                }
            } catch(err) {
                console.error("게시글 재검색 오류:", err);
            }
        }
        
        // 여전히 게시글이 없으면 생성
        if(!targetPostSeq) {
            const memId = sessionStorage.getItem("memId");
            const managerId = sessionStorage.getItem("managerId");
            const memberIdToUse = managerId || memId;
            
            if(!memberIdToUse) {
                alert("로그인이 필요합니다.");
                navigate("/member/loginForm");
                return;
            }
            
            try {
                // 게시글 자동 생성
                const postResponse = await fetch("http://localhost:8080/board/post/write", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        boardSeq: board.boardSeq,
                        memberId: memberIdToUse,
                        postTitle: product.productName,
                        postContent: `상품: ${product.productName}`
                    })
                });
                
                const postData = await postResponse.json();
                if(postData.rt === "OK") {
                    targetPostSeq = postData.postSeq;
                    setPostSeq(targetPostSeq);
                    // 게시글 생성 후 댓글 목록도 새로고침
                    await fetchComments(targetPostSeq);
                } else {
                    alert(postData.msg || "게시글 생성에 실패했습니다.");
                    return;
                }
            } catch(err) {
                console.error("게시글 생성 오류:", err);
                alert("게시글 생성 중 오류가 발생했습니다.");
                return;
            }
        }

        // 관리자 ID 우선 확인
        const managerId = sessionStorage.getItem("managerId");
        const memId = sessionStorage.getItem("memId");
        
        let memberIdToUse = null;
        if(managerId) {
            memberIdToUse = managerId;
        } else if(memId) {
            memberIdToUse = memId;
        }
        
        if(!memberIdToUse) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }

        // targetPostSeq가 유효한지 확인
        if(!targetPostSeq) {
            alert("게시글 정보를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/comment/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postSeq: parseInt(targetPostSeq),
                    memberId: memberIdToUse,
                    commentContent: commentContent.trim()
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                setCommentContent("");
                // 댓글 목록 새로고침
                await fetchComments(targetPostSeq);
            } else {
                alert(data.msg || "댓글 작성에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 작성 오류:", err);
            alert("댓글 작성 중 오류가 발생했습니다.");
        }
    };

    // 댓글 수정 시작
    const handleEditStart = (comment) => {
        setEditingComment(comment.commentSeq);
        setEditCommentContent(comment.commentContent);
    };

    // 댓글 수정 취소
    const handleEditCancel = () => {
        setEditingComment(null);
        setEditCommentContent("");
    };

    // 댓글 수정 완료
    const handleEditSubmit = async (commentSeq) => {
        if(!editCommentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/comment/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    commentSeq: commentSeq,
                    commentContent: editCommentContent.trim()
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                setEditingComment(null);
                setEditCommentContent("");
                if(postSeq) {
                    fetchComments(postSeq);
                }
            } else {
                alert(data.msg || "댓글 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 수정 오류:", err);
            alert("댓글 수정 중 오류가 발생했습니다.");
        }
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentSeq) => {
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
                if(postSeq) {
                    fetchComments(postSeq);
                }
            } else {
                alert(data.msg || "댓글 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 삭제 오류:", err);
            alert("댓글 삭제 중 오류가 발생했습니다.");
        }
    };

    // 주문 폼 표시/숨김
    const handleShowOrderForm = () => {
        const memId = sessionStorage.getItem("memId");
        const managerId = sessionStorage.getItem("managerId");
        
        if(!memId && !managerId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        
        if(product.eventStatus !== "진행중") {
            alert("진행중인 상품만 구매할 수 있습니다.");
            return;
        }
        
        if(!product.stockQuantity || product.stockQuantity <= 0) {
            alert("재고가 없어 구매할 수 없습니다.");
            return;
        }
        
        setShowOrderForm(true);
    };

    // 주문 처리
    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        
        if(!orderQuantity || orderQuantity <= 0) {
            alert("주문 수량을 입력해주세요.");
            return;
        }
        
        if(orderQuantity > product.stockQuantity) {
            alert(`재고가 부족합니다. (현재 재고: ${product.stockQuantity}개)`);
            return;
        }
        
        const memId = sessionStorage.getItem("memId");
        const managerId = sessionStorage.getItem("managerId");
        const memberIdToUse = managerId || memId;
        
        if(!memberIdToUse) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        
        // 회원 정보 조회
        let deliveryAddress = "";
        let deliveryPhone = "";
        try {
            const memberResponse = await fetch(`http://localhost:8080/member/getMember?id=${memberIdToUse}`);
            const memberData = await memberResponse.json();
            if(memberData.rt === "OK" && memberData.member) {
                const member = memberData.member;
                // 주소와 전화번호 조합
                deliveryAddress = member.addr || "";
                if(member.tel1 && member.tel2 && member.tel3) {
                    deliveryPhone = `${member.tel1}-${member.tel2}-${member.tel3}`;
                } else if(member.tel1) {
                    deliveryPhone = member.tel1;
                }
            }
        } catch(err) {
            console.error("회원 정보 조회 오류:", err);
            // 회원 정보 조회 실패해도 주문은 진행
        }
        
        const totalPrice = product.salePrice * orderQuantity;
        
        if(!window.confirm(`총 ${totalPrice.toLocaleString()}원을 결제하시겠습니까?`)) {
            return;
        }
        
        try {
            const response = await fetch("http://localhost:8080/event/order/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productSeq: product.productSeq,
                    memberId: memberIdToUse,
                    orderQuantity: orderQuantity,
                    orderPrice: totalPrice,
                    orderStatus: "주문완료",
                    deliveryAddress: deliveryAddress,
                    deliveryPhone: deliveryPhone
                })
            });
            
            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "주문이 완료되었습니다.");
                setShowOrderForm(false);
                setOrderQuantity(1);
                // 상품 정보 새로고침 (재고 업데이트)
                await fetchProductDetail();
            } else {
                alert(data.msg || "주문에 실패했습니다.");
            }
        } catch(err) {
            console.error("주문 오류:", err);
            alert("주문 중 오류가 발생했습니다.");
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

    if(!product) {
        return (
            <div style={{ padding: "20px" }}>
                <div>상품 정보를 찾을 수 없습니다.</div>
                <button onClick={() => navigate(-1)}>뒤로 가기</button>
            </div>
        );
    }

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "0"}}>
            {/* 상품명과 상태 */}
            <div style={{marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div style={{fontSize: "20px", color: "#4169E1", fontWeight: "bold"}}>
                    상품명 : {product.productName}
                </div>
                <div style={{fontSize: "16px", color: "#666", display: "flex", alignItems: "center", gap: "5px"}}>
                    {product.eventStatus === "진행중" ? (
                        <>
                            <i className="bi bi-clock" style={{fontSize: "18px"}}></i>
                            <span style={{color: "#337ab7", fontWeight: "bold"}}>
                                진행중
                            </span>
                        </>
                    ) : product.eventStatus === "마감" ? (
                        <>
                            <i className="bi bi-x-circle" style={{fontSize: "18px", color: "#d9534f"}}></i>
                            <span style={{color: "#d9534f", fontWeight: "bold"}}>
                                마감
                            </span>
                        </>
                    ) : (
                        <>
                            <i className="bi bi-info-circle" style={{fontSize: "18px"}}></i>
                            <span>상태: {product.eventStatus || "알 수 없음"}</span>
                        </>
                    )}
                </div>
            </div>

            {/* 상품 이미지와 정보 테이블 */}
            <div style={{display: "flex", gap: "40px", marginBottom: "30px"}}>
                {/* 상품 이미지 영역 */}
                <div style={{display: "flex", gap: "10px", flex: "0 0 auto"}}>
                    {/* 대표 이미지 */}
                    <div>
                        {board && (
                            <div style={{fontSize: "14px", marginBottom: "10px", color: "#666"}}>
                                <Link to={`/board/${board.boardSeq}/posts`} style={{ color: "#007bff", textDecoration: "none" }}>
                                    {board.boardName}
                                </Link>
                            </div>
                        )}
                        {productImages.length > 0 ? (
                            <img 
                                width="280" 
                                height="280" 
                                alt="상품 이미지"
                                src={`http://localhost:8080/storage/${productImages[0].imagePath}`}
                                style={{border: "1px solid #ddd", borderRadius: "4px", width: "280px", height: "280px", objectFit: "cover"}}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                        ) : (
                            <div style={{
                                width: "280px",
                                height: "280px",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "4px",
                                color: "#999",
                                border: "1px solid #ddd"
                            }}>
                                <i className="bi bi-image" style={{ fontSize: "48px" }}></i>
                            </div>
                        )}
                    </div>
                    {/* 추가 이미지들 (세로 배치) */}
                    {productImages.length > 1 && (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                        }}>
                            {productImages.slice(1).map((img, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:8080/storage/${img.imagePath}`}
                                    alt={`${product.productName} ${index + 2}`}
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        // 클릭 시 대표 이미지로 변경
                                        const newImages = [img, ...productImages.filter((_, i) => i !== index + 1)];
                                        setProductImages(newImages);
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 상품 정보 테이블 */}
                <div style={{flex: "1"}}>
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <tbody>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>정가</td>
                                <td style={{padding: "10px", fontSize: "13px", textDecoration: "line-through", color: "#999"}}>
                                    ₩ {product.originalPrice?.toLocaleString() || 0}
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>할인가</td>
                                <td style={{padding: "10px", color: "#d9534f", fontWeight: "bold", fontSize: "13px"}}>
                                    ₩ {product.salePrice?.toLocaleString() || 0}
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>재고 수량</td>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>
                                    {product.stockQuantity || 0}개
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>판매 수량</td>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>
                                    {product.soldQuantity || 0}개
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>이벤트 상태</td>
                                <td style={{padding: "10px", fontSize: "13px"}}>
                                    <div style={{
                                        display: "inline-block",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        backgroundColor: product.eventStatus === "진행중" ? "#d4edda" :
                                                       product.eventStatus === "마감" ? "#fff3cd" : "#f8d7da",
                                        color: product.eventStatus === "진행중" ? "#155724" :
                                              product.eventStatus === "마감" ? "#856404" : "#721c24"
                                    }}>
                                        {product.eventStatus || "진행중"}
                                    </div>
                                </td>
                            </tr>
                            {product.endDate && (
                                <tr style={{borderBottom: "1px solid #eee"}}>
                                    <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>종료일</td>
                                    <td style={{padding: "10px", fontSize: "13px"}}>
                                        {new Date(product.endDate).toLocaleString("ko-KR")}
                                    </td>
                                </tr>
                            )}
                            {product.deliveryInfo && (
                                <tr>
                                    <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>배송 정보</td>
                                    <td style={{padding: "10px", fontSize: "13px", whiteSpace: "pre-wrap"}}>
                                        {product.deliveryInfo}
                                    </td>
                                </tr>
                            )}
                            {/* 구매 버튼 */}
                            {product.eventStatus === "진행중" && product.stockQuantity > 0 && (
                                <tr>
                                    <td colSpan="2" style={{padding: "10px"}}>
                                        {!showOrderForm ? (
                                            <button
                                                onClick={handleShowOrderForm}
                                                style={{
                                                    width: "100%",
                                                    padding: "10px",
                                                    backgroundColor: "#ff6b35",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "13px",
                                                    fontWeight: "bold",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                구매하기
                                            </button>
                                        ) : (
                                            <div style={{
                                                padding: "15px",
                                                backgroundColor: "#f8f9fa",
                                                borderRadius: "4px",
                                                border: "1px solid #dee2e6"
                                            }}>
                                                <form onSubmit={handleOrderSubmit}>
                                                    <h4 style={{
                                                        marginBottom: "15px",
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        color: "#333"
                                                    }}>
                                                        주문 정보
                                                    </h4>
                                                    
                                                    <div style={{ marginBottom: "15px" }}>
                                                        <label style={{
                                                            display: "block",
                                                            marginBottom: "5px",
                                                            fontSize: "13px",
                                                            fontWeight: "bold",
                                                            color: "#333"
                                                        }}>
                                                            주문 수량
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={product.stockQuantity}
                                                            value={orderQuantity}
                                                            onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px",
                                                                border: "1px solid #ddd",
                                                                borderRadius: "4px",
                                                                fontSize: "13px"
                                                            }}
                                                        />
                                                        <div style={{
                                                            fontSize: "11px",
                                                            color: "#666",
                                                            marginTop: "5px"
                                                        }}>
                                                            최대 {product.stockQuantity}개까지 주문 가능
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{
                                                        padding: "12px",
                                                        backgroundColor: "#fff",
                                                        borderRadius: "4px",
                                                        marginBottom: "15px",
                                                        border: "1px solid #dee2e6"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            marginBottom: "5px",
                                                            fontSize: "13px"
                                                        }}>
                                                            <span>상품 가격:</span>
                                                            <span>
                                                                ₩ {product.salePrice?.toLocaleString() || 0}
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            marginBottom: "5px",
                                                            fontSize: "13px"
                                                        }}>
                                                            <span>주문 수량:</span>
                                                            <span>
                                                                {orderQuantity}개
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            fontSize: "14px",
                                                            fontWeight: "bold",
                                                            color: "#dc3545",
                                                            paddingTop: "8px",
                                                            borderTop: "1px solid #dee2e6"
                                                        }}>
                                                            <span>총 결제 금액:</span>
                                                            <span>
                                                                ₩ {(product.salePrice * orderQuantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        justifyContent: "flex-end"
                                                    }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowOrderForm(false);
                                                                setOrderQuantity(1);
                                                            }}
                                                            style={{
                                                                padding: "8px 16px",
                                                                backgroundColor: "#6c757d",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "13px",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            style={{
                                                                padding: "8px 16px",
                                                                backgroundColor: "#ff6b35",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "13px",
                                                                fontWeight: "bold",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            주문하기
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 상품 설명 */}
            <div style={{
                padding: "15px",
                backgroundColor: "transparent",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginBottom: "30px",
                textAlign: "center"
            }}>
                <div style={{fontSize: "18px"}}>
                    {product.productDescription || "상세 내용이 없습니다."}
                </div>
            </div>

            {/* 댓글 영역 */}
            <div style={{
                marginTop: "40px",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
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
                    댓글 ({comments.length})
                </h3>

                {/* 댓글 작성 폼 (로그인한 경우만) */}
                {(sessionStorage.getItem("memId") || sessionStorage.getItem("managerId")) && (
                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: "30px" }}>
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="댓글을 입력하세요"
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                resize: "vertical",
                                marginBottom: "10px"
                            }}
                        />
                        <div style={{ textAlign: "right" }}>
                            <button
                                type="submit"
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#337ab7",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    cursor: "pointer"
                                }}
                            >
                                댓글 작성
                            </button>
                        </div>
                    </form>
                )}

                {/* 댓글 목록 */}
                {comments.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#999"
                    }}>
                        등록된 댓글이 없습니다.
                    </div>
                ) : (
                    <div>
                        {comments.map((comment) => {
                            const memId = sessionStorage.getItem("memId");
                            const managerId = sessionStorage.getItem("managerId");
                            const isCommentOwner = (memId === comment.memberId) || (managerId === comment.memberId);
                            const isEditing = editingComment === comment.commentSeq;
                            const isManagerComment = managerIds.has(comment.memberId);
                            
                            return (
                                <div
                                    key={comment.commentSeq}
                                    style={{
                                        padding: "15px",
                                        marginBottom: "15px",
                                        backgroundColor: isManagerComment ? "#e7f3ff" : "#f8f9fa",
                                        borderRadius: "4px",
                                        border: isManagerComment ? "2px solid #337ab7" : "1px solid #dee2e6"
                                    }}
                                >
                                    {isEditing ? (
                                        <div>
                                            <textarea
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                rows={3}
                                                style={{
                                                    width: "100%",
                                                    padding: "8px",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "4px",
                                                    fontSize: "14px",
                                                    marginBottom: "10px"
                                                }}
                                            />
                                            <div style={{ textAlign: "right" }}>
                                                <button
                                                    onClick={() => handleEditSubmit(comment.commentSeq)}
                                                    style={{
                                                        padding: "6px 12px",
                                                        backgroundColor: "#28a745",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        fontSize: "13px",
                                                        cursor: "pointer",
                                                        marginRight: "5px"
                                                    }}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={handleEditCancel}
                                                    style={{
                                                        padding: "6px 12px",
                                                        backgroundColor: "#6c757d",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        fontSize: "13px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "10px"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                                                        {isManagerComment ? "운영자" : comment.memberId}
                                                    </span>
                                                    <span style={{ color: "#999", fontSize: "12px" }}>
                                                        {comment.createdDate ? new Date(comment.createdDate).toLocaleString("ko-KR") : ""}
                                                    </span>
                                                </div>
                                                {isCommentOwner && (
                                                    <div style={{ display: "flex", gap: "5px" }}>
                                                        <button
                                                            onClick={() => handleEditStart(comment)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#337ab7",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleCommentDelete(comment.commentSeq)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#dc3545",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{
                                                fontSize: "14px",
                                                lineHeight: "1.6",
                                                color: "#333",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}>
                                                {comment.commentContent}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 목록 버튼 */}
            <div style={{textAlign: "center", marginTop: "30px"}}>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-list"></i> 목록
                </button>
            </div>
        </div>
    );
}

export default EventProductView;

