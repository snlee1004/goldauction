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
    const [showCreateForm, setShowCreateForm] = useState(false); // 상품 등록 폼 표시 여부
    const [editingProduct, setEditingProduct] = useState(null); // 수정 중인 상품
    const [formData, setFormData] = useState({ // 상품 등록 폼 데이터
        boardSeq: boardSeq ? parseInt(boardSeq) : null,
        productName: "",
        productDescription: "",
        originalPrice: 0,
        salePrice: 0,
        stockQuantity: 0,
        endDate: "",
        endTime: "",
        deliveryInfo: "",
        eventStatus: "진행중"
    });
    const [imageFiles, setImageFiles] = useState([]); // 이미지 파일 배열
    const [imagePreviews, setImagePreviews] = useState([]); // 이미지 미리보기 배열
    const imageInputRef = useRef(null); // 이미지 입력 ref

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
                const productsList = data.list || [];
                
                // 각 상품의 대표 이미지 가져오기
                const productsWithImages = await Promise.all(
                    productsList.map(async (product) => {
                        try {
                            const imageResponse = await fetch(`http://localhost:8080/event/product/image/main?productSeq=${product.productSeq}`);
                            const imageData = await imageResponse.json();
                            if(imageData.rt === "OK" && imageData.imagePath) {
                                return {
                                    ...product,
                                    mainImagePath: imageData.imagePath
                                };
                            }
                        } catch(err) {
                            console.error(`상품 ${product.productSeq} 이미지 조회 오류:`, err);
                        }
                        return product;
                    })
                );
                
                setProducts(productsWithImages);
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

    // 게시글 목록 조회 (공구이벤트 게시판의 경우 상품도 함께 표시)
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            // 게시글 목록 조회
            let url = `http://localhost:8080/board/post/list?boardSeq=${boardSeq}&page=0&size=100`;
            if(searchKeyword) {
                url = `http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(searchKeyword)}&page=0&size=100`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            let allPosts = [];
            if(data.rt === "OK") {
                allPosts = data.list || [];
            }
            
            // 공구이벤트 게시판의 경우 상품도 게시글처럼 표시
            if(board && board.boardType === "공구이벤트") {
                try {
                    const productResponse = await fetch(`http://localhost:8080/event/product/list/all?boardSeq=${boardSeq}`);
                    const productData = await productResponse.json();
                    if(productData.rt === "OK" && productData.list) {
                        // 상품을 게시글 형식으로 변환
                        const productPosts = productData.list.map(product => ({
                            postSeq: `product_${product.productSeq}`, // 상품은 특별한 ID 사용
                            postTitle: `[상품] ${product.productName}`,
                            postContent: product.productDescription || "",
                            memberId: "시스템",
                            createdDate: product.createdDate,
                            viewCount: 0,
                            isNotice: "N",
                            isProduct: true, // 상품임을 표시
                            productSeq: product.productSeq,
                            product: product
                        }));
                        allPosts = [...productPosts, ...allPosts]; // 상품을 앞에 표시
                    }
                } catch(err) {
                    console.error("상품 목록 조회 오류:", err);
                }
            }
            
            setPosts(allPosts);
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

    // 이미지 파일 선택 처리 (최대 8장)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if(files.length > 8) {
            alert("최대 8장까지만 업로드 가능합니다.");
            return;
        }
        
        const newFiles = files.slice(0, 8);
        setImageFiles(newFiles);
        
        // 미리보기 생성
        const previews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    // 이미지 삭제
    const handleRemoveImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
        
        // 파일 입력 초기화 후 다시 설정
        if(imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    // 상품 수정 시작
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        
        // 종료일시 분리
        let endDate = "";
        let endTime = "";
        if(product.endDate) {
            const date = new Date(product.endDate);
            endDate = date.toISOString().split('T')[0];
            endTime = date.toTimeString().split(' ')[0].substring(0, 5);
        }
        
        setFormData({
            boardSeq: product.boardSeq,
            productName: product.productName,
            productDescription: product.productDescription || "",
            originalPrice: product.originalPrice || 0,
            salePrice: product.salePrice || 0,
            stockQuantity: product.stockQuantity || 0,
            endDate: endDate,
            endTime: endTime,
            deliveryInfo: product.deliveryInfo || "",
            eventStatus: product.eventStatus || "진행중"
        });
        setImageFiles([]);
        setImagePreviews([]);
        if(imageInputRef.current) {
            imageInputRef.current.value = "";
        }
        setShowCreateForm(true);
    };

    // 상품 등록 폼 초기화
    const resetProductForm = () => {
        setFormData({
            boardSeq: boardSeq ? parseInt(boardSeq) : null,
            productName: "",
            productDescription: "",
            originalPrice: 0,
            salePrice: 0,
            stockQuantity: 0,
            endDate: "",
            endTime: "",
            deliveryInfo: "",
            eventStatus: "진행중"
        });
        setEditingProduct(null);
        setImageFiles([]);
        setImagePreviews([]);
        if(imageInputRef.current) {
            imageInputRef.current.value = "";
        }
        setShowCreateForm(false);
    };

    // 상품 등록
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        
        if(!formData.productName.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }
        if(formData.salePrice <= 0) {
            alert("할인가를 입력해주세요.");
            return;
        }

        try {
            // 종료일시 결합
            let endDateValue = null;
            if(formData.endDate && formData.endTime) {
                endDateValue = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
            } else if(formData.endDate) {
                endDateValue = new Date(`${formData.endDate}T23:59:59`).toISOString();
            }

            // FormData 생성 (이미지 파일 포함)
            const formDataToSend = new FormData();
            formDataToSend.append("boardSeq", formData.boardSeq);
            formDataToSend.append("productName", formData.productName);
            formDataToSend.append("productDescription", formData.productDescription || "");
            formDataToSend.append("originalPrice", formData.originalPrice);
            formDataToSend.append("salePrice", formData.salePrice);
            formDataToSend.append("stockQuantity", formData.stockQuantity);
            formDataToSend.append("deliveryInfo", formData.deliveryInfo || "");
            formDataToSend.append("eventStatus", formData.eventStatus);
            if(endDateValue) {
                formDataToSend.append("endDate", endDateValue);
            }

            // 이미지 파일들 추가
            imageFiles.forEach((file) => {
                formDataToSend.append("images", file);
            });

            const response = await fetch("http://localhost:8080/event/product/create", {
                method: "POST",
                body: formDataToSend
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품이 등록되었습니다.");
                resetProductForm();
                fetchProducts(); // 상품 목록 새로고침
            } else {
                alert(data.msg || "상품 등록에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 등록 오류:", err);
            alert("상품 등록 중 오류가 발생했습니다.");
        }
    };

    // 상품 수정
    const handleModifyProduct = async (e) => {
        e.preventDefault();
        
        if(!formData.productName.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }
        if(formData.salePrice <= 0) {
            alert("할인가를 입력해주세요.");
            return;
        }

        try {
            // 종료일시 결합
            let endDateValue = null;
            if(formData.endDate && formData.endTime) {
                endDateValue = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
            } else if(formData.endDate) {
                endDateValue = new Date(`${formData.endDate}T23:59:59`).toISOString();
            }

            const requestData = {
                productSeq: editingProduct.productSeq,
                boardSeq: formData.boardSeq,
                productName: formData.productName,
                productDescription: formData.productDescription || "",
                originalPrice: formData.originalPrice,
                salePrice: formData.salePrice,
                stockQuantity: formData.stockQuantity,
                deliveryInfo: formData.deliveryInfo || "",
                eventStatus: formData.eventStatus,
                endDate: endDateValue
            };

            const response = await fetch("http://localhost:8080/event/product/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품이 수정되었습니다.");
                resetProductForm();
                fetchProducts(); // 상품 목록 새로고침
            } else {
                alert(data.msg || "상품 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 수정 오류:", err);
            alert("상품 수정 중 오류가 발생했습니다.");
        }
    };

    // 상품 삭제
    const handleDeleteProduct = async (productSeq) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/event/product/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productSeq: productSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품이 삭제되었습니다.");
                fetchProducts(); // 상품 목록 새로고침
            } else {
                alert(data.msg || "상품 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 삭제 오류:", err);
            alert("상품 삭제 중 오류가 발생했습니다.");
        }
    };

    // 게시판 삭제 (비활성화 또는 완전 삭제)
    const handleDeleteBoard = async () => {
        const deleteType = window.confirm(
            "게시판 삭제 방식을 선택하세요:\n\n" +
            "확인: 완전 삭제 (DB에서 영구 삭제, 관련 게시글/댓글/상품 모두 삭제)\n" +
            "취소: 비활성화 (목록에서만 숨김, 데이터는 유지)"
        );
        
        if(deleteType === null) {
            return; // 사용자가 취소한 경우
        }

        try {
            let url, body, confirmMsg;
            
            if(deleteType) {
                // 완전 삭제
                confirmMsg = "⚠️ 경고: 이 작업은 되돌릴 수 없습니다!\n\n" +
                           "게시판과 관련된 모든 데이터가 영구적으로 삭제됩니다:\n" +
                           "- 모든 게시글\n" +
                           "- 모든 댓글\n" +
                           "- 모든 상품 및 주문 정보\n" +
                           "- 모든 첨부파일\n\n" +
                           "정말로 완전 삭제하시겠습니까?";
                
                if(!window.confirm(confirmMsg)) {
                    return;
                }
                
                url = "http://localhost:8080/board/delete-permanent";
                body = JSON.stringify({ boardSeq: parseInt(boardSeq) });
            } else {
                // 비활성화
                if(!window.confirm("게시판을 비활성화하시겠습니까?\n비활성화된 게시판은 목록에서 보이지 않지만 데이터는 유지됩니다.")) {
                    return;
                }
                
                url = "http://localhost:8080/board/delete";
                body = JSON.stringify({ boardSeq: parseInt(boardSeq) });
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            });

            const data = await response.json();

            if(data.rt === "OK") {
                alert(data.msg || (deleteType ? "게시판이 완전히 삭제되었습니다." : "게시판이 비활성화되었습니다."));
                navigate("/manager/managerInfo");
            } else {
                alert(data.msg || "게시판 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시판 삭제 오류:", err);
            alert("게시판 삭제 중 오류가 발생했습니다.");
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
                        <div style={{
                            display: "flex",
                            gap: "10px"
                        }}>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: showCreateForm ? "#6c757d" : "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    cursor: "pointer"
                                }}
                            >
                                {showCreateForm ? "취소" : "상품 등록"}
                            </button>
                            <button
                                onClick={() => fetchProducts()}
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
                                업데이트
                            </button>
                        </div>
                    </div>

                    {/* 상품 등록 폼 */}
                    {showCreateForm && (
                        <div style={{
                            marginBottom: "30px",
                            padding: "20px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                            border: "1px solid #dee2e6"
                        }}>
                            <h3 style={{
                                marginBottom: "20px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                {editingProduct ? "상품 수정" : "상품 등록"}
                            </h3>
                            <form onSubmit={editingProduct ? handleModifyProduct : handleCreateProduct}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            상품명 <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.productName}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                productName: e.target.value
                                            }))}
                                            required
                                            maxLength={200}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                            placeholder="상품명을 입력하세요"
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            이벤트 상태
                                        </label>
                                        <select
                                            value={formData.eventStatus}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                eventStatus: e.target.value
                                            }))}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                        >
                                            <option value="진행중">진행중</option>
                                            <option value="마감">마감</option>
                                            <option value="종료">종료</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{
                                        display: "block",
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                        color: "#333"
                                    }}>
                                        상품 설명
                                    </label>
                                    <textarea
                                        value={formData.productDescription}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            productDescription: e.target.value
                                        }))}
                                        rows={5}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            resize: "vertical"
                                        }}
                                        placeholder="상품 설명을 입력하세요"
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            정가
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                originalPrice: parseInt(e.target.value) || 0
                                            }))}
                                            min="0"
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            할인가 <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.salePrice}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                salePrice: parseInt(e.target.value) || 0
                                            }))}
                                            required
                                            min="1"
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            재고 수량
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                stockQuantity: parseInt(e.target.value) || 0
                                            }))}
                                            min="0"
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            종료일
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                endDate: e.target.value
                                            }))}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}>
                                            종료시간
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                endTime: e.target.value
                                            }))}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                fontSize: "14px"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{
                                        display: "block",
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                        color: "#333"
                                    }}>
                                        배송 정보
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.deliveryInfo}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            deliveryInfo: e.target.value
                                        }))}
                                        maxLength={500}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            fontSize: "14px"
                                        }}
                                        placeholder="배송 정보를 입력하세요"
                                    />
                                </div>

                                {/* 상품 이미지 업로드 */}
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{
                                        display: "block",
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                        color: "#333"
                                    }}>
                                        상품 이미지
                                    </label>
                                    <div 
                                        style={{
                                            border: "2px dashed #ccc",
                                            borderRadius: "8px",
                                            padding: "20px",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            backgroundColor: "#f9f9f9"
                                        }}
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        <i className="bi bi-camera" style={{fontSize: "32px", color: "#999", display: "block", marginBottom: "8px"}}></i>
                                        <div style={{color: "#666", marginBottom: "8px", fontSize: "14px"}}>사진 추가 (최대 8장)</div>
                                        <div style={{fontSize: "11px", color: "#666"}}>
                                            * 첫 번째 사진이 대표 이미지로 설정되며, 순서대로 저장됩니다
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={imageInputRef} 
                                            onChange={handleImageChange}
                                            multiple
                                            accept="image/*"
                                            style={{display: "none"}}
                                        />
                                    </div>
                                    {imagePreviews.length > 0 && (
                                        <div style={{display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px"}}>
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} style={{position: "relative", width: "100px", height: "100px"}}>
                                                    <img 
                                                        src={preview} 
                                                        alt={`미리보기 ${index + 1}`}
                                                        style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px"}}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "-5px",
                                                            right: "-5px",
                                                            background: "red",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "50%",
                                                            width: "20px",
                                                            height: "20px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                    justifyContent: "flex-end"
                                }}>
                                    <button
                                        type="submit"
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                            border: "none",
                                borderRadius: "4px",
                                            cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                                        {editingProduct ? "수정" : "등록"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetProductForm}
                                        style={{
                                            padding: "8px 16px",
                                            backgroundColor: "#6c757d",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "14px"
                                        }}
                                    >
                                        취소
                                    </button>
                    </div>
                            </form>
                        </div>
                    )}

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
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "15px"
                        }}>
                            {products.map((product) => (
                                <div
                                    key={product.productSeq}
                                    style={{
                                        padding: "15px",
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #dee2e6",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    {/* 상품 정보와 이미지 영역 (클릭 가능) */}
                                    <div 
                                        style={{
                                            display: "flex",
                                            gap: "15px",
                                            marginBottom: "10px",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => navigate(`/event/product/${product.productSeq}`)}
                                    >
                                        {/* 왼쪽: 상품 정보 */}
                                        <div style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "5px"
                                        }}>
                                            {/* 상품명 */}
                                    <div style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        color: "#333"
                                    }}>
                                        {product.productName}
                                    </div>
                                            {/* 정가 */}
                                            <div style={{ fontSize: "14px", color: "#666" }}>
                                        정가: ₩ {product.originalPrice?.toLocaleString() || 0}
                                    </div>
                                            {/* 할인가 */}
                                            <div style={{ fontSize: "14px", color: "#dc3545", fontWeight: "bold" }}>
                                        할인가: ₩ {product.salePrice?.toLocaleString() || 0}
                                    </div>
                                            {/* 재고 */}
                                            <div style={{ fontSize: "13px", color: "#666" }}>
                                        재고: {product.stockQuantity || 0} | 판매: {product.soldQuantity || 0}
                                    </div>
                                        </div>
                                        {/* 오른쪽: 이미지 영역 */}
                                        {product.mainImagePath ? (
                                    <div style={{
                                                width: "80px",
                                                height: "80px",
                                        borderRadius: "4px",
                                                overflow: "hidden",
                                                backgroundColor: "#f0f0f0",
                                                flexShrink: 0
                                            }}>
                                                <img
                                                    src={`http://localhost:8080/storage/${product.mainImagePath}`}
                                                    alt={product.productName}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover"
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999;"><i class="bi bi-image" style="font-size: 24px;"></i></div>';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "4px",
                                                backgroundColor: "#f0f0f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#999",
                                                flexShrink: 0
                                            }}>
                                                <i className="bi bi-image" style={{ fontSize: "24px" }}></i>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginTop: "auto",
                                        gap: "5px"
                                    }}>
                                        <div style={{
                                            fontSize: "10px",
                                            padding: "2px 4px",
                                            borderRadius: "3px",
                                        display: "inline-block",
                                        backgroundColor: product.eventStatus === "진행중" ? "#d4edda" :
                                                       product.eventStatus === "마감" ? "#fff3cd" : "#f8d7da",
                                        color: product.eventStatus === "진행중" ? "#155724" :
                                                  product.eventStatus === "마감" ? "#856404" : "#721c24",
                                            lineHeight: "1.2",
                                            whiteSpace: "nowrap"
                                    }}>
                                        {product.eventStatus}
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            gap: "3px"
                                        }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditProduct(product);
                                                }}
                                                style={{
                                                    padding: "2px 5px",
                                                    backgroundColor: "#337ab7",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "3px",
                                                    cursor: "pointer",
                                                    fontSize: "9px",
                                                    lineHeight: "1.2",
                                                    whiteSpace: "nowrap"
                                                }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProduct(product.productSeq);
                                                }}
                                                style={{
                                                    padding: "2px 5px",
                                                    backgroundColor: "#dc3545",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "3px",
                                                    cursor: "pointer",
                                                    fontSize: "9px",
                                                    lineHeight: "1.2",
                                                    whiteSpace: "nowrap"
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
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
                    
                    {/* 활성화 여부 수정 */}
                    <div style={{
                        marginBottom: "30px",
                        padding: "20px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6"
                    }}>
                        <h4 style={{
                            marginBottom: "15px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#333"
                        }}>
                            활성화 여부 설정
                        </h4>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            marginBottom: "15px"
                        }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer"
                            }}>
                                <input
                                    type="checkbox"
                                    checked={board.isActive === "Y"}
                                    onChange={async (e) => {
                                        const newIsActive = e.target.checked ? "Y" : "N";
                                        
                                        try {
                                            const response = await fetch("http://localhost:8080/board/modify", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({
                                                    boardSeq: parseInt(boardSeq),
                                                    boardName: board.boardName,
                                                    boardDescription: board.boardDescription,
                                                    boardType: board.boardType,
                                                    boardCategory: board.boardCategory,
                                                    isActive: newIsActive,
                                                    displayOrder: board.displayOrder || 0,
                                                    noticeDisplayCount: board.noticeDisplayCount || 5
                                                })
                                            });
                                            
                                            const data = await response.json();
                                            
                                            if(data.rt === "OK") {
                                                // 게시판 정보 새로고침
                                                await fetchBoardDetail();
                                                alert("활성화 여부가 변경되었습니다.");
                                            } else {
                                                alert(data.msg || "활성화 여부 변경에 실패했습니다.");
                                                // 실패 시 체크박스 원래 상태로 복구
                                                e.target.checked = !e.target.checked;
                                            }
                                        } catch(err) {
                                            console.error("활성화 여부 변경 오류:", err);
                                            alert("활성화 여부 변경 중 오류가 발생했습니다.");
                                            // 실패 시 체크박스 원래 상태로 복구
                                            e.target.checked = !e.target.checked;
                                        }
                                    }}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer"
                                    }}
                                />
                                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                                    게시판 활성화
                                </span>
                            </label>
                            <span style={{
                                fontSize: "14px",
                                color: board.isActive === "Y" ? "#28a745" : "#dc3545",
                                fontWeight: "bold"
                            }}>
                                {board.isActive === "Y" ? "(활성)" : "(비활성)"}
                            </span>
                        </div>
                        <div style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "10px"
                        }}>
                            활성화된 게시판만 사용자에게 표시됩니다.
                        </div>
                    </div>

                    {/* 게시판 정보 표시 */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px",
                        marginBottom: "20px"
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
                        <button
                            onClick={handleDeleteBoard}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            게시판 삭제
                        </button>
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

