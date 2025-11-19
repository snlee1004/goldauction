import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function ImageboardList() {
    const [pg, setPg] = useState(0);
    const [totalP, setTotalP] = useState(0);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(3);
    const [imageboardList, setImageboardList] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태
    const [selectedCategory, setSelectedCategory] = useState(""); // 카테고리 상태
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = queryParams.get("pg") || 1;
        const keyword = queryParams.get("keyword") || ""; // URL에서 검색어 가져오기
        const category = queryParams.get("category") || ""; // URL에서 카테고리 가져오기
        setSearchKeyword(keyword);
        setSelectedCategory(category);
        // 목록 + 페이징 데이터 가져오기
        fetchBoardData(Number(page), keyword, category);
    }, [location]);

    // 검색어, 카테고리와 페이지를 포함해서 데이터 가져오기
    const fetchBoardData = async (page, keyword = "", category = "") => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/imageboard/imageboardList?pg=${page}`;
            // 검색어가 있으면 쿼리 파라미터에 추가
            if(keyword && keyword.trim() !== "") {
                url += `&keyword=${encodeURIComponent(keyword.trim())}`;
            }
            // 카테고리가 있으면 쿼리 파라미터에 추가
            if(category && category.trim() !== "") {
                url += `&category=${encodeURIComponent(category.trim())}`;
            }
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if(data.rt === "OK") {
                setPg(data.pg || 1);
                setTotalP(data.totalP || 0);
                setStartPage(data.startPage || 1);
                setEndPage(data.endPage || 1);
                // 입찰 데이터가 포함된 목록 설정
                const items = data.items || [];
                console.log("목록 데이터:", items); // 디버깅용
                setImageboardList(items);
            } else {
                setError("데이터를 불러오는데 실패했습니다.");
                setImageboardList([]);
            }
        } catch(err) {
            console.error("목록 조회 오류:", err);
            setError("목록을 불러오는 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.");
            setImageboardList([]);
        } finally {
            setLoading(false);
        }
    };

    // 검색 처리 함수
    const handleSearch = () => {
        const keyword = searchKeyword.trim();
        const category = selectedCategory;
        // 검색 시 첫 페이지로 이동하고 URL 업데이트
        // URL 변경 시 useEffect가 자동으로 데이터를 가져옴
        let url = `/imageboard/imageboardList?pg=1`;
        if(keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if(category) {
            url += `&category=${encodeURIComponent(category)}`;
        }
        navigate(url);
    };

    // 엔터키로 검색
    const handleKeyPress = (e) => {
        if(e.key === "Enter") {
            handleSearch();
        }
    };

    // 페이지 변경 처리
    const handlePageChange = (page) => {
        const queryParams = new URLSearchParams(location.search);
        const keyword = queryParams.get("keyword") || "";
        const category = queryParams.get("category") || "";
        // URL 업데이트 (useEffect가 자동으로 데이터를 가져옴)
        let url = `/imageboard/imageboardList?pg=${page}`;
        if(keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if(category) {
            url += `&category=${encodeURIComponent(category)}`;
        }
        navigate(url);
    };

    const renderPagination = () => {
        const pages = [];
        for(let i=startPage; i<=endPage; i++) {
            pages.push(
                <span key={i}
                    style={{
                        margin: "0 5px", 
                        cursor: "pointer",
                        color: i===pg ? "red" : "blue",
                        fontSize: "14px"
                    }}
                    onClick={() => handlePageChange(i)}>{i}</span>
            );
        }

        return (
            <div style={{textAlign: "center", marginTop: "20px"}}>
                {/* 이전 버튼 */}
                {startPage > 1 && (
                    <span
                        style={{
                            cursor: "pointer",
                            color: "blue",
                            marginRight: "5px",
                            fontSize: "14px"
                        }}
                        onClick={() => handlePageChange(startPage - 1)}
                    >이전</span>
                )}
                {pages}
                {/* 다음 버튼 */}
                {endPage < totalP && (
                    <span style={{
                        cursor: "pointer", 
                        color: "blue",
                        marginLeft: "5px",
                        fontSize: "14px"
                    }}
                    onClick={()=>handlePageChange(endPage+1)}>다음</span>
                )}
            </div>
        );
    };

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px"}}>
            {/* 에러 메시지 */}
            {error && (
                <div style={{
                    padding: "15px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: "4px",
                    color: "#721c24",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}
            
            {/* 로딩 메시지 */}
            {loading && (
                <div style={{
                    padding: "15px",
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    <i className="bi bi-arrow-repeat" style={{animation: "spin 1s linear infinite"}}></i> 로딩 중...
                </div>
            )}
            
            {/* 카테고리 선택 및 검색 입력창 */}
            <div style={{width: "100%", margin: "20px auto", display: "flex", gap: "10px", alignItems: "center"}}>
                <select
                    className="form-control"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{width: "150px"}}
                >
                    <option value="">전체 카테고리</option>
                    <option value="골드">골드</option>
                    <option value="실버">실버</option>
                    <option value="백금">백금</option>
                    <option value="다이아">다이아</option>
                    <option value="귀금속">귀금속</option>
                    <option value="주화">주화</option>
                    <option value="금은정련">금은정련</option>
                    <option value="유가증권">유가증권</option>
                </select>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="상품명으로 검색..." 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{flex: 1}}
                />
                <button 
                    className="btn btn-primary" 
                    onClick={handleSearch}
                >
                    <i className="bi bi-search"></i> 검색
                </button>
            </div>
            
            {/* 테이블 */}
            <div style={{
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                <table className="table" style={{margin: 0, width: "100%"}}>
                    <thead>
                        <tr style={{backgroundColor: "#b3d9ff", textAlign: "center"}}>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "100px"}}>상품코드</th>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>이미지</th>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle"}}>상품명</th>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap"}}>입찰가</th>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "120px"}}>종료일</th>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", width: "80px", verticalAlign: "middle"}}>입찰수</th>
                            <th style={{padding: "12px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "80px"}}>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imageboardList.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="7" style={{padding: "40px", textAlign: "center", color: "#666"}}>
                                    등록된 경매 상품이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            imageboardList.map(dto => {
                                // 상태에 따른 링크 결정
                                const status = dto.status || "진행중";
                                const isCanceled = status === "포기";
                                const isCompleted = status === "종료" || status === "판매완료";
                                
                                // 포기된 경매는 포기된 경매 상세 페이지로, 그 외는 일반 상세 페이지로
                                const viewPath = isCanceled 
                                    ? `/imageboard/imageboardCanceledView?seq=${dto.seq}&pg=${pg}`
                                    : `/imageboard/imageboardView?seq=${dto.seq}&pg=${pg}`;
                                
                                // 상태 표시 스타일
                                const getStatusStyle = () => {
                                    if(status === "포기") {
                                        return {color: "#d9534f", fontWeight: "bold"};
                                    } else if(status === "종료" || status === "판매완료") {
                                        return {color: "#5cb85c", fontWeight: "bold"};
                                    } else {
                                        return {color: "#337ab7", fontWeight: "bold"};
                                    }
                                };
                                
                                return (
                                    <tr key={dto.seq} style={{textAlign: "center", backgroundColor: "#fff"}}>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            <div style={{whiteSpace: "nowrap"}}>{dto.seq}</div>
                                            {dto.category && (
                                                <div style={{fontSize: "12px", color: "#666", marginTop: "4px", whiteSpace: "nowrap"}}>
                                                    {dto.category}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            <Link to={viewPath} style={{display: "inline-block"}}>
                                                {dto.image1 ? (
                                                    <img 
                                                        src={`http://localhost:8080/storage/${dto.image1}`}
                                                        alt={dto.imagename}
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
                                                        borderRadius: "4px",
                                                        margin: "0 auto"
                                                    }}>
                                                        <i className="bi bi-image" style={{color: "#999", fontSize: "32px"}}></i>
                                                    </div>
                                                )}
                                            </Link>
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle"}}>
                                            <Link 
                                                to={viewPath}
                                                style={{textDecoration: "none", color: "#333"}}
                                            >
                                                {dto.imagename}
                                            </Link>
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap"}}>
                                            {(() => {
                                                const maxBid = dto.maxBidAmount !== undefined && dto.maxBidAmount !== null ? Number(dto.maxBidAmount) : 0;
                                                if(maxBid > 0) {
                                                    return (
                                                        <span style={{color: "#d9534f", fontWeight: "bold"}}>
                                                            {maxBid.toLocaleString()}원
                                                        </span>
                                                    );
                                                } else {
                                                    const startPrice = dto.imageprice !== undefined && dto.imageprice !== null ? Number(dto.imageprice) : 0;
                                                    return <span>{startPrice.toLocaleString()}원</span>;
                                                }
                                            })()}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "120px"}}>
                                            {(() => {
                                                const endDateStr = dto.auctionEndDate || dto.endDate;
                                                if(!endDateStr || endDateStr === "미설정") {
                                                    return <span style={{fontSize: "0.9em"}}>미설정</span>;
                                                }
                                                
                                                try {
                                                    const endDate = new Date(endDateStr);
                                                    const year = endDate.getFullYear();
                                                    const month = endDate.getMonth() + 1;
                                                    const day = endDate.getDate();
                                                    
                                                    return (
                                                        <span style={{fontSize: "0.9em"}}>
                                                            {year}년<br />
                                                            {month}월{day}일
                                                        </span>
                                                    );
                                                } catch(e) {
                                                    return <span style={{fontSize: "0.9em"}}>{endDateStr}</span>;
                                                }
                                            })()}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", width: "80px", verticalAlign: "middle"}}>
                                            {(() => {
                                                const count = dto.bidCount !== undefined && dto.bidCount !== null ? Number(dto.bidCount) : 0;
                                                return count;
                                            })()}
                                        </td>
                                        <td style={{padding: "12px", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "80px"}}>
                                            <span style={getStatusStyle()}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이징 */}
            {renderPagination()}
        </div>
    );
}

export default ImageboardList;
