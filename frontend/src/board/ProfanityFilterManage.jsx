import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ProfanityFilterManage() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);
    
    const [filterList, setFilterList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingFilter, setEditingFilter] = useState(null);
    
    const [formData, setFormData] = useState({
        profanityWord: "",
        replacementWord: "",
        filterType: "마스킹",
        isActive: "Y"
    });

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
        
        fetchFilterList();
    }, [navigate]);

    // 비속어 목록 조회
    const fetchFilterList = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = searchKeyword
                ? `http://localhost:8080/profanity/search?keyword=${encodeURIComponent(searchKeyword)}`
                : "http://localhost:8080/profanity/list";
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                setFilterList(data.list || []);
            } else {
                setError(data.msg || "비속어 목록을 불러오는 중 오류가 발생했습니다.");
            }
        } catch(err) {
            console.error("비속어 목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        fetchFilterList();
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            profanityWord: "",
            replacementWord: "",
            filterType: "마스킹",
            isActive: "Y"
        });
        setEditingFilter(null);
        setShowCreateForm(false);
    };

    // 비속어 등록
    const handleCreate = async (e) => {
        e.preventDefault();
        
        if(!formData.profanityWord.trim()) {
            alert("비속어를 입력해주세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/profanity/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "비속어 필터가 등록되었습니다.");
                resetForm();
                fetchFilterList();
            } else {
                alert(data.msg || "비속어 필터 등록에 실패했습니다.");
            }
        } catch(err) {
            console.error("비속어 등록 오류:", err);
            alert("비속어 등록 중 오류가 발생했습니다.");
        }
    };

    // 비속어 수정 시작
    const handleEditStart = (filter) => {
        setEditingFilter(filter);
        setFormData({
            profanityWord: filter.profanityWord,
            replacementWord: filter.replacementWord || "",
            filterType: filter.filterType,
            isActive: filter.isActive
        });
        setShowCreateForm(true);
    };

    // 비속어 수정
    const handleModify = async (e) => {
        e.preventDefault();
        
        if(!formData.profanityWord.trim()) {
            alert("비속어를 입력해주세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/profanity/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    filterSeq: editingFilter.filterSeq,
                    ...formData
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "비속어 필터가 수정되었습니다.");
                resetForm();
                fetchFilterList();
            } else {
                alert(data.msg || "비속어 필터 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("비속어 수정 오류:", err);
            alert("비속어 수정 중 오류가 발생했습니다.");
        }
    };

    // 비속어 삭제
    const handleDelete = async (filterSeq) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/profanity/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ filterSeq: filterSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "비속어 필터가 삭제되었습니다.");
                fetchFilterList();
            } else {
                alert(data.msg || "비속어 필터 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("비속어 삭제 오류:", err);
            alert("비속어 삭제 중 오류가 발생했습니다.");
        }
    };

    // 활성화/비활성화 토글
    const handleToggleActive = async (filterSeq, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        
        try {
            const response = await fetch("http://localhost:8080/profanity/toggle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    filterSeq: filterSeq,
                    isActive: newStatus
                })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                fetchFilterList();
            } else {
                alert(data.msg || "상태 변경에 실패했습니다.");
            }
        } catch(err) {
            console.error("상태 변경 오류:", err);
            alert("상태 변경 중 오류가 발생했습니다.");
        }
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
                비속어 필터 관리
            </h2>

            {/* 검색 영역 */}
            <div style={{
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="비속어 검색"
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
                    {searchKeyword && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchKeyword("");
                                fetchFilterList();
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
                            초기화
                        </button>
                    )}
                </form>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateForm(!showCreateForm);
                    }}
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
                    {showCreateForm ? "취소" : "+ 비속어 추가"}
                </button>
            </div>

            {/* 등록/수정 폼 */}
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
                        {editingFilter ? "비속어 수정" : "비속어 등록"}
                    </h3>
                    <form onSubmit={editingFilter ? handleModify : handleCreate}>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                비속어 <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.profanityWord}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    profanityWord: e.target.value
                                }))}
                                required
                                maxLength={100}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                                placeholder="비속어를 입력하세요"
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                대체어 (선택사항)
                            </label>
                            <input
                                type="text"
                                value={formData.replacementWord}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    replacementWord: e.target.value
                                }))}
                                maxLength={100}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                                placeholder="대체어를 입력하세요 (없으면 자동 마스킹)"
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                필터 타입 <span style={{ color: "red" }}>*</span>
                            </label>
                            <select
                                value={formData.filterType}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    filterType: e.target.value
                                }))}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                            >
                                <option value="마스킹">마스킹 (자동 필터링)</option>
                                <option value="작성불가">작성불가 (작성 차단)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                <input
                                    type="checkbox"
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
                            justifyContent: "flex-end"
                        }}>
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
                                {editingFilter ? "수정" : "등록"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
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

            {error && (
                <div style={{
                    padding: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {/* 비속어 목록 */}
            {loading ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div>
                    {filterList.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666"
                        }}>
                            등록된 비속어 필터가 없습니다.
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
                                    <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>번호</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "20%" }}>비속어</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "20%" }}>대체어</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>필터 타입</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>상태</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "25%" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterList.map((filter, index) => (
                                    <tr
                                        key={filter.filterSeq}
                                        style={{
                                            borderBottom: "1px solid #dee2e6"
                                        }}
                                    >
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666"
                                        }}>
                                            {filterList.length - index}
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            <strong>{filter.profanityWord}</strong>
                                        </td>
                                        <td style={{ padding: "12px", color: "#666" }}>
                                            {filter.replacementWord || "-"}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: filter.filterType === "작성불가" ? "#dc3545" : "#333"
                                        }}>
                                            {filter.filterType}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center"
                                        }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                backgroundColor: filter.isActive === "Y" ? "#d4edda" : "#f8d7da",
                                                color: filter.isActive === "Y" ? "#155724" : "#721c24"
                                            }}>
                                                {filter.isActive === "Y" ? "활성" : "비활성"}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center"
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                gap: "5px",
                                                justifyContent: "center"
                                            }}>
                                                <button
                                                    onClick={() => handleEditStart(filter)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        backgroundColor: "#337ab7",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(filter.filterSeq, filter.isActive)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        backgroundColor: filter.isActive === "Y" ? "#ffc107" : "#28a745",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    {filter.isActive === "Y" ? "비활성" : "활성"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(filter.filterSeq)}
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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

export default ProfanityFilterManage;

