import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function BoardCreateForm() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);
    
    const [formData, setFormData] = useState({
        boardName: "",
        boardDescription: "",
        boardType: "일반",
        boardCategory: "",
        isActive: "Y",
        displayOrder: 0,
        noticeDisplayCount: 5
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
    }, [navigate]);

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

    // 폼 유효성 검사
    const validateForm = () => {
        if(!formData.boardName || formData.boardName.trim() === "") {
            setError("게시판명을 입력해주세요.");
            return false;
        }
        if(!formData.boardType || (formData.boardType !== "일반" && formData.boardType !== "공구이벤트" && formData.boardType !== "질문게시판")) {
            setError("게시판 타입을 선택해주세요.");
            return false;
        }
        return true;
    };

    // 게시판 생성
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if(!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch("http://localhost:8080/board/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "게시판이 생성되었습니다.");
                navigate("/manager/managerInfo");
            } else {
                setError(data.msg || "게시판 생성에 실패했습니다.");
            }
        } catch(err) {
            console.error("게시판 생성 오류:", err);
            setError("게시판 생성 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
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
                게시판 생성
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
                        게시판명 <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="boardName"
                        value={formData.boardName}
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
                        placeholder="게시판명을 입력하세요"
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        게시판 설명
                    </label>
                    <textarea
                        name="boardDescription"
                        value={formData.boardDescription}
                        onChange={handleChange}
                        maxLength={500}
                        rows={4}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            resize: "vertical"
                        }}
                        placeholder="게시판 설명을 입력하세요"
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        게시판 타입 <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                        name="boardType"
                        value={formData.boardType}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    >
                        <option value="일반">일반 게시판</option>
                        <option value="공구이벤트">공구이벤트 게시판</option>
                        <option value="질문게시판">질문게시판 (댓글로만 구성)</option>
                    </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        게시판 카테고리
                    </label>
                    <input
                        type="text"
                        name="boardCategory"
                        value={formData.boardCategory}
                        onChange={handleChange}
                        maxLength={50}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                        placeholder="카테고리를 입력하세요 (선택사항)"
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
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

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        상단 노출 공지사항 개수
                    </label>
                    <input
                        type="number"
                        name="noticeDisplayCount"
                        value={formData.noticeDisplayCount}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive === "Y"}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                isActive: e.target.checked ? "Y" : "N"
                            }))}
                            style={{ width: "18px", height: "18px" }}
                        />
                        활성화
                    </label>
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
                        {loading ? "생성 중..." : "게시판 생성"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/manager/managerInfo")}
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

export default BoardCreateForm;

