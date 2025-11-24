import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function PostModifyForm() {
    const navigate = useNavigate();
    const { postSeq } = useParams();
    const loginCheckedRef = useRef(false);
    
    const [formData, setFormData] = useState({
        postSeq: postSeq ? parseInt(postSeq) : null,
        postTitle: "",
        postContent: ""
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        // 로그인 체크
        const memId = sessionStorage.getItem("memId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        
        // 게시글 정보 조회
        if(postSeq) {
            fetchPostDetail();
        }
    }, [postSeq, navigate]);

    // 게시글 상세 조회
    const fetchPostDetail = async () => {
        setFetching(true);
        try {
            const response = await fetch(`http://localhost:8080/board/post/detail?postSeq=${postSeq}`);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                const post = data.post;
                
                // 작성자 확인
                const memId = sessionStorage.getItem("memId");
                if(memId !== post.memberId) {
                    alert("수정 권한이 없습니다.");
                    navigate(`/board/post/${postSeq}`);
                    return;
                }
                
                setFormData({
                    postSeq: post.postSeq,
                    postTitle: post.postTitle,
                    postContent: post.postContent
                });
            } else {
                setError(data.msg || "게시글을 찾을 수 없습니다.");
            }
        } catch(err) {
            console.error("게시글 조회 오류:", err);
            setError("게시글을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setFetching(false);
        }
    };

    // 입력값 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 폼 유효성 검사
    const validateForm = () => {
        if(!formData.postTitle || formData.postTitle.trim() === "") {
            setError("제목을 입력해주세요.");
            return false;
        }
        if(!formData.postContent || formData.postContent.trim() === "") {
            setError("내용을 입력해주세요.");
            return false;
        }
        return true;
    };

    // 게시글 수정
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if(!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch("http://localhost:8080/board/post/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "게시글이 수정되었습니다.");
                navigate(`/board/post/${postSeq}`);
            } else {
                setError(data.msg || "게시글 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시글 수정 오류:", err);
            setError("게시글 수정 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    if(fetching) {
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

    return (
        <div style={{
            maxWidth: "800px",
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
                게시글 수정
            </h2>

            {error && (
                <div style={{
                    padding: "10px",
                    marginBottom: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        제목 <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="postTitle"
                        value={formData.postTitle}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                        placeholder="제목을 입력하세요"
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        내용 <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                        name="postContent"
                        value={formData.postContent}
                        onChange={handleChange}
                        required
                        rows={15}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            resize: "vertical"
                        }}
                        placeholder="내용을 입력하세요"
                    />
                </div>

                <div style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    marginTop: "30px"
                }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#337ab7",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "16px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? "수정 중..." : "수정하기"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/board/post/${postSeq}`)}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostModifyForm;

