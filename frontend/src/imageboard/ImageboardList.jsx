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
            const data = await response.json();
            
            setPg(data.pg);
            setTotalP(data.totalP);
            setStartPage(data.startPage);
            setEndPage(data.endPage);
            setImageboardList(data.items);
        } catch(err) {
            console.error(err);
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
            
            {/* 테이블 - 보라색 테두리 */}
            <div style={{
                border: "2px solid #8b5cf6",
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                <table className="table" style={{margin: 0, width: "100%"}}>
                    <thead>
                        <tr style={{backgroundColor: "#b3d9ff", textAlign: "center"}}>
                            <th style={{padding: "12px", fontWeight: "bold"}}>상품코드</th>
                            <th style={{padding: "12px", fontWeight: "bold"}}>이미지</th>
                            <th style={{padding: "12px", fontWeight: "bold"}}>상품명</th>
                            <th style={{padding: "12px", fontWeight: "bold"}}>입찰가</th>
                            <th style={{padding: "12px", fontWeight: "bold"}}>입찰종료일</th>
                            <th style={{padding: "12px", fontWeight: "bold"}}>입찰인수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imageboardList.map(dto => (
                            <tr key={dto.seq} style={{textAlign: "center", backgroundColor: "#fff"}}>
                                <td style={{padding: "12px"}}>{dto.seq}</td>
                                <td style={{padding: "12px"}}>
                                    <Link to={`/imageboard/imageboardView?seq=${dto.seq}&pg=${pg}`}>
                                        {dto.image1 ? (
                                            <img 
                                                src={`http://localhost:8080/storage/${dto.image1}`}
                                                alt={dto.imagename}
                                                style={{width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px"}}
                                            />
                                        ) : (
                                            <div style={{
                                                width: "50px", 
                                                height: "50px", 
                                                backgroundColor: "#f0f0f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "4px"
                                            }}>
                                                <i className="bi bi-image" style={{color: "#999"}}></i>
                                            </div>
                                        )}
                                    </Link>
                                </td>
                                <td style={{padding: "12px"}}>
                                    <Link 
                                        to={`/imageboard/imageboardView?seq=${dto.seq}&pg=${pg}`}
                                        style={{textDecoration: "none", color: "#333"}}
                                    >
                                        {dto.imagename}
                                    </Link>
                                </td>
                                <td style={{padding: "12px"}}>{dto.imageprice ? dto.imageprice.toLocaleString() : 0}원</td>
                                <td style={{padding: "12px"}}>
                                    {dto.auctionEndDate || dto.endDate || "미설정"}
                                </td>
                                <td style={{padding: "12px"}}>
                                    {dto.bidCount || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이징 */}
            {renderPagination()}
        </div>
    );
}

export default ImageboardList;
