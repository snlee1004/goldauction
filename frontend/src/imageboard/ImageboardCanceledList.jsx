import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function ImageboardCanceledList() {
    const [pg, setPg] = useState(0);
    const [totalP, setTotalP] = useState(0);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(3);
    const [canceledList, setCanceledList] = useState([]);
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = queryParams.get("pg") || 1;
        // 포기된 경매 목록 데이터 가져오기
        fetchCanceledData(Number(page));
    }, [location]);

    // 포기된 경매 목록 데이터 가져오기
    const fetchCanceledData = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:8080/imageboard/canceledList?pg=${page}`;
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.list) {
                setCanceledList(data.list);
                setTotalP(data.total || 0);
                setPg(data.pg || 1);
                
                // 페이지네이션 계산
                const totalPages = data.totalPages || 1;
                const start = Math.max(1, Math.floor((data.pg - 1) / 3) * 3 + 1);
                const end = Math.min(totalPages, start + 2);
                setStartPage(start);
                setEndPage(end);
            } else {
                setCanceledList([]);
                setTotalP(0);
            }
        } catch(err) {
            console.error("포기된 경매 목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
            setCanceledList([]);
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경 처리
    const handlePageChange = (newPage) => {
        if(newPage < 1) return;
        navigate(`/imageboard/imageboardCanceledList?pg=${newPage}`);
    };

    // 페이지네이션 렌더링
    const renderPagination = () => {
        const totalPages = Math.ceil(totalP / 10);
        if(totalPages <= 1) return null;

        const pages = [];
        // 이전 버튼
        if(startPage > 1) {
            pages.push(
                <button
                    key="prev"
                    onClick={() => handlePageChange(startPage - 1)}
                    style={{
                        padding: "5px 10px",
                        margin: "0 2px",
                        border: "1px solid #ddd",
                        backgroundColor: "#fff",
                        cursor: "pointer"
                    }}
                >
                    이전
                </button>
            );
        }

        // 페이지 번호
        for(let i = startPage; i <= endPage && i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    style={{
                        padding: "5px 10px",
                        margin: "0 2px",
                        border: "1px solid #ddd",
                        backgroundColor: i === pg ? "#8b5cf6" : "#fff",
                        color: i === pg ? "#fff" : "#000",
                        cursor: "pointer"
                    }}
                >
                    {i}
                </button>
            );
        }

        // 다음 버튼
        if(endPage < totalPages) {
            pages.push(
                <button
                    key="next"
                    onClick={() => handlePageChange(endPage + 1)}
                    style={{
                        padding: "5px 10px",
                        margin: "0 2px",
                        border: "1px solid #ddd",
                        backgroundColor: "#fff",
                        cursor: "pointer"
                    }}
                >
                    다음
                </button>
            );
        }

        return <div style={{textAlign: "center", marginTop: "20px"}}>{pages}</div>;
    };

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px"}}>
            <h3 style={{marginBottom: "20px", textAlign: "center"}}>포기된 경매 목록</h3>
            
            {loading && (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && (
                <div style={{textAlign: "center", padding: "20px", color: "#d9534f"}}>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div style={{borderRadius: "8px", overflow: "hidden"}}>
                    <table style={{margin: 0, width: "100%"}}>
                        <thead>
                            <tr style={{backgroundColor: "#b3d9ff"}}>
                                <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>상품코드</th>
                                <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>이미지</th>
                                <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>상품명</th>
                                <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>입찰가</th>
                                <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>입찰종료일</th>
                                <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {canceledList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{padding: "20px", textAlign: "center"}}>
                                        등록된 포기된 경매 상품이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                canceledList.map((dto) => (
                                    <tr key={dto.seq} style={{borderBottom: "1px solid #eee"}}>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            <div>{dto.seq}</div>
                                            {dto.category && (
                                                <div style={{fontSize: "12px", color: "#666", marginTop: "4px"}}>
                                                    {dto.category}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            {dto.image1 ? (
                                                <img
                                                    src={`http://localhost:8080/storage/${dto.image1}`}
                                                    alt="상품 이미지"
                                                    style={{width: "120px", height: "120px", objectFit: "cover", borderRadius: "4px"}}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    backgroundColor: "#f0f0f0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "4px"
                                                }}>
                                                    <i className="bi bi-image" style={{fontSize: "32px", color: "#999"}}></i>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            <Link
                                                to={`/imageboard/imageboardCanceledView?seq=${dto.seq}&pg=${pg}`}
                                                style={{textDecoration: "none", color: "#000"}}
                                            >
                                                {dto.imagename || dto.productname || "-"}
                                            </Link>
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            ₩ {(dto.maxBidAmount > 0 ? dto.maxBidAmount : dto.imageprice || 0).toLocaleString()}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            {dto.auctionEndDate ? new Date(dto.auctionEndDate).toLocaleDateString() : "-"}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            <span style={{color: "#d9534f", fontWeight: "bold"}}>포기</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {renderPagination()}

            <div style={{textAlign: "center", marginTop: "20px"}}>
                <button className="btn btn-secondary" onClick={() => navigate("/imageboard/imageboardList")}>
                    <i className="bi bi-list"></i> 일반 경매 목록
                </button>
            </div>
        </div>
    );
}

export default ImageboardCanceledList;

