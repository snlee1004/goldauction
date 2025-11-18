import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ImageboardView() {
    const [seq, setSeq] = useState(0);
    const [pg, setPg] = useState(0);
    const [imageboardData, setImageboardData] = useState({});
    const [bidAmount, setBidAmount] = useState(""); // 입찰 참여 금액
    const [showAllBids, setShowAllBids] = useState(false); // 모든 입찰 보기 토글
    
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

    // 남은 기간 계산 (예시 - 실제로는 auctionEndDate와 현재 날짜 비교)
    const calculateRemainingDays = () => {
        // TODO: 실제 경매 종료일과 현재 날짜를 비교하여 계산
        // 임시로 5일 반환
        return 5;
    };

    // 경매 상태 확인 (진행중/판매완료)
    const getAuctionStatus = () => {
        // TODO: 실제 경매 종료일과 현재 날짜를 비교하여 상태 반환
        // 임시로 진행중 반환
        return "진행중";
    };

    // 입찰 참여 처리
    const handleBidSubmit = async (e) => {
        e.preventDefault();
        if(!bidAmount || bidAmount.trim() === "") {
            alert("입찰 금액을 입력하세요.");
            return;
        }
        // TODO: 입찰 API 호출
        alert("입찰 기능은 추후 구현 예정입니다.");
    };

    // 입찰 목록 (임시 데이터 - 실제로는 API에서 가져와야 함)
    const bidList = [
        { rank: 1, bidder: "3931", time: "8주 전", amount: 5000, flag: "🇮🇹" },
        { rank: 2, bidder: "4782", time: "8주 전", amount: 4000, flag: "🇩🇪" },
        { rank: 3, bidder: "2315", time: "9주 전", amount: 3000, flag: "🇮🇹" }
    ];
    const totalBids = 9; // 전체 입찰 수

    const handleList = () => {
        navigate(`/imageboard/imageboardList?pg=${pg}`);
    };

    const handleModify = () => {
        navigate(`/imageboard/imageboardModifyForm?seq=${seq}`);
    };

    // 작성자 확인 - 로그인한 사용자가 작성자인지 확인
    const isAuthor = () => {
        const memId = sessionStorage.getItem("memId");
        if(!memId) return false;
        // imageid가 작성자 ID인지 확인 (백엔드 구조에 따라 필드명이 다를 수 있음)
        return imageboardData.imageid === memId;
    };

    const status = getAuctionStatus();
    const remainingDays = calculateRemainingDays();
    const currentHighestBid = 600000; // 현재 최고 입찰 금액 (실제로는 API에서 가져와야 함)
    const unitPrice = imageboardData.imageprice || 1200; // 단가

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px"}}>
            {/* 진행상태 표시 */}
            <div style={{marginBottom: "20px"}}>
                <div style={{fontSize: "14px", color: "#666", marginBottom: "5px"}}>진행상태표시</div>
                <div style={{fontSize: "16px", fontWeight: "bold"}}>
                    {status === "진행중" ? "진행중" : "판매완료"}
                </div>
            </div>

            {/* 상품명과 남은 기간 */}
            <div style={{marginBottom: "20px"}}>
                <div style={{fontSize: "16px"}}>
                    상품명 : {imageboardData.imagename || imageboardData.productname || "웰치스"} : 남은 기간 : {remainingDays}일 남았습니다.
                </div>
            </div>

            {/* 상품 이미지와 정보 테이블 */}
            <div style={{display: "flex", gap: "20px", marginBottom: "30px"}}>
                {/* 상품 이미지 */}
                <div style={{flex: "0 0 200px"}}>
                    <div style={{fontSize: "14px", marginBottom: "10px", color: "#666"}}>상품 이미지</div>
                    <img 
                        width="200" 
                        height="200" 
                        alt="상품 이미지"
                        src={imageboardData.image1 ? `http://localhost:8080/storage/${imageboardData.image1}` : "/placeholder-image.png"}
                        style={{border: "1px solid #ddd", borderRadius: "4px"}}
                    />
                </div>

                {/* 상품 정보 테이블 */}
                <div style={{flex: "1"}}>
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <tbody>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", width: "150px", fontWeight: "bold"}}>상품명</td>
                                <td style={{padding: "10px"}}>{imageboardData.imagename || imageboardData.productname || "웰치스"}</td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold"}}>단가</td>
                                <td style={{padding: "10px"}}>{unitPrice.toLocaleString()}</td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold"}}>입찰 참여</td>
                                <td style={{padding: "10px"}}>
                                    <form onSubmit={handleBidSubmit} style={{display: "flex", gap: "10px"}}>
                                        <input 
                                            type="number" 
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            placeholder="입찰 금액 입력"
                                            style={{
                                                padding: "8px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                flex: "1"
                                            }}
                                        />
                                        <button 
                                            type="submit"
                                            style={{
                                                padding: "8px 16px",
                                                backgroundColor: "#007bff",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            입찰
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "10px", fontWeight: "bold"}}>현재 최고 입찰된 금액</td>
                                <td style={{padding: "10px", color: "#d9534f", fontWeight: "bold"}}>
                                    ₩ {currentHighestBid.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 경매 상태 메시지 */}
            <div style={{
                padding: "15px",
                backgroundColor: status === "진행중" ? "#d4edda" : "#f8d7da",
                border: `1px solid ${status === "진행중" ? "#c3e6cb" : "#f5c6cb"}`,
                borderRadius: "4px",
                marginBottom: "30px",
                textAlign: "center"
            }}>
                <div style={{fontSize: "18px", fontWeight: "bold"}}>
                    {imageboardData.imagename || imageboardData.productname || "웰치스"}
                </div>
                <div style={{fontSize: "16px", marginTop: "5px"}}>
                    {status === "진행중" ? "경매가 진행 중입니다." : "경매가 종료 되었습니다."}
                </div>
            </div>

            {/* 입찰 순위 섹션 */}
            <div>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px"}}>
                    <h4 style={{margin: 0}}>입찰 순위</h4>
                    <button
                        onClick={() => setShowAllBids(!showAllBids)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "white",
                            border: "2px solid #007bff",
                            color: "#007bff",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        모든 입찰 보기({totalBids})
                        <i className={`bi bi-chevron-${showAllBids ? "up" : "down"}`}></i>
                    </button>
                </div>

                {/* 입찰 목록 */}
                <div>
                    {(showAllBids ? bidList : bidList.slice(0, 3)).map((bid, index) => (
                        <div 
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px",
                                borderBottom: "1px solid #eee",
                                gap: "15px"
                            }}
                        >
                            <div style={{width: "30px", fontWeight: "bold"}}>{bid.rank}</div>
                            <div style={{fontSize: "20px"}}>{bid.flag}</div>
                            <div style={{flex: "1"}}>입찰자 {bid.bidder}</div>
                            <div style={{color: "#666", fontSize: "14px"}}>{bid.time}</div>
                            <div style={{fontWeight: "bold", color: "#d9534f"}}>₩ {bid.amount.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 목록 및 수정 버튼 */}
            <div style={{textAlign: "center", marginTop: "30px"}}>
                <button className="btn btn-secondary" onClick={handleList}>
                    <i className="bi bi-list"></i> 목록
                </button>
                {/* 작성자만 수정 버튼 표시 */}
                {isAuthor() && (
                    <>
                        &nbsp;
                        <button className="btn btn-primary" onClick={handleModify}>
                            <i className="bi bi-pencil-square"></i> 수정
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ImageboardView;
