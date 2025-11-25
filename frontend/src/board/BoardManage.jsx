import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

// 게시판 설정 탭 컴포넌트
function BoardSettingsTab({ board, boardSeq, onUpdate }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        boardName: board.boardName || "",
        boardDescription: board.boardDescription || "",
        boardType: board.boardType || "일반",
        boardCategory: board.boardCategory || "",
        isActive: board.isActive || "Y",
        displayOrder: board.displayOrder || 0,
        noticeDisplayCount: board.noticeDisplayCount || 5
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 입력값 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "displayOrder" || name === "noticeDisplayCount" 
                ? parseInt(value) || 0 
                : value
        }));
    };

    // 게시판 수정
    const handleModify = async (e) => {
        e.preventDefault();
        setError("");

        if(!formData.boardName || formData.boardName.trim() === "") {
            setError("게시판명을 입력해주세요.");
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                boardSeq: parseInt(boardSeq),
                ...formData
            };

            const response = await fetch("http://localhost:8080/board/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if(data.rt === "OK") {
                alert(data.msg || "게시판이 수정되었습니다.");
                setIsEditing(false);
                onUpdate(); // 게시판 정보 새로고침
            } else {
                setError(data.msg || "게시판 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시판 수정 오류:", err);
            setError("게시판 수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 게시판 삭제 (비활성화)
    const handleDelete = async () => {
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

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if(data.rt === "OK") {
                alert(data.msg || (deleteType ? "게시판이 완전히 삭제되었습니다." : "게시판이 비활성화되었습니다."));
                // 삭제 성공 시 관리자 페이지로 이동
                navigate("/manager/managerInfo");
            } else {
                // 삭제 실패 시 상세 메시지 표시
                const errorMsg = data.msg || "게시판 삭제에 실패했습니다.";
                console.error("게시판 삭제 실패:", errorMsg);
                alert(errorMsg);
            }
        } catch(err) {
            console.error("게시판 삭제 오류:", err);
            alert("게시판 삭제 중 오류가 발생했습니다: " + (err.message || "알 수 없는 오류"));
        }
    };

    if(isEditing) {
        return (
            <div style={{
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #dee2e6"
            }}>
                <h3 style={{
                    marginBottom: "20px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333"
                }}>
                    게시판 수정
                </h3>

                {error && (
                    <div style={{
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleModify}>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "5px",
                            fontWeight: "bold",
                            fontSize: "14px"
                        }}>
                            게시판명 <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="boardName"
                            value={formData.boardName}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "5px",
                            fontWeight: "bold",
                            fontSize: "14px"
                        }}>
                            게시판 설명
                        </label>
                        <textarea
                            name="boardDescription"
                            value={formData.boardDescription}
                            onChange={handleChange}
                            rows="4"
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                resize: "vertical"
                            }}
                        />
                    </div>

                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: "15px",
                        marginBottom: "15px"
                    }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                fontSize: "14px"
                            }}>
                                게시판 타입
                            </label>
                            <select
                                name="boardType"
                                value={formData.boardType}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                            >
                                <option value="일반">일반</option>
                                <option value="공구이벤트">공구이벤트</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                fontSize: "14px"
                            }}>
                                게시판 카테고리
                            </label>
                            <input
                                type="text"
                                name="boardCategory"
                                value={formData.boardCategory}
                                onChange={handleChange}
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

                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: "15px",
                        marginBottom: "15px"
                    }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                fontSize: "14px"
                            }}>
                                표시 순서
                            </label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
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
                                fontSize: "14px"
                            }}>
                                공지사항 상단 노출 개수
                            </label>
                            <input
                                type="number"
                                name="noticeDisplayCount"
                                value={formData.noticeDisplayCount}
                                onChange={handleChange}
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
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer"
                        }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive === "Y"}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isActive: e.target.checked ? "Y" : "N"
                                }))}
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
                    </div>

                    <div style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end"
                    }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    boardName: board.boardName || "",
                                    boardDescription: board.boardDescription || "",
                                    boardType: board.boardType || "일반",
                                    boardCategory: board.boardCategory || "",
                                    isActive: board.isActive || "Y",
                                    displayOrder: board.displayOrder || 0,
                                    noticeDisplayCount: board.noticeDisplayCount || 5
                                });
                                setError("");
                            }}
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
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: loading ? "#ccc" : "#337ab7",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontSize: "14px"
                            }}
                        >
                            {loading ? "수정 중..." : "수정 완료"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
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
                <div>
                    <strong>표시 순서:</strong> {board.displayOrder || 0}
                </div>
                <div>
                    <strong>카테고리:</strong> {board.boardCategory || "-"}
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
                display: "flex",
                gap: "10px"
            }}>
                <button
                    onClick={() => setIsEditing(true)}
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
                    게시판 수정
                </button>
                <button
                    onClick={handleDelete}
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
    );
}

