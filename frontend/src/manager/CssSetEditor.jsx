import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function CssSetEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const loginCheckedRef = useRef(false);
    
    const [setSeq, setSetSeq] = useState(null);
    const [setName, setSetName] = useState("");
    const [setDescription, setSetDescription] = useState("");
    const [activeTab, setActiveTab] = useState("imageboard");
    const [loading, setLoading] = useState(false);
    
    // CSS 파일 내용 상태
    const [cssFiles, setCssFiles] = useState({
        imageboard: "",
        member: "",
        header: "",
        footer: ""
    });

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

    // URL 파라미터에서 setSeq 확인
    useEffect(() => {
        const seq = searchParams.get("setSeq");
        if(seq) {
            setSetSeq(parseInt(seq));
            fetchCssSet(parseInt(seq));
        }
    }, [searchParams]);

    // 스타일셋 정보 조회
    const fetchCssSet = async (seq) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/css/set/get?setSeq=${seq}`);
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK" && data.item) {
                    setSetName(data.item.setName);
                    setSetDescription(data.item.setDescription || "");
                    fetchCssFiles(seq);
                } else {
                    alert("스타일셋을 찾을 수 없습니다.");
                    navigate("/manager/cssSetManage");
                }
            } else {
                alert("스타일셋 조회 중 오류가 발생했습니다.");
                navigate("/manager/cssSetManage");
            }
        } catch(err) {
            console.error("스타일셋 조회 오류:", err);
            alert("스타일셋 조회 중 오류가 발생했습니다.");
            navigate("/manager/cssSetManage");
        } finally {
            setLoading(false);
        }
    };

    // CSS 파일 목록 조회
    const fetchCssFiles = async (seq) => {
        try {
            const response = await fetch(`http://localhost:8080/css/file/list?setSeq=${seq}`);
            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK" && data.items) {
                    const files = {};
                    data.items.forEach(file => {
                        files[file.fileType] = file.cssContent || "";
                    });
                    setCssFiles(files);
                }
            }
        } catch(err) {
            console.error("CSS 파일 조회 오류:", err);
        }
    };

    // 스타일셋 저장
    const handleSaveSet = async () => {
        if(!setName.trim()) {
            alert("스타일셋 이름을 입력해주세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/css/set/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    setSeq: setSeq,
                    setName: setName,
                    setDescription: setDescription
                })
            });

            if(response.ok) {
                const data = await response.json();
                if(data.rt === "OK") {
                    // setSeq 확인 (기존 setSeq 또는 새로 생성된 setSeq)
                    const savedSetSeq = setSeq || (data.setSeq ? parseInt(data.setSeq) : null);
                    if(!setSeq && savedSetSeq) {
                        setSetSeq(savedSetSeq);
                        // URL 업데이트
                        window.history.replaceState({}, "", `/manager/cssSetEditor?setSeq=${savedSetSeq}`);
                    }
                    
                    // CSS 파일 저장
                    if(savedSetSeq) {
                        const cssSaveResult = await handleSaveCssFiles(savedSetSeq);
                        if(cssSaveResult) {
                            alert("스타일셋과 모든 CSS 파일이 저장되었습니다.");
                            // 저장 성공 후 관리 페이지로 이동
                            navigate("/manager/cssSetManage");
                        } else {
                            alert("스타일셋은 저장되었지만 일부 CSS 파일 저장에 실패했습니다.");
                            // 일부 실패해도 저장은 되었으므로 관리 페이지로 이동
                            navigate("/manager/cssSetManage");
                        }
                    } else {
                        alert("스타일셋은 저장되었지만 스타일셋 번호를 가져올 수 없어 CSS 파일을 저장할 수 없습니다.");
                    }
                } else {
                    alert("스타일셋 저장 실패: " + (data.msg || "알 수 없는 오류"));
                }
            } else {
                const errorText = await response.text();
                console.error("스타일셋 저장 응답 오류:", errorText);
                alert("스타일셋 저장 중 오류가 발생했습니다: HTTP " + response.status);
            }
        } catch(err) {
            console.error("스타일셋 저장 오류:", err);
            alert("스타일셋 저장 중 오류가 발생했습니다.");
        }
    };

    // CSS 파일 저장
    const handleSaveCssFiles = async (seq) => {
        const fileTypes = ["imageboard", "member", "header", "footer"];
        let successCount = 0;
        let failCount = 0;
        const failedFiles = [];
        
        for(const fileType of fileTypes) {
            try {
                const response = await fetch("http://localhost:8080/css/file/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        setSeq: seq,
                        fileName: `${fileType}.css`,
                        cssContent: cssFiles[fileType] || "",
                        fileType: fileType
                    })
                });

                if(response.ok) {
                    const data = await response.json();
                    if(data.rt === "OK") {
                        successCount++;
                        console.log(`${fileType}.css 저장 성공`);
                    } else {
                        failCount++;
                        failedFiles.push(fileType);
                        console.error(`${fileType}.css 저장 실패:`, data.msg);
                    }
                } else {
                    failCount++;
                    failedFiles.push(fileType);
                    const errorText = await response.text();
                    console.error(`${fileType}.css 저장 실패: HTTP ${response.status}`, errorText);
                }
            } catch(err) {
                failCount++;
                failedFiles.push(fileType);
                console.error(`${fileType}.css 저장 오류:`, err);
            }
        }
        
        // 저장 결과 반환 (모두 성공하면 true)
        return failCount === 0;
    };

    // CSS 내용 변경
    const handleCssChange = (fileType, value) => {
        setCssFiles(prev => ({
            ...prev,
            [fileType]: value
        }));
    };

    if(loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px", marginTop: "70px" }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "1400px",
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
                    {setSeq ? "CSS 스타일셋 수정" : "CSS 스타일셋 생성"}
                </h2>
                <button
                    onClick={() => navigate("/manager/cssSetManage")}
                    className="btn btn-secondary"
                >
                    <i className="bi bi-arrow-left"></i> 목록으로
                </button>
            </div>

            {/* 스타일셋 정보 입력 */}
            <div style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px"
            }}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        스타일셋 이름 *
                    </label>
                    <input
                        type="text"
                        value={setName}
                        onChange={(e) => setSetName(e.target.value)}
                        placeholder="예: default_set, GA_CSS_set1"
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
                        스타일셋 설명
                    </label>
                    <textarea
                        value={setDescription}
                        onChange={(e) => setSetDescription(e.target.value)}
                        placeholder="스타일셋에 대한 설명을 입력하세요"
                        rows="3"
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
            </div>

            {/* CSS 파일 편집 탭 */}
            <div style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px"
            }}>
                {/* 탭 메뉴 */}
                <div style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                    borderBottom: "2px solid #eee"
                }}>
                    {[
                        { id: "imageboard", label: "imageboard.css" },
                        { id: "member", label: "member.css" },
                        { id: "header", label: "header.css" },
                        { id: "footer", label: "footer.css" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                backgroundColor: activeTab === tab.id ? "#337ab7" : "transparent",
                                color: activeTab === tab.id ? "#fff" : "#333",
                                cursor: "pointer",
                                borderBottom: activeTab === tab.id ? "3px solid #337ab7" : "3px solid transparent",
                                fontWeight: activeTab === tab.id ? "bold" : "normal",
                                transition: "all 0.3s"
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CSS 편집기 */}
                <div>
                    <label style={{
                        display: "block",
                        marginBottom: "10px",
                        fontWeight: "bold",
                        color: "#333"
                    }}>
                        {activeTab}.css 내용
                    </label>
                    <textarea
                        value={cssFiles[activeTab] || ""}
                        onChange={(e) => handleCssChange(activeTab, e.target.value)}
                        placeholder={`/* ${activeTab}.css 내용을 입력하세요 */`}
                        rows="20"
                        style={{
                            width: "100%",
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            resize: "vertical",
                            lineHeight: "1.6"
                        }}
                    />
                    <div style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#666"
                    }}>
                        현재 탭: {activeTab}.css ({cssFiles[activeTab]?.length || 0} 글자)
                    </div>
                </div>
            </div>

            {/* 저장/취소 버튼 */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "30px"
            }}>
                <button
                    onClick={() => navigate("/manager/cssSetManage")}
                    className="btn btn-secondary"
                >
                    취소
                </button>
                <button
                    onClick={handleSaveSet}
                    className="btn btn-primary"
                >
                    <i className="bi bi-save"></i> 저장
                </button>
            </div>
        </div>
    );
}

export default CssSetEditor;

