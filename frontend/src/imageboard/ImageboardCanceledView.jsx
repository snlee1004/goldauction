import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ImageboardPopup from "./ImageboardPopup";

function ImageboardCanceledView() {
    const [seq, setSeq] = useState(0);
    const [pg, setPg] = useState(0);
    const [imageboardData, setImageboardData] = useState({});
    const [showImagePopup, setShowImagePopup] = useState(false); // 이미지 팝업 표시 여부
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const seq = parseInt(queryParams.get("seq"));
        const pg = parseInt(queryParams.get("pg"));
        setSeq(seq);
        setPg(pg);
        // 상세보기 데이터 가져오기
        if(seq) {
            fetchBoardData(seq);
        }
    }, [location]);

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

    // 이미지 팝업 열기
    const handleImageClick = () => {
        if(seq) {
            setShowImagePopup(true);
        }
    };

    // 이미지 팝업 닫기
    const handleClosePopup = () => {
        setShowImagePopup(false);
    };

    // 남은 기간 계산
    const calculateRemainingDays = () => {
        if(!imageboardData.auctionEndDate) {
            return 0;
        }
        const endDate = new Date(imageboardData.auctionEndDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // 목록으로 이동 (일반 경매 목록으로 이동)
    const handleList = () => {
        navigate(`/imageboard/imageboardList?pg=${pg || 1}`);
    };

    // 삭제 처리
    const handleDelete = async () => {
        if(!window.confirm("정말로 삭제하시겠습니까?")) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardDelete?seq=${seq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                alert("삭제되었습니다.");
                navigate("/imageboard/imageboardCanceledList");
            } else {
                alert(data.msg || "삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("삭제 오류:", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 작성자 확인 - 로그인한 사용자가 작성자인지 확인
    const isAuthor = () => {
        const memId = sessionStorage.getItem("memId");
        if(!memId) return false;
        return imageboardData.imageid === memId;
    };

    const remainingDays = calculateRemainingDays();
    const unitPrice = imageboardData.imageprice || 0; // 단가

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "0"}}>
            {/* 판매중지 상태 표시 */}
            <div style={{
                padding: "15px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                marginBottom: "20px",
                textAlign: "center"
            }}>
                <span style={{color: "#d9534f", fontWeight: "bold", fontSize: "18px"}}>
                    ⚠ 판매가 중지되었습니다
                </span>
            </div>

            {/* 상품명과 남은 기간 */}
            <div style={{marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div style={{fontSize: "20px", color: "#4169E1", fontWeight: "bold"}}>
                    상품명 : {imageboardData.imagename || imageboardData.productname || "웰치스"}
                </div>
                <div style={{fontSize: "16px", color: "#666", display: "flex", alignItems: "center", gap: "5px"}}>
                    <i className="bi bi-clock" style={{fontSize: "18px"}}></i>
                    <span>남은기간: <span style={{color: "#d9534f", fontWeight: "bold"}}>{remainingDays}일</span></span>
                </div>
            </div>

            {/* 상품 이미지와 정보 테이블 */}
            <div style={{display: "flex", gap: "20px", marginBottom: "30px"}}>
                {/* 상품 이미지 */}
                <div style={{flex: "0 0 200px"}}>
                    <div style={{fontSize: "14px", marginBottom: "10px", color: "#666"}}>
                        {imageboardData.category || "카테고리"}
                    </div>
                    <img 
                        width="200" 
                        height="200" 
                        alt="상품 이미지"
                        src={(() => {
                            if (!imageboardData.image1) return "/placeholder-image.png";
                            
                            // DB에 저장된 경로가 original/파일명 형식인 경우 (이미 원본 경로)
                            if (imageboardData.image1.startsWith("original/")) {
                                return `http://localhost:8080/storage/${imageboardData.image1}`;
                            }
                            // 기존 데이터 호환성 (파일명만 있는 경우 - 원본이 storage 루트에 있음)
                            return `http://localhost:8080/storage/${imageboardData.image1}`;
                        })()}
                        style={{border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer"}}
                        onClick={handleImageClick}
                    />
                </div>

                {/* 상품 정보 테이블 */}
                <div style={{flex: "1"}}>
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <tbody>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold"}}>상품명</td>
                                <td style={{padding: "10px"}}>
                                    {imageboardData.imagename || imageboardData.productname || "-"}
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold"}}>단가</td>
                                <td style={{padding: "10px"}}>
                                    ₩ {unitPrice.toLocaleString()}
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold"}}>거래방식</td>
                                <td style={{padding: "10px"}}>
                                    {imageboardData.transactionMethod || "미설정"}
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold"}}>상태</td>
                                <td style={{padding: "10px"}}>
                                    <span style={{color: "#d9534f", fontWeight: "bold"}}>판매중지</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 경매 상태 메시지 */}
            <div style={{
                padding: "20px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                marginBottom: "30px"
            }}>
                <div style={{fontSize: "16px", color: "#856404", fontWeight: "bold", marginBottom: "10px"}}>
                    경매 상태 메시지
                </div>
                <div style={{fontSize: "14px", color: "#856404"}}>
                    {imageboardData.imagecontent || imageboardData.description || "상세 내용이 없습니다."}
                </div>
            </div>

            {/* 목록 및 삭제 버튼 */}
            <div style={{textAlign: "center", marginTop: "30px"}}>
                <button 
                    className="btn btn-secondary" 
                    onClick={handleList}
                    style={{
                        padding: "6px 12px",
                        fontSize: "13px"
                    }}
                >
                    <i className="bi bi-list"></i> 목록
                </button>
                {/* 작성자만 삭제 버튼 표시 */}
                {isAuthor() && (
                    <>
                        &nbsp;
                        <button 
                            className="btn btn-danger" 
                            onClick={handleDelete}
                            style={{
                                padding: "6px 12px",
                                fontSize: "13px"
                            }}
                        >
                            <i className="bi bi-trash"></i> 삭제
                        </button>
                    </>
                )}
            </div>

            {/* 이미지 팝업 */}
            <ImageboardPopup
                imageboardSeq={seq}
                imageboardData={imageboardData}
                isOpen={showImagePopup}
                onClose={handleClosePopup}
            />
        </div>
    );
}

export default ImageboardCanceledView;

