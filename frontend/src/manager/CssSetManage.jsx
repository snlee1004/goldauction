import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CssSetManage() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);
    const [cssSetList, setCssSetList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentSet, setCurrentSet] = useState(null);

    // 관리자 권한 체크
    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        const managerId = sessionStorage.getItem("managerId");
        if(!managerId) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/manager/loginForm");
            return;
        }
    }, [navigate]);

    // 스타일셋 목록 조회
    const fetchCssSetList = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/css/set/list");
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    setCssSetList(data.items || []);
                } else {
                    alert("스타일셋 목록 조회 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                alert("스타일셋 목록 조회 중 오류가 발생했습니다.");
            }
        } catch(err) {
            console.error("스타일셋 목록 조회 오류:", err);
            alert("스타일셋 목록 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 현재 적용된 스타일셋 조회
    const fetchCurrentSet = async () => {
        try {
            const response = await fetch("http://localhost:8080/css/set/current");
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK" && data.item) {
                    setCurrentSet(data.item);
                }
            }
        } catch(err) {
            console.error("현재 스타일셋 조회 오류:", err);
        }
    };

    // default_set 초기화 (없으면 생성)
    const initializeDefaultSet = async () => {
        try {
            // default_set이 있는지 확인
            const hasDefaultSet = cssSetList.some(set => set.setName === "default_set");
            if(!hasDefaultSet) {
                const response = await fetch("http://localhost:8080/css/set/createDefault", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                
                if(response.ok) {
                    const data = await response.json();
                    if(data.rt === "OK") {
                        // 목록 새로고침
                        await fetchCssSetList();
                    }
                }
            }
        } catch(err) {
            console.error("default_set 초기화 오류:", err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchCssSetList();
            await fetchCurrentSet();
        };
        loadData();
    }, []);

    // cssSetList가 로드된 후 default_set 초기화 (한 번만 실행)
    const defaultSetInitialized = useRef(false);
    useEffect(() => {
        if(cssSetList.length > 0 && !defaultSetInitialized.current) {
            defaultSetInitialized.current = true;
            initializeDefaultSet();
        }
    }, [cssSetList.length]);

    // 스타일셋 적용
    const handleApply = async (setSeq, applyScope = "FULL") => {
        let confirmMessage = "";
        if(applyScope === "FULL") {
            confirmMessage = "전체 페이지에 이 스타일셋을 적용하시겠습니까? (member + imageboard + header + footer)";
        } else if(applyScope === "MEMBER") {
            confirmMessage = "회원 페이지에 이 스타일셋을 적용하시겠습니까? (member 폴더의 모든 jsx)";
        } else if(applyScope === "IMAGEBOARD") {
            confirmMessage = "이미지보드 페이지에 이 스타일셋을 적용하시겠습니까? (imageboard 폴더의 모든 jsx)";
        } else if(applyScope === "HEADER_FOOTER") {
            confirmMessage = "상단/하단에 이 스타일셋을 적용하시겠습니까? (layouts 안의 헤더/풋터 jsx)";
        } else {
            confirmMessage = "이 스타일셋을 적용하시겠습니까?";
        }

        if(!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/css/set/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ setSeq, applyScope })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("스타일셋이 적용되었습니다.");
                    fetchCssSetList();
                    fetchCurrentSet();
                } else {
                    alert("스타일셋 적용 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                alert("스타일셋 적용 중 오류가 발생했습니다.");
            }
        } catch(err) {
            console.error("스타일셋 적용 오류:", err);
            alert("스타일셋 적용 중 오류가 발생했습니다.");
        }
    };

    // 스타일셋 복제
    const handleCopy = async (setSeq, setName) => {
        const newSetName = prompt(`'${setName}' 스타일셋을 복제하여 새로운 스타일셋을 생성합니다.\n새 스타일셋 이름을 입력해주세요:`, `${setName}_copy`);
        if(!newSetName || newSetName.trim() === "") {
            return;
        }

        const trimmedNewName = newSetName.trim();

        // 스타일셋 이름 유효성 검사
        if(!/^[a-zA-Z0-9_]+$/.test(trimmedNewName)) {
            alert("스타일셋 이름은 영문, 숫자, 언더스코어(_)만 가능합니다.");
            return;
        }

        // 이미 존재하는 스타일셋인지 확인
        if(cssSetList.some(set => set.setName === trimmedNewName)) {
            alert("이미 존재하는 스타일셋 이름입니다. 다른 이름을 입력해주세요.");
            return;
        }

        const newSetDescription = prompt("새 스타일셋 설명을 입력하세요 (선택사항):", "");

        if(!window.confirm(`'${setName}' 스타일셋을 '${trimmedNewName}'(으)로 복제하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/css/set/copy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    sourceSetSeq: setSeq,
                    newSetName: trimmedNewName,
                    newSetDescription: newSetDescription || null
                })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    // 목록 새로고침하여 복제된 스타일셋이 바로 보이도록 함
                    await fetchCssSetList();
                    
                    // 복제된 스타일셋으로 스크롤 이동
                    setTimeout(() => {
                        const newSetSeq = data.setSeq;
                        if(newSetSeq) {
                            const element = document.querySelector(`[data-set-seq="${newSetSeq}"]`);
                            if(element) {
                                element.scrollIntoView({ behavior: "smooth", block: "center" });
                                // 복제된 항목 강조 표시
                                element.style.border = "3px solid #17a2b8";
                                element.style.boxShadow = "0 4px 12px rgba(23, 162, 184, 0.4)";
                                setTimeout(() => {
                                    element.style.border = "";
                                    element.style.boxShadow = "";
                                }, 2000);
                            }
                        }
                    }, 100);
                    
                    alert(`스타일셋 '${setName}'가 '${trimmedNewName}'(으)로 복제되었습니다.`);
                } else {
                    alert("스타일셋 복제 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                const errorText = await response.text();
                alert("스타일셋 복제 중 오류가 발생했습니다: " + errorText);
            }
        } catch(err) {
            console.error("스타일셋 복제 오류:", err);
            alert("스타일셋 복제 중 오류가 발생했습니다.");
        }
    };

    // 스타일셋 적용 해제
    const handleUnapply = async () => {
        if(!window.confirm("현재 적용된 스타일셋을 해제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/css/set/unapply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("스타일셋 적용이 해제되었습니다.");
                    fetchCssSetList();
                    fetchCurrentSet();
                } else {
                    alert("스타일셋 적용 해제 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                alert("스타일셋 적용 해제 중 오류가 발생했습니다.");
            }
        } catch(err) {
            console.error("스타일셋 적용 해제 오류:", err);
            alert("스타일셋 적용 해제 중 오류가 발생했습니다.");
        }
    };

    // 스타일셋 삭제
    const handleDelete = async (setSeq) => {
        if(!window.confirm("이 스타일셋을 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/css/set/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ setSeq })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    alert("스타일셋이 삭제되었습니다.");
                    fetchCssSetList();
                } else {
                    alert("스타일셋 삭제 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                alert("스타일셋 삭제 중 오류가 발생했습니다.");
            }
        } catch(err) {
            console.error("스타일셋 삭제 오류:", err);
            alert("스타일셋 삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px",
            paddingTop: "10px"
        }}>
            {/* 헤더 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#333"
                }}>
                    CSS 스타일셋 관리
                </h2>
                <button
                    onClick={() => navigate("/manager/cssSetEditor")}
                    className="btn btn-primary"
                    style={{
                        padding: "8px 16px",
                        fontSize: "14px"
                    }}
                >
                    <i className="bi bi-plus-circle"></i> 새 스타일셋 생성
                </button>
            </div>

            {/* 현재 적용된 스타일셋 표시 */}
            {currentSet && (
                <div style={{
                    backgroundColor: "#e7f3ff",
                    border: "2px solid #337ab7",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "30px"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}>
                            <i className="bi bi-check-circle-fill" style={{ color: "#337ab7", fontSize: "20px" }}></i>
                            <div>
                                <strong style={{ color: "#337ab7" }}>현재 적용 중:</strong> {currentSet.setName}
                                {currentSet.setDescription && (
                                    <span style={{ color: "#666", marginLeft: "10px" }}>
                                        ({currentSet.setDescription})
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleUnapply}
                            className="btn btn-warning"
                            style={{
                                padding: "6px 12px",
                                fontSize: "13px"
                            }}
                        >
                            <i className="bi bi-x-circle"></i> 적용 안하기
                        </button>
                    </div>
                </div>
            )}

            {/* 스타일셋 목록 */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">로딩 중...</span>
                    </div>
                </div>
            ) : cssSetList.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#666"
                }}>
                    등록된 스타일셋이 없습니다.
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px"
                }}>
                    {cssSetList.map(set => (
                        <div
                            key={set.setSeq}
                            data-set-seq={set.setSeq}
                            style={{
                                border: "2px solid #ddd",
                                borderRadius: "8px",
                                padding: "20px",
                                backgroundColor: "#fff",
                                boxShadow: currentSet && currentSet.setSeq === set.setSeq 
                                    ? "0 4px 8px rgba(51, 122, 183, 0.3)" 
                                    : "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {/* 스타일셋 이름 */}
                            <h3 style={{
                                margin: "0 0 10px 0",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                {set.setName}
                                {currentSet && currentSet.setSeq === set.setSeq && (
                                    <span style={{
                                        marginLeft: "10px",
                                        fontSize: "12px",
                                        color: "#337ab7",
                                        fontWeight: "normal"
                                    }}>
                                        (적용 중)
                                    </span>
                                )}
                            </h3>

                            {/* 설명 */}
                            {set.setDescription && (
                                <p style={{
                                    margin: "0 0 15px 0",
                                    fontSize: "14px",
                                    color: "#666",
                                    minHeight: "40px"
                                }}>
                                    {set.setDescription}
                                </p>
                            )}

                            {/* 상태 */}
                            <div style={{
                                marginBottom: "15px",
                                fontSize: "12px",
                                color: "#999"
                            }}>
                                상태: {set.isActive === "Y" ? "활성" : "비활성"}
                            </div>

                            {/* 버튼 그룹 */}
                            <div style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap"
                            }}>
                                <button
                                    onClick={() => navigate(`/manager/cssSetEditor?setSeq=${set.setSeq}`)}
                                    className="btn btn-sm btn-outline-primary"
                                    style={{ fontSize: "12px" }}
                                >
                                    <i className="bi bi-pencil"></i> 수정
                                </button>
                                <button
                                    onClick={() => handleCopy(set.setSeq, set.setName)}
                                    className="btn btn-sm btn-info"
                                    style={{ fontSize: "12px" }}
                                >
                                    <i className="bi bi-files"></i> 복제
                                </button>
                                {/* 적용 버튼 그룹 */}
                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
                                    <button
                                        onClick={() => handleApply(set.setSeq, "FULL")}
                                        className="btn btn-sm btn-success"
                                        style={{ fontSize: "11px", padding: "4px 8px" }}
                                        disabled={currentSet && currentSet.setSeq === set.setSeq}
                                        title="전체 적용: member + imageboard + header + footer"
                                    >
                                        <i className="bi bi-check-circle"></i> 전체적용
                                    </button>
                                    <button
                                        onClick={() => handleApply(set.setSeq, "MEMBER")}
                                        className="btn btn-sm btn-outline-success"
                                        style={{ fontSize: "11px", padding: "4px 8px" }}
                                        disabled={currentSet && currentSet.setSeq === set.setSeq}
                                        title="회원 적용: member 폴더의 모든 jsx"
                                    >
                                        <i className="bi bi-person"></i> 회원
                                    </button>
                                    <button
                                        onClick={() => handleApply(set.setSeq, "IMAGEBOARD")}
                                        className="btn btn-sm btn-outline-success"
                                        style={{ fontSize: "11px", padding: "4px 8px" }}
                                        disabled={currentSet && currentSet.setSeq === set.setSeq}
                                        title="이미지보드 적용: imageboard 폴더의 모든 jsx"
                                    >
                                        <i className="bi bi-image"></i> 이미지보드
                                    </button>
                                    <button
                                        onClick={() => handleApply(set.setSeq, "HEADER_FOOTER")}
                                        className="btn btn-sm btn-outline-success"
                                        style={{ fontSize: "11px", padding: "4px 8px" }}
                                        disabled={currentSet && currentSet.setSeq === set.setSeq}
                                        title="상단/하단 적용: layouts 안의 헤더/풋터 jsx"
                                    >
                                        <i className="bi bi-layout-text-window"></i> 상단하단
                                    </button>
                                </div>
                                
                                {/* default_set은 삭제 버튼 숨김 */}
                                {set.setName !== "default_set" && (
                                    <button
                                        onClick={() => handleDelete(set.setSeq)}
                                        className="btn btn-sm btn-danger"
                                        style={{ fontSize: "12px" }}
                                        disabled={currentSet && currentSet.setSeq === set.setSeq}
                                    >
                                        <i className="bi bi-trash"></i> 삭제
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 뒤로가기 버튼 */}
            <div style={{ marginTop: "30px", textAlign: "center" }}>
                <button
                    onClick={() => navigate("/manager/managerInfo")}
                    className="btn btn-secondary"
                >
                    <i className="bi bi-arrow-left"></i> 관리자 페이지
                </button>
            </div>
        </div>
    );
}

export default CssSetManage;

