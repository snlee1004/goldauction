import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function ImageboardList() {
    const [pg, setPg] = useState(0);
    const [totalP, setTotalP] = useState(0);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(3);
    const [imageboardList, setImageboardList] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = queryParams.get("pg") || 1;
        // 목록 + 페이징 데이터 가져오기
        fetchBoardData(Number(page));
    }, []);

    const fetchBoardData = async (page) => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=${page}`);
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

    const handlePageChange = (page) => {
        setPg(page);
        fetchBoardData(page);
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
                    <tr align="center">
                        <td colSpan="5">
                            <Link to="/imageboard/imageboardWriteForm">새글쓰기</Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ImageboardList;