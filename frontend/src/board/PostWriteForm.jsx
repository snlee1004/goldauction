import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function PostWriteForm() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const [searchParams] = useSearchParams();
    const loginCheckedRef = useRef(false);
    
    const [formData, setFormData] = useState({
        boardSeq: boardSeq ? parseInt(boardSeq) : null,
        memberId: "",
        postTitle: "",
        postContent: "",
        isNotice: "N"
    });
    const [isManager, setIsManager] = useState(false);
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [board, setBoard] = useState(null);

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        // 관리자 확인 (먼저 체크)
        const managerId = sessionStorage.getItem("managerId");
        const isManagerLoggedIn = !!managerId;
        setIsManager(isManagerLoggedIn);
        
        // 관리자로 로그인되어 있으면 관리자 ID 사용
        if(isManagerLoggedIn) {
            // URL 파라미터에서 공지사항 작성 모드 확인
            const isNoticeParam = searchParams.get("isNotice");
            const initialIsNotice = (isNoticeParam === "Y") ? "Y" : "N";
            
            setFormData(prev => ({ 
                ...prev, 
                memberId: managerId, // 관리자 ID를 memberId로 사용
                isNotice: initialIsNotice
            }));
        } else {
            // 관리자가 아니면 회원 로그인 체크
            const memId = sessionStorage.getItem("memId");
            if(!memId) {
                alert("로그인이 필요합니다.");
                navigate("/member/loginForm");
                return;
            }
            
            // URL 파라미터에서 공지사항 작성 모드 확인 (일반 회원은 공지사항 작성 불가)
            const isNoticeParam = searchParams.get("isNotice");
            const initialIsNotice = "N"; // 일반 회원은 공지사항 작성 불가
            
            setFormData(prev => ({ 
                ...prev, 
                memberId: memId,
                isNotice: initialIsNotice
            }));
        }
        
        // 게시판 정보 조회
        if(boardSeq) {
            fetchBoardDetail();
        }
    }, [boardSeq, navigate, searchParams]);

    // 게시판 정보 조회
    const fetchBoardDetail = async () => {
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

    // 게시글 작성
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if(!validateForm()) {
            return;
        }

        // 공지사항 작성 권한 체크 (관리자만 가능)
        if(formData.isNotice === "Y" && !isManager) {
            alert("공지사항 작성은 관리자만 가능합니다.");
            setFormData(prev => ({ ...prev, isNotice: "N" }));
            return;
        }

        setLoading(true);
        
        try {
            // 공지사항 작성 시 전용 엔드포인트 사용
            const url = formData.isNotice === "Y" && isManager 
                ? "http://localhost:8080/board/post/notice/write"
                : "http://localhost:8080/board/post/write";
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || (formData.isNotice === "Y" ? "공지사항이 작성되었습니다." : "게시글이 작성되었습니다."));
                // 관리자 모드에서 작성한 경우 게시판 관리 페이지로 이동
                const managerId = sessionStorage.getItem("managerId");
                if(managerId) {
                    navigate(`/board/${boardSeq}/manage`);
                } else {
                    navigate(`/board/${boardSeq}/posts`);
                }
            } else {
                setError(data.msg || "게시글 작성에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시글 작성 오류:", err);
            setError("게시글 작성 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

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
                {formData.isNotice === "Y" ? "📢 공지사항 작성" : "게시글 작성"}
            </h2>

            {board && (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <strong>게시판:</strong> {board.boardName}
                </div>
            )}

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

                {/* 공지사항 체크박스 (관리자만) */}
                {isManager && (
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "bold",
                            color: formData.isNotice === "Y" ? "#8B0000" : "#333"
                        }}>
                            <input
                                type="checkbox"
                                checked={formData.isNotice === "Y"}
                                disabled={formData.isNotice === "Y"} // 공지사항 작성 모드일 때 비활성화
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isNotice: e.target.checked ? "Y" : "N"
                                }))}
                                style={{ 
                                    width: "18px", 
                                    height: "18px",
                                    cursor: formData.isNotice === "Y" ? "not-allowed" : "pointer"
                                }}
                            />
                            <span style={{ 
                                color: formData.isNotice === "Y" ? "#8B0000" : "#333",
                                fontWeight: formData.isNotice === "Y" ? "bold" : "normal"
                            }}>
                                {formData.isNotice === "Y" ? "📢 공지사항으로 등록" : "공지사항으로 등록"}
                            </span>
                        </label>
                    </div>
                )}

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
                        {loading ? "작성 중..." : "작성하기"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/board/${boardSeq}/posts`)}
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

export default PostWriteForm;

