import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function ImageboardProductManage() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);
    
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({
        seq: null,
        imagename: "",
        imageprice: 0,
        imagecontent: "",
        category: ""
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
        
        fetchProductList();
    }, [navigate]);

    // 상품 목록 조회 (관리자용 - 페이지당 10개)
    const fetchProductList = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/imageboard/imageboardListForAdmin?pg=${currentPage}`;
            if(searchKeyword) {
                url += `&keyword=${encodeURIComponent(searchKeyword)}`;
            }
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                // items 배열 사용 (백엔드에서 반환하는 형식)
                const items = data.items || [];
                setProductList(items);
                
                // totalP는 이미 전체 페이지 수이므로 그대로 사용
                setTotalPages(data.totalP || 1);
            } else {
                setProductList([]);
                setTotalPages(0);
            }
        } catch(err) {
            console.error("상품 목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다.");
            setProductList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(loginCheckedRef.current) {
            fetchProductList();
        }
    }, [currentPage, searchKeyword]);

    // 상품 삭제
    const handleDelete = async (seq) => {
        if(!window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardDelete?seq=${seq}`);
            const data = await response.json();
            
            if(data.rt === "OK") {
                alert("상품이 삭제되었습니다.");
                fetchProductList();
            } else {
                alert(data.msg || "상품 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 삭제 오류:", err);
            alert("상품 삭제 중 오류가 발생했습니다.");
        }
    };

    // 판매중지 (상태를 포기로 변경)
    const handleStopSale = async (seq) => {
        if(!window.confirm("이 상품의 판매를 중지하시겠습니까? (상태가 '포기'로 변경됩니다)")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/imageboard/cancelAuction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `seq=${seq}`
            });
            
            const data = await response.json();
            
            if(data.rt === "OK") {
                alert("판매가 중지되었습니다.");
                fetchProductList();
            } else {
                alert(data.msg || "판매 중지에 실패했습니다.");
            }
        } catch(err) {
            console.error("판매 중지 오류:", err);
            alert("판매 중지 중 오류가 발생했습니다.");
        }
    };

    // 판매 재개 (상태를 진행중으로 변경)
    const handleResumeSale = async (seq) => {
        if(!window.confirm("이 상품의 판매를 재개하시겠습니까? (상태가 '진행중'으로 변경됩니다)")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/imageboard/resumeAuction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `seq=${seq}`
            });
            
            const data = await response.json();
            
            if(data.rt === "OK") {
                alert("판매가 재개되었습니다.");
                // 목록 새로고침 (현재 페이지를 다시 로드)
                // 상태 업데이트를 위해 약간의 지연 후 새로고침
                setTimeout(() => {
                    fetchProductList();
                }, 200);
            } else {
                alert(data.msg || "판매 재개에 실패했습니다.");
            }
        } catch(err) {
            console.error("판매 재개 오류:", err);
            alert("판매 재개 중 오류가 발생했습니다.");
        }
    };

    // 수정 시작
    const handleEditStart = (product) => {
        setEditingProduct(product);
        setEditFormData({
            seq: product.seq,
            imagename: product.imagename || product.productname || "",
            imageprice: product.imageprice || 0,
            imagecontent: product.imagecontent || "",
            category: product.category || ""
        });
        setShowEditForm(true);
    };

    // 수정 취소
    const handleEditCancel = () => {
        setEditingProduct(null);
        setShowEditForm(false);
        setEditFormData({
            seq: null,
            imagename: "",
            imageprice: 0,
            imagecontent: "",
            category: ""
        });
    };

    // 상품 수정
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        if(!editFormData.imagename.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("seq", editFormData.seq);
            formData.append("productName", editFormData.imagename);
            formData.append("startPrice", editFormData.imageprice.toString());
            formData.append("category", editFormData.category);
            formData.append("description", editFormData.imagecontent);

            const response = await fetch("http://localhost:8080/imageboard/imageboardModify", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert("상품이 수정되었습니다.");
                handleEditCancel();
                fetchProductList();
            } else {
                alert(data.msg || "상품 수정에 실패했습니다.");
            }
        } catch(err) {
            console.error("상품 수정 오류:", err);
            alert("상품 수정 중 오류가 발생했습니다.");
        }
    };

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // 검색 시 첫 페이지로
        fetchProductList();
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
                경매 상품 관리
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
                        placeholder="상품명 검색"
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
                                setCurrentPage(1);
                                fetchProductList();
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
            </div>

            {/* 수정 폼 */}
            {showEditForm && editingProduct && (
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
                        상품 수정
                    </h3>
                    <form onSubmit={handleEditSubmit}>
                        <div style={{ marginBottom: "15px" }}>
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
                                value={editFormData.imagename}
                                onChange={(e) => setEditFormData(prev => ({
                                    ...prev,
                                    imagename: e.target.value
                                }))}
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
                                color: "#333"
                            }}>
                                가격
                            </label>
                            <input
                                type="number"
                                value={editFormData.imageprice}
                                onChange={(e) => setEditFormData(prev => ({
                                    ...prev,
                                    imageprice: parseInt(e.target.value) || 0
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

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                                color: "#333"
                            }}>
                                카테고리
                            </label>
                            <input
                                type="text"
                                value={editFormData.category}
                                onChange={(e) => setEditFormData(prev => ({
                                    ...prev,
                                    category: e.target.value
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
                                value={editFormData.imagecontent}
                                onChange={(e) => setEditFormData(prev => ({
                                    ...prev,
                                    imagecontent: e.target.value
                                }))}
                                rows={4}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}
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
                                수정
                            </button>
                            <button
                                type="button"
                                onClick={handleEditCancel}
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
                                    <th style={{ padding: "12px", textAlign: "center", width: "8%", fontSize: "14px" }}>번호</th>
                                    <th style={{ padding: "12px", textAlign: "left", width: "20%", fontSize: "14px" }}>상품명</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%", fontSize: "14px" }}>최고 입찰 금액</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "10%", fontSize: "14px" }}>수량</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%", fontSize: "14px" }}>카테고리</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "12%", fontSize: "14px" }}>상태</th>
                                    <th style={{ padding: "12px", textAlign: "center", width: "26%", fontSize: "14px" }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productList.map((product, index) => (
                                    <tr
                                        key={product.seq}
                                        style={{
                                            borderBottom: "1px solid #dee2e6"
                                        }}
                                    >
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
                                        }}>
                                            {((currentPage - 1) * 10) + (productList.length - index)}
                                        </td>
                                        <td style={{ padding: "12px", fontSize: "13px" }}>
                                            <Link
                                                to={`/imageboard/imageboardView?seq=${product.seq}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "#337ab7"
                                                }}
                                            >
                                                {product.imagename || product.productname || "-"}
                                            </Link>
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
                                        }}>
                                            ₩ {((product.maxBidAmount || product.max_bid_price || 0) > 0 
                                                ? (product.maxBidAmount || product.max_bid_price || 0)
                                                : (product.imageprice || 0)).toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
                                        }}>
                                            {product.imageqty || 0}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            color: "#666",
                                            fontSize: "13px"
                                        }}>
                                            {product.category || "-"}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center"
                                        }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                backgroundColor: product.status === "진행중" ? "#d4edda" :
                                                               product.status === "판매완료" ? "#fff3cd" :
                                                               product.status === "종료" ? "#d1ecf1" : "#f8d7da",
                                                color: product.status === "진행중" ? "#155724" :
                                                      product.status === "판매완료" ? "#856404" :
                                                      product.status === "종료" ? "#0c5460" : "#721c24"
                                            }}>
                                                {product.status === "포기" ? "판매중지" : (product.status || "진행중")}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center"
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                gap: "5px",
                                                justifyContent: "center",
                                                flexWrap: "wrap"
                                            }}>
                                                {/* 수정 버튼 */}
                                                {product.status === "판매완료" || product.status === "종료" ? (
                                                    <button
                                                        disabled
                                                        style={{
                                                            padding: "4px 8px",
                                                            backgroundColor: "#e9ecef",
                                                            color: "#6c757d",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "not-allowed",
                                                            fontSize: "12px",
                                                            opacity: 0.6
                                                        }}
                                                    >
                                                        수정
                                                    </button>
                                                ) : (
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
                                                )}
                                                
                                                {/* 관리 버튼 (판매중지/판매재개/관리불가) */}
                                                {product.status === "판매완료" || product.status === "종료" ? (
                                                    <button
                                                        disabled
                                                        style={{
                                                            padding: "4px 8px",
                                                            backgroundColor: "#e9ecef",
                                                            color: "#6c757d",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "not-allowed",
                                                            fontSize: "12px",
                                                            opacity: 0.6
                                                        }}
                                                    >
                                                        관리불가
                                                    </button>
                                                ) : product.status === "포기" ? (
                                                    <button
                                                        onClick={() => handleResumeSale(product.seq)}
                                                        style={{
                                                            padding: "4px 8px",
                                                            backgroundColor: "#28a745",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        판매재개
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStopSale(product.seq)}
                                                        style={{
                                                            padding: "4px 8px",
                                                            backgroundColor: "#ffc107",
                                                            color: "#333",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        판매중지
                                                    </button>
                                                )}
                                                
                                                {/* 삭제 버튼 */}
                                                <button
                                                    onClick={() => handleDelete(product.seq)}
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "5px",
                    marginTop: "20px",
                    alignItems: "center"
                }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: "5px 10px",
                            backgroundColor: currentPage === 1 ? "#e9ecef" : "#337ab7",
                            color: currentPage === 1 ? "#999" : "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            fontSize: "14px"
                        }}
                    >
                        이전
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // 현재 페이지 주변 3페이지만 표시
                        if(totalPages <= 7 || 
                           pageNum === 1 || 
                           pageNum === totalPages || 
                           (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: currentPage === pageNum ? "#337ab7" : "#fff",
                                        color: currentPage === pageNum ? "#fff" : "#333",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "14px"
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        } else if(pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                            return (
                                <span key={pageNum} style={{ padding: "0 5px", color: "#666" }}>
                                    ...
                                </span>
                            );
                        }
                        return null;
                    })}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        style={{
                            padding: "5px 10px",
                            backgroundColor: currentPage >= totalPages ? "#e9ecef" : "#337ab7",
                            color: currentPage >= totalPages ? "#999" : "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                            fontSize: "14px"
                        }}
                    >
                        다음
                    </button>
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

export default ImageboardProductManage;

