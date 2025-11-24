import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function PostView() {
    const navigate = useNavigate();
    const { postSeq } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [board, setBoard] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [managerIds, setManagerIds] = useState(new Set()); // 관리자 ID 목록
    const [isManager, setIsManager] = useState(false); // 현재 사용자가 관리자인지

    useEffect(() => {
        if(postSeq) {
            fetchPostDetail();
        }
        // 현재 사용자가 관리자인지 확인
        const managerId = sessionStorage.getItem("managerId");
        setIsManager(!!managerId);
    }, [postSeq]);

    // 게시글 상세 조회
    const fetchPostDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/board/post/detail?postSeq=${postSeq}`);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                setPost(data.post);
                
                // 게시판 정보 조회
                if(data.post.boardSeq) {
                    fetchBoardDetail(data.post.boardSeq);
                }
                
                // 작성자 확인
                const memId = sessionStorage.getItem("memId");
                setIsOwner(memId === data.post.memberId);
                
                // 댓글 목록 조회
                fetchComments();
            } else {
                setError(data.msg || "게시글을 찾을 수 없습니다.");
            }
        } catch(err) {
            console.error("게시글 조회 오류:", err);
            setError("게시글을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 댓글 목록 조회
    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:8080/board/comment/list?postSeq=${postSeq}`);
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

        // 관리자 ID 우선 확인
        const managerId = sessionStorage.getItem("managerId");
        const memId = sessionStorage.getItem("memId");
        
        let memberIdToUse = null;
        if(managerId) {
            memberIdToUse = managerId; // 관리자는 managerId 사용
        } else if(memId) {
            memberIdToUse = memId; // 일반 회원은 memId 사용
        }
        
        if(!memberIdToUse) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/comment/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postSeq: parseInt(postSeq),
                    memberId: memberIdToUse,
                    commentContent: commentContent.trim()
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                setCommentContent("");
                fetchComments();
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
                fetchComments();
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
                fetchComments();
            } else {
                alert(data.msg || "댓글 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("댓글 삭제 오류:", err);
            alert("댓글 삭제 중 오류가 발생했습니다.");
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
            console.error("게시판 정보 조회 오류:", err);
        }
    };

    // 게시글 삭제
    const handleDelete = async () => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/post/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ postSeq: parseInt(postSeq) })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "게시글이 삭제되었습니다.");
                navigate(`/board/${post?.boardSeq}/posts`);
            } else {
                alert(data.msg || "게시글 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시글 삭제 오류:", err);
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    if(loading) {
        return (
            <div style={{
                maxWidth: "800px",
                margin: "auto",
                padding: "20px",
                marginTop: "70px",
                textAlign: "center"
            }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if(error || !post) {
        return (
            <div style={{
                maxWidth: "800px",
                margin: "auto",
                padding: "20px",
                marginTop: "70px"
            }}>
                <div style={{
                    padding: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    textAlign: "center"
                }}>
                    {error || "게시글을 찾을 수 없습니다."}
                </div>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        onClick={() => navigate("/board/list")}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        게시판 목록으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "800px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            {/* 게시판 정보 */}
            {board && (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <Link
                        to={`/board/${board.boardSeq}/posts`}
                        style={{
                            color: "#337ab7",
                            textDecoration: "none",
                            fontWeight: "bold"
                        }}
                    >
                        ← {board.boardName}
                    </Link>
                </div>
            )}

            {/* 게시글 정보 */}
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "30px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                    borderBottom: "2px solid #337ab7",
                    paddingBottom: "15px"
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        {post.postTitle}
                    </h2>
                    {comments.some(c => managerIds.has(c.memberId)) && (
                        <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold"
                        }}>
                            답변완료
                        </span>
                    )}
                </div>

                <div style={{
                    marginBottom: "30px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px"
                }}>
                    <div>
                        <strong>작성자:</strong> {post.memberId}
                    </div>
                    <div>
                        <strong>작성일:</strong> {new Date(post.createdDate).toLocaleString()}
                    </div>
                    <div>
                        <strong>조회수:</strong> {post.viewCount || 0}
                    </div>
                </div>

                <div style={{
                    minHeight: "300px",
                    lineHeight: "1.8",
                    color: "#333",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                }}>
                    {post.postContent}
                </div>

                {/* 수정/삭제 버튼 (작성자만) */}
                {isOwner && (
                    <div style={{
                        marginTop: "30px",
                        paddingTop: "20px",
                        borderTop: "1px solid #dee2e6",
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end"
                    }}>
                        <Link
                            to={`/board/post/${postSeq}/modify`}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#337ab7",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontSize: "14px"
                            }}
                        >
                            수정
                        </Link>
                        <button
                            onClick={handleDelete}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            삭제
                        </button>
                    </div>
                )}
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
                            const isManagerComment = managerIds.has(comment.memberId); // 관리자 댓글인지 확인
                            
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
                                                    {isManagerComment && (
                                                        <span style={{
                                                            display: "inline-block",
                                                            padding: "2px 8px",
                                                            backgroundColor: "#337ab7",
                                                            color: "#fff",
                                                            borderRadius: "4px",
                                                            fontSize: "11px",
                                                            fontWeight: "bold"
                                                        }}>
                                                            답변
                                                        </span>
                                                    )}
                                                    <strong style={{ color: isManagerComment ? "#337ab7" : "#333" }}>
                                                        {comment.memberId}
                                                    </strong>
                                                    <span style={{
                                                        marginLeft: "10px",
                                                        fontSize: "12px",
                                                        color: "#999"
                                                    }}>
                                                        {new Date(comment.createdDate).toLocaleString()}
                                                    </span>
                                                </div>
                                                {(isCommentOwner || isManager) && (
                                                    <div>
                                                        <button
                                                            onClick={() => handleEditStart(comment)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#337ab7",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                cursor: "pointer",
                                                                marginRight: "5px"
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
                                                color: "#333",
                                                lineHeight: "1.6",
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

            {/* 목록으로 버튼 */}
            <div style={{
                marginTop: "30px",
                textAlign: "center"
            }}>
                <button
                    onClick={() => navigate(`/board/${post.boardSeq}/posts`)}
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

export default PostView;

