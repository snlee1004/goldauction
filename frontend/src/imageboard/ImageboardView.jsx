import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ImageboardView() {
    const [seq, setSeq] = useState(0);
    const [pg, setPg] = useState(0);
    const [imageboardData, setImageboardData] = useState({});
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const seq = parseInt(queryParams.get("seq"));
        const pg = parseInt(queryParams.get("pg"));
        setSeq(seq);
        setPg(pg);
        // 상세보기 데이터 가져오기
        fetchBoardData(seq);
    }, []);

    const fetchBoardData = async (seq) => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardView?seq=${seq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setImageboardData(data.item);
            } else {
                alert("해당 게시글이 존재하지 않습니다.");
            }
        } catch(err) {
            console.error(err);
        }
    };

    const handleList = () => {
        navigate(`/imageboard/imageboardList?pg=${pg}`);
    };
    const handleDelete = async () => {
        if(window.confirm("삭제할까요?")) {
            try {
                const response = await fetch(`http://localhost:8080/imageboard/imageboardDelete?seq=${seq}`);
                const data = await response.json();
                if(response.ok) {  // 200 코드이면
                    if(data.rt === "OK") {
                        alert("삭제 성공");
                        navigate(`/imageboard/imageboardList?pg=${pg}`);
                    } else {
                        alert("삭제 실패");
                    }
                }
            } catch(err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="container">
            <table className="table" style={{width: "500px", margin: "auto"}}>
                <tbody>
                    <tr align="center">
                        <td rowSpan="4" width="150">
                            <img width="150" height="150" alt="상품 이미지"
                                src={`http://localhost:8080/storage/${imageboardData.image1}`}/>
                        </td>
                        <td width="100">상품명</td>
                        <td width="100">{imageboardData.imagename}</td>
                    </tr>
                    <tr align="center">                        
                        <td width="100">단가</td>
                        <td width="100">{imageboardData.imageprice}</td>
                    </tr>
                    <tr align="center">                        
                        <td width="100">개수</td>
                        <td width="100">{imageboardData.imageqty}</td>
                    </tr>
                    <tr align="center">                        
                        <td width="100">합계</td>
                        <td width="100">{imageboardData.imageprice * imageboardData.imageqty}</td>
                    </tr>
                    <tr align="center">                        
                        <td colSpan="3" height="200" valign="top"><pre>{imageboardData.imagecontent}</pre></td>
                    </tr>
                    <tr align="center">                        
                        <td colSpan="3" >
                            <input type="button" value="목록" onClick={handleList}/>&nbsp;
                            <input type="button" value="수정" />&nbsp;
                            <input type="button" value="삭제" onClick={handleDelete}/>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ImageboardView;