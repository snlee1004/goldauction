import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function PopupManage() {
    const [popupList, setPopupList] = useState([]);
    const [selectedPopupSeq, setSelectedPopupSeq] = useState(null);
    const [popupForm, setPopupForm] = useState({
        popupSeq: 0,
        popupTitle: "",
        popupContent: "",
        backgroundImage: "",
        isVisible: "N",
        popupType: "공지사항",
        startDate: "",
        endDate: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
        fetchPopupList();
    }, [navigate]);

    // 팝업 목록 조회
    const fetchPopupList = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/popup/list");
            const data = await response.json();
            
            if(data.rt === "OK") {
                setPopupList(data.items || []);
            } else {
                setError(data.msg || "팝업 목록을 불러오는데 실패했습니다.");
                setPopupList([]);
            }
        } catch(err) {
            console.error("팝업 목록 조회 오류:", err);
            setError("팝업 목록 조회 중 오류가 발생했습니다.");
            setPopupList([]);
        } finally {
            setLoading(false);
        }
    };

    // 이미지 파일 선택
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readFileAsDataURL(file);
        }
    };

    // 팝업 저장
    const handleSave = async (e) => {
        e.preventDefault();
        
        if(!popupForm.popupTitle || popupForm.popupTitle.trim() === "") {
            alert("팝업 제목을 입력하세요.");
            return;
        }
        
        try {
            // FormData를 사용하여 파일과 데이터를 함께 전송
            const formData = new FormData();
            formData.append("popupSeq", popupForm.popupSeq || 0);
            formData.append("popupTitle", popupForm.popupTitle);
            formData.append("popupContent", popupForm.popupContent || "");
            formData.append("backgroundImage", popupForm.backgroundImage || "");
            formData.append("isVisible", popupForm.isVisible || "N");
            formData.append("popupType", popupForm.popupType || "공지사항");
            if(popupForm.startDate) {
                formData.append("startDate", popupForm.startDate);
            }
            if(popupForm.endDate) {
                formData.append("endDate", popupForm.endDate);
            }
            if(imageFile) {
                formData.append("imageFile", imageFile);
            }
            
            const response = await fetch("http://localhost:8080/popup/save", {
                method: "POST",
                body: formData
                // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 설정)
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("팝업이 저장되었습니다.");
                fetchPopupList();
                handleReset();
            } else {
                alert(data.msg || "팝업 저장에 실패했습니다.");
            }
        } catch(err) {
            console.error("팝업 저장 오류:", err);
            alert("팝업 저장 중 오류가 발생했습니다.");
        }
    };

    // 팝업 수정 (선택한 팝업 정보를 폼에 로드)
    const handleEdit = (popup) => {
        setPopupForm({
            popupSeq: popup.popupSeq,
            popupTitle: popup.popupTitle || "",
            popupContent: popup.popupContent || "",
            backgroundImage: popup.backgroundImage || "",
            isVisible: popup.isVisible || "N",
            popupType: popup.popupType || "공지사항",
            startDate: popup.startDate ? new Date(popup.startDate).toISOString().split('T')[0] : "",
            endDate: popup.endDate ? new Date(popup.endDate).toISOString().split('T')[0] : ""
        });
        setSelectedPopupSeq(popup.popupSeq);
        setImagePreview(popup.backgroundImage ? `http://localhost:8080/storage/${popup.backgroundImage}` : null);
    };

    // 폼 초기화
    const handleReset = () => {
        setPopupForm({
            popupSeq: 0,
            popupTitle: "",
            popupContent: "",
            backgroundImage: "",
            isVisible: "N",
            popupType: "공지사항",
            startDate: "",
            endDate: ""
        });
        setSelectedPopupSeq(null);
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // 팝업 삭제
    const handleDelete = async (popupSeq) => {
        if(!window.confirm("정말로 이 팝업을 삭제하시겠습니까?")) {
            return;
        }
        
        try {
            const response = await fetch("http://localhost:8080/popup/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ popupSeq: popupSeq })
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("팝업이 삭제되었습니다.");
                fetchPopupList();
                if(selectedPopupSeq === popupSeq) {
                    handleReset();
                }
            } else {
                alert(data.msg || "팝업 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("팝업 삭제 오류:", err);
            alert("팝업 삭제 중 오류가 발생했습니다.");
        }
    };

    // 노출/비노출 상태 변경
    const handleToggleVisibility = async (popupSeq, currentVisibility) => {
        const newVisibility = currentVisibility === "Y" ? "N" : "Y";
        
        try {
            const response = await fetch("http://localhost:8080/popup/updateVisibility", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    popupSeq: popupSeq,
                    isVisible: newVisibility
                })
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert(data.msg || (newVisibility === "Y" ? "팝업이 노출됩니다." : "팝업이 비노출됩니다."));
                fetchPopupList();
            } else {
                alert(data.msg || "팝업 상태 변경에 실패했습니다.");
            }
        } catch(err) {
            console.error("팝업 상태 변경 오류:", err);
            alert("팝업 상태 변경 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="container" style={{
            maxWidth: "1200px", 
            margin: "auto", 
            padding: "20px", 
            marginTop: "70px", 
            paddingTop: "10px"
        }}>
            <h2 style={{
                textAlign: "center",
                marginBottom: "30px",
                fontSize: "24px",
                fontWeight: "bold"
            }}>
                팝업창 관리
            </h2>

            {error && (
                <div style={{
                    padding: "15px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#721c24",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px"
            }}>
                {/* 왼쪽: 팝업 목록 */}
                <div style={{
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px"
                }}>
                    <h3 style={{
                        marginBottom: "15px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#337ab7",
                        borderBottom: "2px solid #337ab7",
                        paddingBottom: "10px"
                    }}>
                        팝업 목록
                    </h3>

                    {loading && (
                        <div style={{textAlign: "center", padding: "20px"}}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    <div style={{
                        maxHeight: "500px",
                        overflowY: "auto"
                    }}>
                        {popupList.length === 0 ? (
                            <div style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#666"
                            }}>
                                등록된 팝업이 없습니다.
                            </div>
                        ) : (
                            <table style={{width: "100%", margin: 0}}>
                                <thead style={{
                                    position: "sticky",
                                    top: 0,
                                    backgroundColor: "#b3d9ff",
                                    zIndex: 1
                                }}>
                                    <tr>
                                        <th style={{
                                            padding: "8px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            textAlign: "center"
                                        }}>번호</th>
                                        <th style={{
                                            padding: "8px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            textAlign: "center"
                                        }}>제목</th>
                                        <th style={{
                                            padding: "8px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            textAlign: "center"
                                        }}>상태</th>
                                        <th style={{
                                            padding: "8px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            textAlign: "center"
                                        }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {popupList.map(popup => (
                                        <tr 
                                            key={popup.popupSeq}
                                            style={{
                                                backgroundColor: selectedPopupSeq === popup.popupSeq ? "#e7f3ff" : "transparent",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleEdit(popup)}
                                        >
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                fontSize: "12px"
                                            }}>{popup.popupSeq}</td>
                                            <td style={{
                                                padding: "8px",
                                                fontSize: "12px"
                                            }}>{popup.popupTitle || "-"}</td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center",
                                                fontSize: "12px"
                                            }}>
                                                <span style={{
                                                    color: popup.isVisible === "Y" ? "#5cb85c" : "#999",
                                                    fontWeight: "bold"
                                                }}>
                                                    {popup.isVisible === "Y" ? "노출" : "비노출"}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: "8px",
                                                textAlign: "center"
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleVisibility(popup.popupSeq, popup.isVisible);
                                                    }}
                                                    className="btn btn-sm"
                                                    style={{
                                                        padding: "4px 8px",
                                                        fontSize: "11px",
                                                        marginRight: "5px",
                                                        backgroundColor: popup.isVisible === "Y" ? "#d9534f" : "#5cb85c",
                                                        borderColor: popup.isVisible === "Y" ? "#d9534f" : "#5cb85c",
                                                        color: "#fff"
                                                    }}
                                                >
                                                    {popup.isVisible === "Y" ? "비노출" : "노출"}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(popup.popupSeq);
                                                    }}
                                                    className="btn btn-sm btn-danger"
                                                    style={{
                                                        padding: "4px 8px",
                                                        fontSize: "11px"
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 팝업 편집 폼 */}
                <div style={{
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px"
                }}>
                    <h3 style={{
                        marginBottom: "15px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#337ab7",
                        borderBottom: "2px solid #337ab7",
                        paddingBottom: "10px"
                    }}>
                        {selectedPopupSeq ? "팝업 수정" : "팝업 생성"}
                    </h3>

                    <form onSubmit={handleSave}>
                        <div style={{marginBottom: "15px"}}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "13px",
                                fontWeight: "bold"
                            }}>
                                팝업 제목 <span style={{color: "red"}}>*</span>
                            </label>
                            <input
                                type="text"
                                value={popupForm.popupTitle}
                                onChange={(e) => setPopupForm({...popupForm, popupTitle: e.target.value})}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "13px"
                                }}
                            />
                        </div>

                        <div style={{marginBottom: "15px"}}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "13px",
                                fontWeight: "bold"
                            }}>
                                팝업 타입
                            </label>
                            <select
                                value={popupForm.popupType}
                                onChange={(e) => setPopupForm({...popupForm, popupType: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "13px"
                                }}
                            >
                                <option value="이벤트">이벤트</option>
                                <option value="초특가">초특가</option>
                                <option value="공지사항">공지사항</option>
                            </select>
                        </div>

                        <div style={{marginBottom: "15px"}}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "13px",
                                fontWeight: "bold"
                            }}>
                                팝업 내용
                            </label>
                            <textarea
                                value={popupForm.popupContent}
                                onChange={(e) => setPopupForm({...popupForm, popupContent: e.target.value})}
                                rows="5"
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    resize: "vertical"
                                }}
                            />
                        </div>

                        <div style={{marginBottom: "15px"}}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "13px",
                                fontWeight: "bold"
                            }}>
                                백그라운드 이미지
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "13px"
                                }}
                            />
                            {imagePreview && (
                                <div style={{
                                    marginTop: "10px",
                                    width: "100%",
                                    height: "150px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    overflow: "hidden"
                                }}>
                                    <img
                                        src={imagePreview}
                                        alt="미리보기"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                            marginBottom: "15px"
                        }}>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontSize: "13px",
                                    fontWeight: "bold"
                                }}>
                                    노출 시작일
                                </label>
                                <input
                                    type="date"
                                    value={popupForm.startDate}
                                    onChange={(e) => setPopupForm({...popupForm, startDate: e.target.value})}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "13px"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontSize: "13px",
                                    fontWeight: "bold"
                                }}>
                                    노출 종료일
                                </label>
                                <input
                                    type="date"
                                    value={popupForm.endDate}
                                    onChange={(e) => setPopupForm({...popupForm, endDate: e.target.value})}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "13px"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px"
                        }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    backgroundColor: "#D4AF37",
                                    borderColor: "#D4AF37",
                                    color: "#000",
                                    fontSize: "13px"
                                }}
                            >
                                저장
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn btn-secondary"
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    fontSize: "13px"
                                }}
                            >
                                초기화
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 관리자 페이지로 이동 */}
            <div style={{textAlign: "center", marginTop: "20px"}}>
                <button
                    onClick={() => navigate("/manager/managerInfo")}
                    className="btn btn-secondary"
                    style={{padding: "6px 12px", fontSize: "13px"}}
                >
                    관리자 페이지로
                </button>
            </div>
        </div>
    );
}

export default PopupManage;

