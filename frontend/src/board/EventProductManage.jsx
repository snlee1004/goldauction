import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EventProductManage() {
    const navigate = useNavigate();
    const { boardSeq } = useParams();
    const loginCheckedRef = useRef(false);
    
    const [board, setBoard] = useState(null);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [eventStatus, setEventStatus] = useState("전체");
    
    const [formData, setFormData] = useState({
        boardSeq: boardSeq ? parseInt(boardSeq) : null,
        productName: "",
        productDescription: "",
        originalPrice: 0,
        salePrice: 0,
        stockQuantity: 0,
        endDate: "",
        endTime: "",
        deliveryInfo: "",
        eventStatus: "진행중"
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
        
        if(boardSeq) {
            fetchBoardDetail();
            fetchProductList();
        }
    }, [boardSeq, navigate, eventStatus]);

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

    // 상품 목록 조회
    const fetchProductList = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = eventStatus === "전체"
                ? `http://localhost:8080/event/product/list/all?boardSeq=${boardSeq}`
                : `http://localhost:8080/event/product/list/status?boardSeq=${boardSeq}&eventStatus=${eventStatus}`;
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                setProductList(data.list || []);
            } else {
                setError(data.msg || "상품 목록을 불러오는 중 오류가 발생했습니다.");
            }
        } catch(err) {
            console.error("상품 목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            boardSeq: boardSeq ? parseInt(boardSeq) : null,
            productName: "",
            productDescription: "",
            originalPrice: 0,
            salePrice: 0,
            stockQuantity: 0,
            endDate: "",
            endTime: "",
            deliveryInfo: "",
            eventStatus: "진행중"
        });
        setEditingProduct(null);
        setShowCreateForm(false);
    };

    // 상품 등록
    const handleCreate = async (e) => {
        e.preventDefault();
        
        if(!formData.productName.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }
        if(formData.salePrice <= 0) {
            alert("할인가를 입력해주세요.");
            return;
        }

        try {
            // 종료일시 결합
            let endDateValue = null;
            if(formData.endDate && formData.endTime) {
                endDateValue = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
            } else if(formData.endDate) {
                endDateValue = new Date(`${formData.endDate}T23:59:59`).toISOString();
            }

            const requestData = {
                ...formData,
                endDate: endDateValue
            };
            delete requestData.endTime;

            const response = await fetch("http://localhost:8080/event/product/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품이 등록되었습니다.");
                resetForm();
                fetchProductList();
            } else {
                alert(data.msg || "상품 등록에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 등록 오류:", err);
            alert("상품 등록 중 오류가 발생했습니다.");
        }
    };

    // 상품 수정 시작
    const handleEditStart = (product) => {
        setEditingProduct(product);
        
        // 종료일시 분리
        let endDate = "";
        let endTime = "";
        if(product.endDate) {
            const date = new Date(product.endDate);
            endDate = date.toISOString().split('T')[0];
            endTime = date.toTimeString().split(' ')[0].substring(0, 5);
        }
        
        setFormData({
            boardSeq: product.boardSeq,
            productName: product.productName,
            productDescription: product.productDescription || "",
            originalPrice: product.originalPrice || 0,
            salePrice: product.salePrice || 0,
            stockQuantity: product.stockQuantity || 0,
            endDate: endDate,
            endTime: endTime,
            deliveryInfo: product.deliveryInfo || "",
            eventStatus: product.eventStatus || "진행중"
        });
        setShowCreateForm(true);
    };

    // 상품 수정
    const handleModify = async (e) => {
        e.preventDefault();
        
        if(!formData.productName.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }
        if(formData.salePrice <= 0) {
            alert("할인가를 입력해주세요.");
            return;
        }

        try {
            // 종료일시 결합
            let endDateValue = null;
            if(formData.endDate && formData.endTime) {
                endDateValue = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
            } else if(formData.endDate) {
                endDateValue = new Date(`${formData.endDate}T23:59:59`).toISOString();
            }

            const requestData = {
                productSeq: editingProduct.productSeq,
                ...formData,
                endDate: endDateValue
            };
            delete requestData.endTime;

            const response = await fetch("http://localhost:8080/event/product/modify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품이 수정되었습니다.");
                resetForm();
                fetchProductList();
            } else {
                alert(data.msg || "상품 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 수정 오류:", err);
            alert("상품 수정 중 오류가 발생했습니다.");
        }
    };

    // 상품 삭제
    const handleDelete = async (productSeq) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/event/product/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productSeq: productSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품이 삭제되었습니다.");
                fetchProductList();
            } else {
                alert(data.msg || "상품 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 삭제 오류:", err);
            alert("상품 삭제 중 오류가 발생했습니다.");
        }
    };

    // 이벤트 상태 자동 업데이트
    const handleAutoUpdateStatus = async () => {
        try {
            const response = await fetch("http://localhost:8080/event/product/status/auto-update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ boardSeq: parseInt(boardSeq) })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "상품 상태가 업데이트되었습니다.");
                fetchProductList();
            } else {
                alert(data.msg || "상태 업데이트에 실패했습니다.");
            }
        } catch(err) {
            console.error("상태 업데이트 오류:", err);
            alert("상태 업데이트 중 오류가 발생했습니다.");
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
                공구이벤트 상품 관리
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
                </div>
            )}

            {/* 필터 및 버튼 영역 */}
            <div style={{
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontWeight: "bold", color: "#333" }}>상태 필터:</label>
                    <select
                        value={eventStatus}
                        onChange={(e) => setEventStatus(e.target.value)}
                        style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    >
                        <option value="전체">전체</option>
                        <option value="진행중">진행중</option>
                        <option value="마감">마감</option>
                        <option value="종료">종료</option>
                    </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handleAutoUpdateStatus}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#ffc107",
                            color: "#333",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        상태 자동 업데이트
                    </button>
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
                        {showCreateForm ? "취소" : "+ 상품 등록"}
                    </button>
                </div>
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
                        {editingProduct ? "상품 수정" : "상품 등록"}
                    </h3>
                    <form onSubmit={editingProduct ? handleModify : handleCreate}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    color: "#333"
                                }}>
                                    상품명 <span style={{ color: "red" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.productName}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        productName: e.target.value
                                    }))}
                                    required
                                    maxLength={200}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "14px"
                                    }}
                                    placeholder="상품명을 입력하세요"
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    color: "#333"
                                }}>
                                    이벤트 상태
                                </label>
                                <select
                                    value={formData.eventStatus}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        eventStatus: e.target.value
                                    }))}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "14px"
                                    }}
                                >
                                    <option value="진행중">진행중</option>
                                    <option value="마감">마감</option>
                                    <option value="종료">종료</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                상품 설명
                            </label>
                            <textarea
                                value={formData.productDescription}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    productDescription: e.target.value
                                }))}
                                rows={5}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    resize: "vertical"
                                }}
                                placeholder="상품 설명을 입력하세요"
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    color: "#333"
                                }}>
                                    정가
                                </label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        originalPrice: parseInt(e.target.value) || 0
                                    }))}
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
                                    color: "#333"
                                }}>
                                    할인가 <span style={{ color: "red" }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.salePrice}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        salePrice: parseInt(e.target.value) || 0
                                    }))}
                                    required
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
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    color: "#333"
                                }}>
                                    재고 수량
                                </label>
                                <input
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        stockQuantity: parseInt(e.target.value) || 0
                                    }))}
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
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    color: "#333"
                                }}>
                                    종료일
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        endDate: e.target.value
                                    }))}
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
                                    종료시간
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        endTime: e.target.value
                                    }))}
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

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                배송 정보
                            </label>
                            <input
                                type="text"
                                value={formData.deliveryInfo}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    deliveryInfo: e.target.value
                                }))}
                                maxLength={500}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
                                placeholder="배송 정보를 입력하세요"
                            />
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
                                {editingProduct ? "수정" : "등록"}
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

            {/* 상품 목록 */}
            {loading ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div>
                    {productList.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666"
                        }}>
                            등록된 상품이 없습니다.
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
                                    <th style={{ padding: "12px", textAlign: "center", width: "5%" }}>번호</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "20%" }}>상품명</th>
                                    <th style={{ padding: "12px", textAlign: "right", width: "10%" }}>정가</th>
                                    <th style={{ padding: "12px", textAlign: "right", width: "10%" }}>할인가</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "8%" }}>재고</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "8%" }}>판매</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%" }}>종료일시</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "10%" }}>상태</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "17%" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productList.map((product, index) => (
                                    <tr
                                        key={product.productSeq}
                                        style={{
                                            borderBottom: "1px solid #dee2e6"
                                        }}
                                    >
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666"
                                        }}>
                                            {productList.length - index}
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            <strong>{product.productName}</strong>
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "right",
                                            color: "#666"
                                        }}>
                                            ₩ {product.originalPrice?.toLocaleString() || 0}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "right",
                                            color: "#dc3545",
                                            fontWeight: "bold"
                                        }}>
                                            ₩ {product.salePrice?.toLocaleString() || 0}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: product.stockQuantity <= 0 ? "#dc3545" : "#333"
                                        }}>
                                            {product.stockQuantity || 0}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666"
                                        }}>
                                            {product.soldQuantity || 0}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
                                        }}>
                                            {product.endDate ? new Date(product.endDate).toLocaleString() : "-"}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center"
                                        }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                backgroundColor: product.eventStatus === "진행중" ? "#d4edda" :
                                                               product.eventStatus === "마감" ? "#fff3cd" : "#f8d7da",
                                                color: product.eventStatus === "진행중" ? "#155724" :
                                                      product.eventStatus === "마감" ? "#856404" : "#721c24"
                                            }}>
                                                {product.eventStatus}
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
                                                    onClick={() => handleEditStart(product)}
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
                                                    onClick={() => handleDelete(product.productSeq)}
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

export default EventProductManage;