function BoardManage() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const loginCheckedRef = useRef(false);
    
    const [board, setBoard] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("posts"); // posts, comments, settings
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

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
            fetchPosts();
        }
    }, [boardSeq, navigate, currentPage, searchKeyword]);

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

    // 게시글 목록 조회
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/board/post/list?boardSeq=${boardSeq}&page=${currentPage}&size=10`;
            if(searchKeyword) {
                url = `http://localhost:8080/board/post/search?boardSeq=${boardSeq}&keyword=${encodeURIComponent(searchKeyword)}&page=${currentPage}&size=10`;
            }
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                const postsList = data.list || [];
                
                // 각 게시글의 작성자 닉네임 조회
                const postsWithNickname = await Promise.all(
                    postsList.map(async (post) => {
                        try {
                            // 관리자인지 먼저 확인
                            const managerResponse = await fetch(`http://localhost:8080/manager/getManager?managerId=${encodeURIComponent(post.memberId)}`);
                            const managerData = await managerResponse.json();
                            if(managerData.rt === "OK" && managerData.manager) {
                                return {
                                    ...post,
                                    memberNickname: "운영자"
                                };
                            }
                            
                            // 일반 회원인 경우 닉네임 조회
                            const memberResponse = await fetch(`http://localhost:8080/member/getMember?id=${encodeURIComponent(post.memberId)}`);
                            const memberData = await memberResponse.json();
                            if(memberData.rt === "OK" && memberData.member) {
                                return {
                                    ...post,
                                    memberNickname: memberData.member.nickname || post.memberId
                                };
                            }
                            
                            return {
                                ...post,
                                memberNickname: post.memberId
                            };
                        } catch(err) {
                            console.error(`게시글 ${post.postSeq} 작성자 정보 조회 오류:`, err);
                            return {
                                ...post,
                                memberNickname: post.memberId
                            };
                        }
                    })
                );
                
                setPosts(postsWithNickname);
                setTotalPages(data.totalPages || 0);
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

    // 댓글 목록 조회 (모든 게시글의 댓글)
    const fetchComments = async () => {
        setLoading(true);
        setError(null);
        try {
            // 먼저 게시판의 모든 게시글 조회
            const postsResponse = await fetch(`http://localhost:8080/board/post/list/all?boardSeq=${boardSeq}`);
            const postsData = await postsResponse.json();
            
            if(postsData.rt === "OK") {
                const allComments = [];
                // 각 게시글의 댓글 조회
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
                
                // 각 댓글의 작성자 닉네임 조회
                const commentsWithNickname = await Promise.all(
                    allComments.map(async (comment) => {
                        try {
                            // 관리자인지 먼저 확인
                            const managerResponse = await fetch(`http://localhost:8080/manager/getManager?managerId=${encodeURIComponent(comment.memberId)}`);
                            const managerData = await managerResponse.json();
                            if(managerData.rt === "OK" && managerData.manager) {
                                return {
                                    ...comment,
                                    memberNickname: "운영자"
                                };
                            }
                            
                            // 일반 회원인 경우 닉네임 조회
                            const memberResponse = await fetch(`http://localhost:8080/member/getMember?id=${encodeURIComponent(comment.memberId)}`);
                            const memberData = await memberResponse.json();
                            if(memberData.rt === "OK" && memberData.member) {
                                return {
                                    ...comment,
                                    memberNickname: memberData.member.nickname || comment.memberId
                                };
                            }
                            
                            return {
                                ...comment,
                                memberNickname: comment.memberId
                            };
                        } catch(err) {
                            console.error(`댓글 ${comment.commentSeq} 작성자 정보 조회 오류:`, err);
                            return {
                                ...comment,
                                memberNickname: comment.memberId
                            };
                        }
                    })
                );
                
                setComments(commentsWithNickname);
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
        if(activeTab === "comments" && boardSeq) {
            fetchComments();
        } else if(activeTab === "posts" && boardSeq) {
            fetchPosts();
        }
    }, [activeTab, boardSeq]);

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

    // 게시글을 공지사항으로 전환
    const handleConvertToNotice = async (postSeq) => {
        if(!window.confirm("이 게시글을 공지사항으로 전환하시겠습니까?")) {
            return;
        }

        try {
            const managerId = sessionStorage.getItem("managerId");
            if(!managerId) {
                alert("관리자 권한이 필요합니다.");
                return;
            }

            const response = await fetch("http://localhost:8080/board/post/toNotice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ postSeq: postSeq, memberId: managerId })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "공지사항으로 전환되었습니다.");
                fetchPosts();
            } else {
                alert(data.msg || "공지사항 전환에 실패했습니다.");
            }
        } catch(err) {
            console.error("공지사항 전환 오류:", err);
            alert("공지사항 전환 중 오류가 발생했습니다.");
        }
    };

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchPosts();
    };

    return (
        <div style={{
            maxWidth: "1200px",
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
                게시판 관리
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
                borderBottom: "2px solid #dee2e6"
            }}>
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
                        backgroundColor: activeTab === "comments" ? "#337ab7" : "transparent",
                        color: activeTab === "comments" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "comments" ? "3px solid #337ab7" : "3px solid transparent",
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
                        backgroundColor: activeTab === "settings" ? "#337ab7" : "transparent",
                        color: activeTab === "settings" ? "#fff" : "#333",
                        border: "none",
                        borderBottom: activeTab === "settings" ? "3px solid #337ab7" : "3px solid transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === "settings" ? "bold" : "normal"
                    }}
                >
                    게시판 설정
                </button>
            </div>

            {/* 게시글 관리 탭 */}
            {activeTab === "posts" && (
                <div>
                    {/* 검색 영역 및 글쓰기 버튼 */}
                    <div style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <form onSubmit={handleSearch} style={{
                            flex: 1,
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
                        <div style={{
                            display: "flex",
                            gap: "10px"
                        }}>
                            <button
                                onClick={() => {
                                    // 공지사항 작성 페이지로 이동 (isNotice 파라미터 전달)
                                    navigate(`/board/${boardSeq}/post/write?isNotice=Y`);
                                }}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#dc3545",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px"
                                }}
                            >
                                <i className="bi bi-megaphone"></i> 공지사항 작성
                            </button>
                        </div>
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
                                    <th style={{ padding: "8px", textAlign: "center", width: "60px", minWidth: "60px", fontSize: "12px", whiteSpace: "nowrap" }}>번호</th>
                                    <th style={{ padding: "8px", textAlign: "left", width: "40%", fontSize: "12px" }}>제목</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "15%", fontSize: "12px" }}>작성자</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "15%", fontSize: "12px" }}>작성일</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "10%", fontSize: "12px" }}>조회수</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "15%", fontSize: "12px" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{
                                            padding: "30px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
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
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {post.isNotice === "Y" ? (
                                                    <span style={{
                                                        padding: "2px 6px",
                                                        backgroundColor: "#dc3545",
                                                        color: "#fff",
                                                        borderRadius: "3px",
                                                        fontSize: "10px"
                                                    }}>
                                                        공지
                                                    </span>
                                                ) : (
                                                    posts.length - index
                                                )}
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <Link
                                                    to={`/board/post/${post.postSeq}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "#333",
                                                        fontWeight: post.isNotice === "Y" ? "bold" : "normal",
                                                        fontSize: "13px"
                                                    }}
                                                >
                                                    {post.postTitle}
                                                </Link>
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {post.memberNickname || post.memberId}
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {new Date(post.createdDate).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {post.viewCount || 0}
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center"
                                            }}>
                                                <div style={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    justifyContent: "center"
                                                }}>
                                                    {post.isNotice !== "Y" && (
                                                        <button
                                                            onClick={() => handleConvertToNotice(post.postSeq)}
                                                            style={{
                                                                padding: "3px 6px",
                                                                backgroundColor: "#ffc107",
                                                                color: "#333",
                                                                border: "none",
                                                                borderRadius: "3px",
                                                                cursor: "pointer",
                                                                fontSize: "11px"
                                                            }}
                                                        >
                                                            공지
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeletePost(post.postSeq)}
                                                        style={{
                                                            padding: "3px 6px",
                                                            backgroundColor: "#dc3545",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "3px",
                                                            cursor: "pointer",
                                                            fontSize: "11px"
                                                        }}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div style={{
                            marginTop: "20px",
                            display: "flex",
                            justifyContent: "center",
                            gap: "5px"
                        }}>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: currentPage === index ? "#337ab7" : "#fff",
                                        color: currentPage === index ? "#fff" : "#333",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "14px"
                                    }}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
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
                                    <th style={{ padding: "8px", textAlign: "center", width: "60px", minWidth: "60px", fontSize: "12px", whiteSpace: "nowrap" }}>번호</th>
                                    <th style={{ padding: "8px", textAlign: "left", width: "25%", fontSize: "12px" }}>게시글</th>
                                    <th style={{ padding: "8px", textAlign: "left", width: "35%", fontSize: "12px" }}>댓글 내용</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "15%", fontSize: "12px" }}>작성자</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "15%", fontSize: "12px" }}>작성일</th>
                                    <th style={{ padding: "8px", textAlign: "center", width: "60px", minWidth: "60px", fontSize: "12px", whiteSpace: "nowrap" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{
                                            padding: "30px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
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
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {comments.length - index}
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <Link
                                                    to={`/board/post/${comment.postSeq}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "#337ab7",
                                                        fontSize: "13px"
                                                    }}
                                                >
                                                    {comment.postTitle}
                                                </Link>
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                color: "#333",
                                                fontSize: "13px"
                                            }}>
                                                {comment.commentContent.length > 50
                                                    ? comment.commentContent.substring(0, 50) + "..."
                                                    : comment.commentContent}
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {comment.memberNickname || comment.memberId}
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: "12px"
                                            }}>
                                                {new Date(comment.createdDate).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center"
                                            }}>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.commentSeq)}
                                                    style={{
                                                        padding: "3px 6px",
                                                        backgroundColor: "#dc3545",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "3px",
                                                        cursor: "pointer",
                                                        fontSize: "11px"
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
                <BoardSettingsTab 
                    board={board} 
                    boardSeq={boardSeq}
                    onUpdate={fetchBoardDetail}
                />
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

export default BoardManage;

