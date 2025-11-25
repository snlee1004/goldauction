import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function PostList() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const [board, setBoard] = useState(null);
    const [postList, setPostList] = useState([]);
    const [noticeList, setNoticeList] = useState([]);
    const [productList, setProductList] = useState([]); // 이벤트 게시판 상품 목록
    const [selectedProduct, setSelectedProduct] = useState(null); // 댓글 작성할 상품 선택
    const [productComments, setProductComments] = useState({}); // 상품별 댓글 목록 {productSeq: [comments]}
    const [commentContent, setCommentContent] = useState(""); // 댓글 작성 내용
    const [questionComments, setQuestionComments] = useState([]); // 질문게시판 댓글 목록
    const [questionPostSeq, setQuestionPostSeq] = useState(null); // 질문게시판 전용 게시글 번호
    const [replyingTo, setReplyingTo] = useState(null); // 답변 작성 중인 댓글 번호
    const [replyContent, setReplyContent] = useState(""); // 답변 내용
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advancedSearch, setAdvancedSearch] = useState({
        keyword: "",
        memberId: "",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        if(boardSeq) {
            console.log("PostList 컴포넌트 마운트 - boardSeq:", boardSeq);
            fetchBoardDetail();
            fetchNoticeList();
        } else {
            console.error("boardSeq가 없습니다!");
            setError("게시판 번호가 없습니다.");
        }
    }, [boardSeq]);

    useEffect(() => {
        if(boardSeq && board) {
            if(board.boardType === "질문게시판") {
                // 질문게시판의 경우 댓글만 조회
                fetchQuestionComments();
            } else if(board.boardType !== "공구이벤트") {
                fetchPostList();
            }
        }
    }, [boardSeq, page, isSearching, searchKeyword, showAdvancedSearch, advancedSearch, board]);

    // 게시판 상세 정보 조회
    const fetchBoardDetail = async () => {
        try {
            console.log("게시판 상세 정보 조회 - boardSeq:", boardSeq);
            const response = await fetch(`http://localhost:8080/board/detail?boardSeq=${boardSeq}`);
            console.log("게시판 상세 정보 API 응답 상태:", response.status);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("게시판 상세 정보 API 응답 데이터:", data);
            
            if(data.rt === "OK") {
                const board = data.board;
                // 게시판이 비활성화되어 있는지 확인
                if(board.isActive === "N") {
                    setError("이 게시판은 현재 비활성화되어 있습니다.");
                    setBoard(null);
                } else {
                    setBoard(board);
                    // 이벤트 게시판인 경우 상품 목록 조회
                    if(board.boardType === "공구이벤트") {
                        fetchProductList();
                    }
                }
            } else {
                const errorMsg = data.msg || data.message || "게시판을 찾을 수 없습니다.";
                setError(errorMsg);
                console.error("게시판 상세 정보 조회 실패:", errorMsg);
            }
        } catch(err) {
            console.error("게시판 정보 조회 오류:", err);
            setError("게시판 정보를 불러오는 중 오류가 발생했습니다: " + err.message);
        }
    };

    // 공지사항 목록 조회
    const fetchNoticeList = async () => {
        try {
            console.log("공지사항 목록 조회 - boardSeq:", boardSeq);
            const response = await fetch(`http://localhost:8080/board/post/notice?boardSeq=${boardSeq}&limit=5`);
            console.log("공지사항 목록 API 응답 상태:", response.status);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("공지사항 목록 API 응답 데이터:", data);
            
            if(data.rt === "OK") {
                setNoticeList(data.list || []);
            } else {
                console.error("공지사항 목록 조회 실패:", data.msg || data.message);
            }
        } catch(err) {
            console.error("공지사항 목록 조회 오류:", err);
        }
    };

    // 이벤트 게시판 상품 목록 조회
    const fetchProductList = async () => {
        try {
            console.log("상품 목록 조회 - boardSeq:", boardSeq);
            const response = await fetch(`http://localhost:8080/event/product/list/all?boardSeq=${boardSeq}`);
            console.log("상품 목록 API 응답 상태:", response.status);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("상품 목록 API 응답 데이터:", data);
            
            if(data.rt === "OK") {
                setProductList(data.list || []);
            } else {
                console.error("상품 목록 불러오기 실패:", data.msg || data.message);
            }
        } catch(err) {
            console.error("상품 목록 조회 오류:", err);
        }
    };

    // 상품별 댓글 조회 (상품명으로 게시글 찾기)
    const fetchProductComments = async (productSeq) => {
        try {
            // 상품 정보 조회
            const productResponse = await fetch(`http://localhost:8080/event/product/detail?productSeq=${productSeq}`);
            const productData = await productResponse.json();
            
            if(productData.rt !== "OK") {
                alert("상품 정보를 불러올 수 없습니다.");
                return;
            }
            
            const product = productData.product;
            
            // 상품명으로 게시글 검색
            const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(product.productName)}&page=0&size=1`);
            const searchData = await searchResponse.json();
            
            if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                // 게시글을 찾았으면 댓글 조회
                const postSeq = searchData.list[0].postSeq;
                const commentResponse = await fetch(`http://localhost:8080/board/comment/list?postSeq=${postSeq}`);
                const commentData = await commentResponse.json();
                
                if(commentData.rt === "OK") {
                    setProductComments(prev => ({
                        ...prev,
                        [productSeq]: {
                            postSeq: postSeq,
                            comments: commentData.list || []
                        }
                    }));
                }
            } else {
                // 게시글이 없으면 빈 배열로 설정
                setProductComments(prev => ({
                    ...prev,
                    [productSeq]: {
                        postSeq: null,
                        comments: []
                    }
                }));
            }
        } catch(err) {
            console.error("상품 댓글 조회 오류:", err);
        }
    };

    // 질문게시판 댓글 조회
    const fetchQuestionComments = async () => {
        try {
            // 질문게시판 전용 게시글 찾기 또는 생성
            let targetPostSeq = questionPostSeq;
            
            if(!targetPostSeq) {
                // "질문게시판" 제목의 게시글 검색
                const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=질문게시판&page=0&size=1`);
                const searchData = await searchResponse.json();
                
                if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                    targetPostSeq = searchData.list[0].postSeq;
                    setQuestionPostSeq(targetPostSeq);
                } else {
                    // 게시글이 없으면 자동 생성
                    const memId = sessionStorage.getItem("memId") || sessionStorage.getItem("managerId");
                    if(memId) {
                        const createResponse = await fetch("http://localhost:8080/board/post/write", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                boardSeq: parseInt(boardSeq),
                                memberId: memId,
                                postTitle: "질문게시판",
                                postContent: "질문게시판 전용 게시글입니다.",
                                isNotice: "N"
                            })
                        });
                        const createData = await createResponse.json();
                        if(createData.rt === "OK" && createData.postSeq) {
                            targetPostSeq = createData.postSeq;
                            setQuestionPostSeq(targetPostSeq);
                        }
                    }
                }
            }
            
            if(targetPostSeq) {
                const commentResponse = await fetch(`http://localhost:8080/board/comment/list?postSeq=${targetPostSeq}`);
                const commentData = await commentResponse.json();
                
                if(commentData.rt === "OK") {
                    setQuestionComments(commentData.list || []);
                }
            }
        } catch(err) {
            console.error("질문게시판 댓글 조회 오류:", err);
        }
    };

    // 질문게시판 댓글 작성
    const handleQuestionCommentSubmit = async (e) => {
        e.preventDefault();
        
        if(!commentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        const memId = sessionStorage.getItem("memId") || sessionStorage.getItem("managerId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }

        try {
            // 질문게시판 전용 게시글 찾기 또는 생성
            let targetPostSeq = questionPostSeq;
            
            if(!targetPostSeq) {
                const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=질문게시판&page=0&size=1`);
                const searchData = await searchResponse.json();
                
                if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                    targetPostSeq = searchData.list[0].postSeq;
                    setQuestionPostSeq(targetPostSeq);
                } else {
                    // 게시글 생성
                    const createResponse = await fetch("http://localhost:8080/board/post/write", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            boardSeq: parseInt(boardSeq),
                            memberId: memId,
                            postTitle: "질문게시판",
                            postContent: "질문게시판 전용 게시글입니다.",
                            isNotice: "N"
                        })
                    });
                    const createData = await createResponse.json();
                    if(createData.rt === "OK" && createData.postSeq) {
                        targetPostSeq = createData.postSeq;
                        setQuestionPostSeq(targetPostSeq);
                    } else {
                        alert("게시글 생성에 실패했습니다.");
                        return;
                    }
                }
            }
            
            // 댓글 작성
            const commentResponse = await fetch("http://localhost:8080/board/comment/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postSeq: targetPostSeq,
                    memberId: memId,
                    commentContent: commentContent.trim(),
                    parentCommentSeq: null // 일반 댓글
                })
            });

            const commentData = await commentResponse.json();
            
            if(commentData.rt === "OK") {
                setCommentContent("");
                fetchQuestionComments(); // 댓글 목록 새로고침
            } else {
                alert(commentData.msg || "댓글 작성에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 작성 오류:", err);
            alert("댓글 작성 중 오류가 발생했습니다.");
        }
    };

    // 질문게시판 댓글 답변 작성
    const handleQuestionReplySubmit = async (e, parentCommentSeq) => {
        e.preventDefault();
        
        if(!replyContent.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }

        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자만 답변을 작성할 수 있습니다.");
            return;
        }

        try {
            // 질문게시판 전용 게시글 찾기
            let targetPostSeq = questionPostSeq;
            
            if(!targetPostSeq) {
                const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=질문게시판&page=0&size=1`);
                const searchData = await searchResponse.json();
                
                if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                    targetPostSeq = searchData.list[0].postSeq;
                    setQuestionPostSeq(targetPostSeq);
                } else {
                    alert("게시글을 찾을 수 없습니다.");
                    return;
                }
            }
            
            // 답변 작성 (parentCommentSeq 사용)
            const commentResponse = await fetch("http://localhost:8080/board/comment/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postSeq: targetPostSeq,
                    memberId: managerId,
                    commentContent: replyContent.trim(),
                    parentCommentSeq: parentCommentSeq // 부모 댓글 번호
                })
            });

            const commentData = await commentResponse.json();
            
            if(commentData.rt === "OK") {
                setReplyContent("");
                setReplyingTo(null);
                fetchQuestionComments(); // 댓글 목록 새로고침
            } else {
                alert(commentData.msg || "답변 작성에 실패했습니다.");
            }
        } catch(err) {
            console.error("답변 작성 오류:", err);
            alert("답변 작성 중 오류가 발생했습니다.");
        }
    };

    // 상품 댓글 작성
    const handleProductCommentSubmit = async (e, productSeq) => {
        e.preventDefault();
        
        if(!commentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        const memId = sessionStorage.getItem("memId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }

        try {
            // 상품 정보 조회
            const productResponse = await fetch(`http://localhost:8080/event/product/detail?productSeq=${productSeq}`);
            const productData = await productResponse.json();
            
            if(productData.rt !== "OK") {
                alert("상품 정보를 불러올 수 없습니다.");
                return;
            }
            
            const product = productData.product;
            
            // 상품명으로 게시글 검색
            const searchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(product.productName)}&page=0&size=1`);
            const searchData = await searchResponse.json();
            
            let postSeq = null;
            
            if(searchData.rt === "OK" && searchData.list && searchData.list.length > 0) {
                // 게시글이 있으면 해당 게시글에 댓글 작성
                postSeq = searchData.list[0].postSeq;
            } else {
                // 게시글이 없으면 자동으로 게시글 생성
                const memId = sessionStorage.getItem("memId") || "system";
                const createPostResponse = await fetch("http://localhost:8080/board/post/write", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        boardSeq: parseInt(boardSeq),
                        memberId: memId,
                        postTitle: `[상품] ${product.productName}`,
                        postContent: `상품명: ${product.productName}\n상품 설명: ${product.productDescription || ""}`,
                        isNotice: "N"
                    })
                });
                
                const createPostData = await createPostResponse.json();
                if(createPostData.rt === "OK") {
                    // 게시글 생성 후 다시 검색해서 찾기
                    await new Promise(resolve => setTimeout(resolve, 500)); // 잠시 대기
                    const reSearchResponse = await fetch(`http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(product.productName)}&page=0&size=1`);
                    const reSearchData = await reSearchResponse.json();
                    
                    if(reSearchData.rt === "OK" && reSearchData.list && reSearchData.list.length > 0) {
                        postSeq = reSearchData.list[0].postSeq;
                    } else {
                        alert("게시글 생성 후 찾을 수 없습니다. 잠시 후 다시 시도해주세요.");
                        return;
                    }
                } else {
                    alert("게시글 생성에 실패했습니다: " + (createPostData.msg || ""));
                    return;
                }
            }
            
            // 댓글 작성
            const commentResponse = await fetch("http://localhost:8080/board/comment/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postSeq: postSeq,
                    memberId: memId,
                    commentContent: commentContent.trim()
                })
            });

            const commentData = await commentResponse.json();
            
            if(commentData.rt === "OK") {
                setCommentContent("");
                fetchProductComments(productSeq); // 댓글 목록 새로고침
            } else {
                alert(commentData.msg || "댓글 작성에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 작성 오류:", err);
            alert("댓글 작성 중 오류가 발생했습니다.");
        }
    };

    // 게시글 목록 조회
    const fetchPostList = async () => {
        setLoading(true);
        setError(null);
        try {
            let url;
            if(showAdvancedSearch && (advancedSearch.keyword || advancedSearch.memberId || advancedSearch.startDate || advancedSearch.endDate)) {
                // 고급 검색
                const params = new URLSearchParams({
                    boardSeq: boardSeq,
                    page: page,
                    size: 10
                });
                if(advancedSearch.keyword) params.append("keyword", advancedSearch.keyword);
                if(advancedSearch.memberId) params.append("memberId", advancedSearch.memberId);
                if(advancedSearch.startDate) params.append("startDate", advancedSearch.startDate);
                if(advancedSearch.endDate) params.append("endDate", advancedSearch.endDate);
                url = `http://localhost:8080/board/post/advanced-search?${params.toString()}`;
            } else if(isSearching && searchKeyword.trim()) {
                // 간단 검색
                url = `http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(searchKeyword)}&page=${page}&size=10`;
            } else {
                // 일반 목록
                url = `http://localhost:8080/board/post/list?boardSeq=${boardSeq}&page=${page}&size=10`;
            }
            
            console.log("게시글 목록 API 호출:", url);
            
            const response = await fetch(url);
            console.log("게시글 목록 API 응답 상태:", response.status);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("게시글 목록 API 응답 데이터:", data);
            
            if(data.rt === "OK") {
                setPostList(data.list || []);
                setTotalPages(data.totalPages || 0);
            } else {
                const errorMsg = data.msg || data.message || "게시글 목록을 불러오는 중 오류가 발생했습니다.";
                setError(errorMsg);
                console.error("게시글 목록 조회 실패:", errorMsg);
            }
        } catch(err) {
            console.error("게시글 목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요. 오류: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        if(searchKeyword.trim()) {
            setIsSearching(true);
            setShowAdvancedSearch(false);
            setPage(0);
        } else {
            setIsSearching(false);
            setShowAdvancedSearch(false);
            setPage(0);
        }
    };

    // 고급 검색 처리
    const handleAdvancedSearch = (e) => {
        e.preventDefault();
        if(advancedSearch.keyword || advancedSearch.memberId || advancedSearch.startDate || advancedSearch.endDate) {
            setShowAdvancedSearch(true);
            setIsSearching(false);
            setPage(0);
        } else {
            setShowAdvancedSearch(false);
            setPage(0);
        }
    };

    // 검색 초기화
    const handleResetSearch = () => {
        setSearchKeyword("");
        setAdvancedSearch({
            keyword: "",
            memberId: "",
            startDate: "",
            endDate: ""
        });
        setIsSearching(false);
        setShowAdvancedSearch(false);
        setPage(0);
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        if(newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            {/* 게시판 정보 */}
            {board && (
                <div style={{
                    marginBottom: "30px",
                    padding: "20px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <h2 style={{
                        marginBottom: "10px",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        {board.boardName}
                    </h2>
                    {board.boardDescription && (
                        <p style={{ color: "#666", marginBottom: "10px" }}>
                            {board.boardDescription}
                        </p>
                    )}
                </div>
            )}

            {/* 검색 영역 (공동구매 게시판이 아닐 때만 표시) */}
            {board && board.boardType !== "공구이벤트" && (
                <div style={{
                    marginBottom: "20px",
                    display: "flex",
                    gap: "10px"
                }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: "10px" }}>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="제목 또는 내용으로 검색"
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
                        {isSearching && (
                            <button
                                type="button"
                                onClick={handleResetSearch}
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
                                초기화
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* 이벤트 게시판 상품 목록 영역 */}
            {board && board.boardType === "공구이벤트" && (
                <div style={{
                    marginBottom: "30px"
                }}>
                    <h3 style={{
                        marginBottom: "20px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        🛒 상품 목록
                    </h3>
                    {productList.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            color: "#666"
                        }}>
                            등록된 상품이 없습니다.
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "20px"
                        }}>
                            {productList.map((product) => (
                                <div
                                    key={product.productSeq}
                                    onClick={() => {
                                        // 상품 상세 페이지로 이동
                                        navigate(`/event/product/${product.productSeq}`);
                                    }}
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        border: "1px solid #dee2e6",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                    }}
                                >
                                    <div style={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        marginBottom: "10px",
                                        color: "#333"
                                    }}>
                                        {product.productName}
                                    </div>
                                    {product.productDescription && (
                                        <div style={{
                                            fontSize: "14px",
                                            color: "#666",
                                            marginBottom: "15px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical"
                                        }}>
                                            {product.productDescription}
                                        </div>
                                    )}
                                    <div style={{
                                        marginBottom: "10px"
                                    }}>
                                        <div style={{
                                            fontSize: "14px",
                                            color: "#999",
                                            textDecoration: "line-through",
                                            marginBottom: "5px"
                                        }}>
                                            정가: ₩ {product.originalPrice?.toLocaleString() || 0}
                                        </div>
                                        <div style={{
                                            fontSize: "20px",
                                            color: "#dc3545",
                                            fontWeight: "bold"
                                        }}>
                                            ₩ {product.salePrice?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                        fontSize: "13px",
                                        color: "#666"
                                    }}>
                                        <span>재고: {product.stockQuantity || 0}</span>
                                        <span>판매: {product.soldQuantity || 0}</span>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: "10px"
                                    }}>
                                        <div style={{
                                            display: "inline-block",
                                            padding: "4px 12px",
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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProduct(product);
                                                fetchProductComments(product.productSeq);
                                            }}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#337ab7",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            💬 댓글
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 게시글 목록 (공동구매 게시판이 아닐 때만 표시) */}
            {board && board.boardType !== "공구이벤트" && (
                <>
                    {loading && (
                        <div style={{textAlign: "center", padding: "20px"}}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#d9534f",
                            backgroundColor: "#f8d7da",
                            borderRadius: "4px",
                            marginBottom: "20px"
                        }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div>
                            {/* 질문게시판인 경우 댓글만 표시 */}
                            {board && board.boardType === "질문게시판" ? (
                                <div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "20px" }}>
                                        질문과 답변
                                    </h3>
                                    
                                    {/* 댓글 작성 폼 */}
                                    {sessionStorage.getItem("memId") || sessionStorage.getItem("managerId") ? (
                                        <form onSubmit={handleQuestionCommentSubmit} style={{
                                            marginBottom: "30px",
                                            padding: "20px",
                                            backgroundColor: "#f8f9fa",
                                            borderRadius: "8px",
                                            border: "1px solid #dee2e6"
                                        }}>
                                            <label style={{
                                                display: "block",
                                                marginBottom: "10px",
                                                fontWeight: "bold",
                                                color: "#333"
                                            }}>
                                                질문 또는 답변 작성
                                            </label>
                                            <textarea
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                placeholder="질문이나 답변을 입력하세요"
                                                rows={4}
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
                                                    작성하기
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div style={{
                                            padding: "15px",
                                            marginBottom: "20px",
                                            backgroundColor: "#fff3cd",
                                            borderRadius: "4px",
                                            border: "1px solid #ffc107",
                                            textAlign: "center",
                                            color: "#856404"
                                        }}>
                                            질문이나 답변을 작성하려면 로그인이 필요합니다.
                                        </div>
                                    )}
                                    
                                    {/* 댓글 목록 */}
                                    <div>
                                        {questionComments.length > 0 ? (
                                            <div>
                                                {questionComments
                                                    .filter(comment => !comment.parentCommentSeq) // 일반 댓글만 필터링
                                                    .map((comment) => {
                                                        // 해당 댓글의 답변들 찾기
                                                        const replies = questionComments.filter(
                                                            reply => reply.parentCommentSeq === comment.commentSeq
                                                        );
                                                        
                                                        return (
                                                            <div key={comment.commentSeq}>
                                                                {/* 질문 (일반 댓글) */}
                                                                <div
                                                                    style={{
                                                                        padding: "20px",
                                                                        marginBottom: "15px",
                                                                        backgroundColor: "#fff",
                                                                        borderRadius: "8px",
                                                                        border: "1px solid #dee2e6",
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                                                    }}
                                                                >
                                                                    <div style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                        marginBottom: "10px"
                                                                    }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                            <strong style={{ color: "#333", fontSize: "16px" }}>
                                                                                {comment.memberId}
                                                                            </strong>
                                                                            <span style={{
                                                                                fontSize: "11px",
                                                                                padding: "2px 8px",
                                                                                backgroundColor: "#e3f2fd",
                                                                                color: "#1976d2",
                                                                                borderRadius: "12px"
                                                                            }}>
                                                                                질문
                                                                            </span>
                                                                        </div>
                                                                        <span style={{
                                                                            fontSize: "12px",
                                                                            color: "#999"
                                                                        }}>
                                                                            {new Date(comment.createdDate).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{
                                                                        color: "#333",
                                                                        lineHeight: "1.8",
                                                                        whiteSpace: "pre-wrap",
                                                                        wordBreak: "break-word",
                                                                        fontSize: "14px",
                                                                        marginBottom: "10px"
                                                                    }}>
                                                                        {comment.commentContent}
                                                                    </div>
                                                                    {/* 관리자만 답변 버튼 표시 */}
                                                                    {sessionStorage.getItem("managerId") && (
                                                                        <div style={{ marginTop: "10px" }}>
                                                                            {replyingTo === comment.commentSeq ? (
                                                                                <form onSubmit={(e) => handleQuestionReplySubmit(e, comment.commentSeq)} style={{
                                                                                    padding: "15px",
                                                                                    backgroundColor: "#f8f9fa",
                                                                                    borderRadius: "4px",
                                                                                    border: "1px solid #dee2e6"
                                                                                }}>
                                                                                    <textarea
                                                                                        value={replyContent}
                                                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                                                        placeholder="답변을 입력하세요"
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
                                                                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                setReplyingTo(null);
                                                                                                setReplyContent("");
                                                                                            }}
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
                                                                                        <button
                                                                                            type="submit"
                                                                                            style={{
                                                                                                padding: "6px 12px",
                                                                                                backgroundColor: "#337ab7",
                                                                                                color: "#fff",
                                                                                                border: "none",
                                                                                                borderRadius: "4px",
                                                                                                fontSize: "13px",
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                        >
                                                                                            답변 작성
                                                                                        </button>
                                                                                    </div>
                                                                                </form>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => setReplyingTo(comment.commentSeq)}
                                                                                    style={{
                                                                                        padding: "6px 12px",
                                                                                        backgroundColor: "#28a745",
                                                                                        color: "#fff",
                                                                                        border: "none",
                                                                                        borderRadius: "4px",
                                                                                        fontSize: "13px",
                                                                                        cursor: "pointer"
                                                                                    }}
                                                                                >
                                                                                    답변하기
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* 답변들 표시 */}
                                                                {replies.length > 0 && (
                                                                    <div style={{
                                                                        marginLeft: "30px",
                                                                        marginBottom: "15px"
                                                                    }}>
                                                                        {replies.map((reply) => (
                                                                            <div
                                                                                key={reply.commentSeq}
                                                                                style={{
                                                                                    padding: "15px",
                                                                                    marginBottom: "10px",
                                                                                    backgroundColor: "#f8f9fa",
                                                                                    borderRadius: "8px",
                                                                                    border: "1px solid #dee2e6",
                                                                                    borderLeft: "3px solid #28a745"
                                                                                }}
                                                                            >
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    justifyContent: "space-between",
                                                                                    alignItems: "center",
                                                                                    marginBottom: "8px"
                                                                                }}>
                                                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                        <strong style={{ color: "#28a745", fontSize: "14px" }}>
                                                                                            {reply.memberId === "admin" || sessionStorage.getItem("managerId") === reply.memberId ? "운영자" : reply.memberId}
                                                                                        </strong>
                                                                                        <span style={{
                                                                                            fontSize: "10px",
                                                                                            padding: "2px 6px",
                                                                                            backgroundColor: "#d4edda",
                                                                                            color: "#155724",
                                                                                            borderRadius: "10px"
                                                                                        }}>
                                                                                            답변
                                                                                        </span>
                                                                                    </div>
                                                                                    <span style={{
                                                                                        fontSize: "11px",
                                                                                        color: "#999"
                                                                                    }}>
                                                                                        {new Date(reply.createdDate).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                                <div style={{
                                                                                    color: "#333",
                                                                                    lineHeight: "1.6",
                                                                                    whiteSpace: "pre-wrap",
                                                                                    wordBreak: "break-word",
                                                                                    fontSize: "13px"
                                                                                }}>
                                                                                    {reply.commentContent}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: "center",
                                                padding: "40px",
                                                color: "#999"
                                            }}>
                                                등록된 질문이나 답변이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "15px"
                                    }}>
                                        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
                                            게시글 목록
                                        </h3>
                                        {/* 이벤트 게시판이 아닐 때만 글쓰기 버튼 표시 */}
                                        {sessionStorage.getItem("memId") && (
                                            <Link
                                                to={`/board/${boardSeq}/post/write`}
                                                style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#28a745",
                                                    color: "#fff",
                                                    textDecoration: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "14px"
                                                }}
                                            >
                                                <i className="bi bi-pencil"></i> 글쓰기
                                            </Link>
                                        )}
                                    </div>

                            {postList.length === 0 ? (
                                <div style={{
                                    textAlign: "center",
                                    padding: "40px",
                                    color: "#666"
                                }}>
                                    등록된 게시글이 없습니다.
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
                                            <th style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                width: "10%"
                                            }}>번호</th>
                                            <th style={{
                                                padding: "12px",
                                                textAlign: "left",
                                                width: "50%"
                                            }}>제목</th>
                                            <th style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                width: "15%"
                                            }}>작성자</th>
                                            <th style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                width: "15%"
                                            }}>작성일</th>
                                            <th style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                width: "10%"
                                            }}>조회수</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postList.map((post, index) => (
                                            <tr
                                                key={post.postSeq}
                                                style={{
                                                    borderBottom: "1px solid #dee2e6",
                                                    cursor: "pointer"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                }}
                                                onClick={() => navigate(`/board/post/${post.postSeq}`)}
                                            >
                                                <td style={{
                                                    padding: "12px",
                                                    textAlign: "center",
                                                    color: "#666"
                                                }}>
                                                    {postList.length - index + (page * 10)}
                                                </td>
                                                <td style={{
                                                    padding: "12px",
                                                    textAlign: "left"
                                                }}>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px"
                                                    }}>
                                                        {post.isNotice === "Y" && (
                                                            <span style={{
                                                                display: "inline-block",
                                                                padding: "2px 8px",
                                                                backgroundColor: "#fff3cd",
                                                                color: "#8B0000",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                                border: "1px solid #8B0000"
                                                            }}>
                                                                [공지사항]
                                                            </span>
                                                        )}
                                                        <span style={{
                                                            color: post.isNotice === "Y" ? "#8B0000" : "#333",
                                                            fontWeight: post.isNotice === "Y" ? "bold" : "normal"
                                                        }}>
                                                            {post.postTitle}
                                                        </span>
                                                    </div>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "5px",
                                    marginTop: "20px"
                                }}>
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: page === 0 ? "#e9ecef" : "#337ab7",
                                            color: page === 0 ? "#999" : "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: page === 0 ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        이전
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            style={{
                                                padding: "8px 12px",
                                                backgroundColor: page === i ? "#337ab7" : "#fff",
                                                color: page === i ? "#fff" : "#333",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: page >= totalPages - 1 ? "#e9ecef" : "#337ab7",
                                            color: page >= totalPages - 1 ? "#999" : "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        다음
                                    </button>
                                </div>
                            )}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* 뒤로가기 버튼 */}
            <div style={{
                marginTop: "30px",
                textAlign: "center"
            }}>
                <button
                    onClick={() => navigate("/board/list")}
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
                    게시판 목록으로
                </button>
            </div>

            {/* 상품 댓글 모달 */}
            {selectedProduct && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}
                onClick={() => setSelectedProduct(null)}
                >
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        padding: "30px",
                        maxWidth: "600px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflowY: "auto"
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}>
                            <h3 style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                💬 {selectedProduct.productName} 댓글
                            </h3>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                ✕ 닫기
                            </button>
                        </div>

                        {/* 댓글 작성 폼 */}
                        {sessionStorage.getItem("memId") && (
                            <form onSubmit={(e) => handleProductCommentSubmit(e, selectedProduct.productSeq)} style={{
                                marginBottom: "30px",
                                padding: "15px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px"
                            }}>
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
                        <div>
                            {productComments[selectedProduct.productSeq]?.comments && productComments[selectedProduct.productSeq].comments.length > 0 ? (
                                <div>
                                    {productComments[selectedProduct.productSeq].comments.map((comment) => (
                                        <div
                                            key={comment.commentSeq}
                                            style={{
                                                padding: "15px",
                                                marginBottom: "15px",
                                                backgroundColor: "#fff",
                                                borderRadius: "4px",
                                                border: "1px solid #dee2e6"
                                            }}
                                        >
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "10px"
                                            }}>
                                                <strong style={{ color: "#333" }}>
                                                    {comment.memberId}
                                                </strong>
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: "#999"
                                                }}>
                                                    {new Date(comment.createdDate).toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={{
                                                color: "#333",
                                                lineHeight: "1.6",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}>
                                                {comment.commentContent}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: "center",
                                    padding: "40px",
                                    color: "#999"
                                }}>
                                    등록된 댓글이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostList;

