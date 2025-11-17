import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function ImageboardList() {
    const [pg, setPg] = useState(0);
    const [totalP, setTotalP] = useState(0);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(3);
    const [imageboardList, setImageboardList] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = queryParams.get("pg") || 1;
        const keyword = queryParams.get("keyword") || ""; // URL에서 검색어 가져오기
        setSearchKeyword(keyword);
        // 목록 + 페이징 데이터 가져오기
        fetchBoardData(Number(page), keyword);
    }, [location]);

    // 검색어와 페이지를 포함해서 데이터 가져오기
    const fetchBoardData = async (page, keyword = "") => {
        try {
            let url = `http://localhost:8080/imageboard/imageboardList?pg=${page}`;
            // 검색어가 있으면 쿼리 파라미터에 추가
            if(keyword && keyword.trim() !== "") {
                url += `&keyword=${encodeURIComponent(keyword.trim())}`;
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
        // 검색 시 첫 페이지로 이동하고 URL 업데이트
        // URL 변경 시 useEffect가 자동으로 데이터를 가져옴
        navigate(`/imageboard/imageboardList?pg=1${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""}`);
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
        // URL 업데이트 (useEffect가 자동으로 데이터를 가져옴)
        navigate(`/imageboard/imageboardList?pg=${page}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""}`);
    };

    const renderPagination = () => {
        const pages = [];
        for(let i=startPage; i<=endPage; i++) {
            pages.push(
                <span key={i}
                    style={{margin: "0 5px", cursor:"pointer",
                            color: i===pg ? "red" : "blue"}}
                    onClick={() => handlePageChange(i)}>{i}</span>
            );
        }

        return (
            <div>
                {startPage > 3 && (
                    <span style={{cursor:"pointer", color:"blue",
                                  marginRight: "5px"}}
                          onClick={()=>handlePageChange(startPage-1)}>이전</span>
                )}

                {pages}

                {endPage < totalP && (
                    <span style={{cursor:"pointer", color:"blue",
                                  marginLeft: "5px"}}
                          onClick={()=>handlePageChange(endPage+1)}>다음</span>
                )}
            </div>
        );
    };

    return (
        <div className="container">
            {/* 검색 입력창 */}
            <div style={{width: "650px", margin: "20px auto", display: "flex", gap: "10px", alignItems: "center"}}>
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
            
            <table className="table" style={{width: "650px", margin: "auto"}}>
                <thead>
                    <tr className="table-primary" align="center">
                        <th width="50">번호</th>
                        <th width="150">이미지</th>
                        <th width="150">상품명</th>
                        <th width="100">단가</th>
                        <th width="100">개수</th>
                    </tr>
                </thead>
                <tbody>
                    {imageboardList.map(dto => (
                        <tr align="center" key={dto.seq}>
                            <td>{dto.seq}</td>
                            <td><Link to={`/imageboard/imageboardView?seq=${dto.seq}&pg=${pg}`}>
                                <img src={`http://localhost:8080/storage/${dto.image1}`}
                                    width="50" height="50"/></Link></td>
                            <td>{dto.imagename}</td>
                            <td>{dto.imageprice}</td>
                            <td>{dto.imageqty}</td>
                        </tr>
                    ))}

                    <tr align="center">
                        <td colSpan="5">
                            {renderPagination()}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ImageboardList;