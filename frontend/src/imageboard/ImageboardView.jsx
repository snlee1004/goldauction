import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ImageboardPopup from "./ImageboardPopup";

function ImageboardView() {
    const [seq, setSeq] = useState(0);
    const [pg, setPg] = useState(0);
    const [imageboardData, setImageboardData] = useState({});
    const [bidAmount, setBidAmount] = useState(""); // 입찰 참여 금액
    const [showAllBids, setShowAllBids] = useState(false); // 모든 입찰 보기 토글
    const [bidList, setBidList] = useState([]); // 입찰 목록
    const [totalBids, setTotalBids] = useState(0); // 전체 입찰 수
    const [currentHighestBid, setCurrentHighestBid] = useState(0); // 현재 최고 입찰 금액
    const [showImagePopup, setShowImagePopup] = useState(false); // 이미지 팝업 표시 여부
    const [writerNickname, setWriterNickname] = useState(""); // 등록자 닉네임
    
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
            // 입찰 데이터는 게시글 데이터 로드 후 조회 (약간의 지연을 두어 데이터 일관성 확보)
            setTimeout(() => {
                fetchBidData(seq);
            }, 100);
        }
    }, [location]);

    const fetchBoardData = async (seq) => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardView?seq=${seq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                console.log("경매 데이터:", data.item); // 디버깅용
                setImageboardData(data.item);
                // 등록자 닉네임 조회
                if(data.item.imageid) {
                    fetchWriterNickname(data.item.imageid);
                }
            } else {
                alert("해당 게시글이 존재하지 않습니다.");
            }
        } catch(err) {
            console.error(err);
        }
    };

    // 등록자 닉네임 조회
    const fetchWriterNickname = async (imageid) => {
        try {
            const response = await fetch(`http://localhost:8080/member/getMember?id=${imageid}`);
            const data = await response.json();
            if(data.rt === "OK" && data.member) {
                setWriterNickname(data.member.nickname || imageid);
            } else {
                setWriterNickname(imageid);
            }
        } catch(err) {
            console.error("등록자 닉네임 조회 오류:", err);
            setWriterNickname(imageid);
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

    // 입찰 데이터 가져오기 (목록, 최고 금액, 입찰 수)
    const fetchBidData = async (imageboardSeq) => {
        try {
            // 최고 입찰 금액 조회
            const maxAmountResponse = await fetch(`http://localhost:8080/bid/maxAmount?imageboardSeq=${imageboardSeq}`);
            if(maxAmountResponse.ok) {
                const maxAmountData = await maxAmountResponse.json();
                if(maxAmountData.rt === "OK") {
                    setCurrentHighestBid(maxAmountData.maxAmount || 0);
                } else {
                    setCurrentHighestBid(0);
                }
            } else {
                setCurrentHighestBid(0);
            }
            
            // 입찰 수 조회
            const countResponse = await fetch(`http://localhost:8080/bid/count?imageboardSeq=${imageboardSeq}`);
            if(countResponse.ok) {
                const countData = await countResponse.json();
                if(countData.rt === "OK") {
                    setTotalBids(countData.count || 0);
                } else {
                    setTotalBids(0);
                }
            } else {
                setTotalBids(0);
            }
            
            // 입찰 목록 조회 (상위 10개)
            const listResponse = await fetch(`http://localhost:8080/bid/topList?imageboardSeq=${imageboardSeq}&limit=10`);
            if(listResponse.ok) {
                const listData = await listResponse.json();
                if(listData.rt === "OK") {
                    setBidList(listData.items || []);
                } else {
                    setBidList([]);
                }
            } else {
                setBidList([]);
            }
        } catch(err) {
            console.error("입찰 데이터 조회 오류:", err);
            setCurrentHighestBid(0);
            setTotalBids(0);
            setBidList([]);
        }
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

    // 경매 상태 확인
    const getAuctionStatus = () => {
        if(!imageboardData.auctionEndDate) {
            return imageboardData.status || "진행중";
        }
        const endDate = new Date(imageboardData.auctionEndDate);
        const today = new Date();
        if(today > endDate) {
            return "종료";
        }
        return imageboardData.status || "진행중";
    };

    // 입찰 참여 처리
    const handleBidSubmit = async (e) => {
        e.preventDefault();
        if(!bidAmount || bidAmount.trim() === "") {
            alert("입찰 금액을 입력하세요.");
            return;
        }
        
        const memId = sessionStorage.getItem("memId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        
        const bidAmountNum = parseInt(bidAmount);
        if(isNaN(bidAmountNum) || bidAmountNum <= 0) {
            alert("올바른 입찰 금액을 입력하세요.");
            return;
        }
        
        // 시작가격보다 높아야 함
        const startPrice = imageboardData.imageprice || 0;
        if(bidAmountNum < startPrice) {
            alert(`입찰 시작가격(${startPrice.toLocaleString()}원) 이상으로 입력하세요.`);
            return;
        }
        
        // 최고 입찰 금액보다 높아야 함 (입찰이 있는 경우)
        if(currentHighestBid > 0 && bidAmountNum <= currentHighestBid) {
            alert(`현재 최고 입찰 금액(${currentHighestBid.toLocaleString()}원)보다 높은 금액을 입력하세요.`);
            return;
        }
        
        // 최고 낙찰 가격 체크 (즉시 구매)
        const maxBidPrice = imageboardData.maxBidPrice || imageboardData.max_bid_price;
        if(maxBidPrice && maxBidPrice > 0 && bidAmountNum >= maxBidPrice) {
            if(!window.confirm(`즉시 구매 가격(${maxBidPrice.toLocaleString()}원) 이상입니다. 즉시 구매하시겠습니까?`)) {
                return;
            }
        }
        
        try {
            const response = await fetch("http://localhost:8080/bid/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imageboardSeq: seq,
                    bidderId: memId,
                    bidAmount: bidAmountNum
                })
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                if(data.immediatePurchase) {
                    alert("즉시 구매가 완료되었습니다!");
                    // 페이지 새로고침하여 상태 업데이트
                    window.location.reload();
                } else {
                    alert("입찰이 완료되었습니다.");
                    setBidAmount("");
                    // 입찰 데이터 다시 가져오기 (약간의 지연을 두어 DB 반영 시간 확보)
                    setTimeout(() => {
                        fetchBidData(seq);
                    }, 300);
                }
            } else {
                alert(data.msg || "입찰에 실패했습니다.");
            }
        } catch(err) {
            alert("입찰 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    // 즉시 구매 처리
    const handleBuyNow = async () => {
        const memId = sessionStorage.getItem("memId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        
        // maxBidPrice 필드명 확인 (camelCase 또는 snake_case)
        const maxBidPrice = imageboardData.maxBidPrice || imageboardData.max_bid_price;
        console.log("즉시 구매 가격:", maxBidPrice, "전체 데이터:", imageboardData); // 디버깅용
        
        if(!maxBidPrice || maxBidPrice <= 0) {
            alert("즉시 구매 가격이 설정되지 않았습니다.");
            return;
        }
        
        if(!window.confirm(`정말로 ${maxBidPrice.toLocaleString()}원에 즉시 구매하시겠습니까?`)) {
            return;
        }
        
        try {
            const response = await fetch("http://localhost:8080/bid/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imageboardSeq: seq,
                    bidderId: memId,
                    bidAmount: maxBidPrice
                })
            });
            
            const data = await response.json();
            console.log("입찰 응답:", data); // 디버깅용
            
            if(data.rt === "OK") {
                if(data.immediatePurchase) {
                    alert("즉시 구매가 완료되었습니다!");
                    // 페이지 새로고침하여 상태 업데이트
                    window.location.reload();
                } else {
                    alert("입찰이 완료되었습니다.");
                    setBidAmount("");
                    setTimeout(() => {
                        fetchBidData(seq);
                        fetchBoardData(seq); // 경매 데이터도 다시 가져오기
                    }, 300);
                }
            } else {
                alert(data.msg || "즉시 구매에 실패했습니다.");
            }
        } catch(err) {
            alert("즉시 구매 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleList = () => {
        navigate(`/imageboard/imageboardList?pg=${pg}`);
    };

    const handleModify = () => {
        navigate(`/imageboard/imageboardModifyForm?seq=${seq}`);
    };

    // 경매 포기 처리
    const handleCancelAuction = async () => {
        if(!window.confirm("정말로 경매를 포기하시겠습니까?")) {
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append("seq", seq);
            
            const response = await fetch("http://localhost:8080/imageboard/cancelAuction", {
                method: "POST",
                body: formData
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert(data.msg || "경매가 포기되었습니다.");
                // 포기된 경매 목록으로 이동
                navigate("/imageboard/imageboardCanceledList");
            } else {
                alert(data.msg || "경매 포기에 실패했습니다.");
            }
        } catch(err) {
            console.error("경매 포기 오류:", err);
            alert("경매 포기 중 오류가 발생했습니다.");
        }
    };

    // 작성자 확인 - 로그인한 사용자가 작성자인지 확인
    const isAuthor = () => {
        const memId = sessionStorage.getItem("memId");
        if(!memId) return false;
        // imageid가 작성자 ID인지 확인 (백엔드 구조에 따라 필드명이 다를 수 있음)
        return imageboardData.imageid === memId;
    };

    // 현재 로그인한 사용자가 입찰했는지 확인
    const hasUserBid = () => {
        const memId = sessionStorage.getItem("memId");
        if(!memId) return false;
        return bidList.some(bid => bid.bidderId === memId);
    };

    // 사용자의 입찰 정보 가져오기
    const getUserBid = () => {
        const memId = sessionStorage.getItem("memId");
        if(!memId) return null;
        return bidList.find(bid => bid.bidderId === memId);
    };

    // 입찰 취소 처리 (bidSeq로 직접 취소)
    const handleCancelBidBySeq = async (bidSeq) => {
        if(!bidSeq) {
            alert("입찰 정보를 찾을 수 없습니다.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/bid/cancel?bidSeq=${bidSeq}`, {
                method: "POST"
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("입찰이 취소되었습니다.");
                // 입찰 데이터 다시 가져오기
                setTimeout(() => {
                    fetchBidData(seq);
                }, 300);
            } else {
                alert(data.msg || "입찰 취소에 실패했습니다.");
            }
        } catch(err) {
            console.error("입찰 취소 오류:", err);
            alert("입찰 취소 중 오류가 발생했습니다.");
        }
    };

    const status = getAuctionStatus();
    const remainingDays = calculateRemainingDays();
    const unitPrice = imageboardData.imageprice || 0; // 단가

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px"}}>
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
            <div style={{display: "flex", gap: "40px", marginBottom: "30px"}}>
                {/* 상품 이미지 */}
                <div style={{flex: "0 0 280px"}}>
                    <div style={{fontSize: "14px", marginBottom: "10px", color: "#666"}}>
                        {imageboardData.category || "카테고리"}
                    </div>
                    <img 
                        width="280" 
                        height="280" 
                        alt="상품 이미지"
                        src={imageboardData.image1 ? `http://localhost:8080/storage/${imageboardData.image1}` : "/placeholder-image.png"}
                        style={{border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", width: "280px", height: "280px", objectFit: "cover"}}
                        onClick={handleImageClick}
                    />
                    <div style={{fontSize: "12px", color: "#555", marginTop: "8px", textAlign: "center"}}>
                        {writerNickname || imageboardData.imageid || "등록자"}
                    </div>
                </div>

                {/* 상품 정보 테이블 */}
                <div style={{flex: "1"}}>
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <tbody>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", width: "150px", fontWeight: "bold", fontSize: "13px"}}>상품명</td>
                                <td style={{padding: "10px", fontSize: "13px"}}>{imageboardData.imagename || imageboardData.productname || "웰치스"}</td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>단가</td>
                                <td style={{padding: "10px", fontSize: "13px"}}>{unitPrice.toLocaleString()}</td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>입찰 참여</td>
                                <td style={{padding: "10px"}}>
                                    <form onSubmit={handleBidSubmit} style={{display: "flex", gap: "10px"}}>
                                        <input 
                                            type="number" 
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            placeholder="입찰 금액 입력"
                                            style={{
                                                padding: "6px",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                flex: "1",
                                                fontSize: "13px"
                                            }}
                                        />
                                        <button 
                                            type="submit"
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#D4AF37",
                                                borderColor: "#D4AF37",
                                                color: "#000",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "13px"
                                            }}
                                        >
                                            입찰
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            {(() => {
                                const maxBidPrice = imageboardData.maxBidPrice || imageboardData.max_bid_price;
                                return maxBidPrice && maxBidPrice > 0 && status === "진행중" && (
                                    <tr style={{borderBottom: "1px solid #eee"}}>
                                        <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>즉시 구매</td>
                                        <td style={{padding: "10px"}}>
                                            <button 
                                                type="button"
                                                onClick={handleBuyNow}
                                                style={{
                                                    padding: "8px 20px",
                                                    backgroundColor: "#ff6b35",
                                                    border: "none",
                                                    color: "#fff",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    width: "100%"
                                                }}
                                            >
                                                즉시 구매 ({maxBidPrice.toLocaleString()}원)
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })()}
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>현재 최고 입찰된 금액</td>
                                <td style={{padding: "10px", color: "#d9534f", fontWeight: "bold", fontSize: "13px"}}>
                                    ₩ {currentHighestBid > 0 ? currentHighestBid.toLocaleString() : "입찰 없음"}
                                </td>
                            </tr>
                            <tr style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>거래방식</td>
                                <td style={{padding: "10px", fontSize: "13px"}}>
                                    {imageboardData.transactionMethod || "미설정"}
                                </td>
                            </tr>
                            <tr>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>입찰인수</td>
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>
                                    {totalBids}명
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 경매 상태 메시지 */}
            <div style={{
                padding: "15px",
                backgroundColor: "transparent",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginBottom: "30px",
                textAlign: "center"
            }}>
                <div style={{fontSize: "18px"}}>
                    {imageboardData.imagecontent || imageboardData.description || "상세 내용이 없습니다."}
                </div>
                <div style={{marginTop: "5px"}}>
                    {status === "진행중" ? (
                        <div style={{fontSize: "16px", color: "#b3d9ff"}}>
                            경매가 진행 중입니다.
                        </div>
                    ) : (
                        <div style={{fontSize: "24px", color: "red", fontWeight: "bold"}}>
                            경매가 종료 되었습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* 입찰 순위 섹션 */}
            <div>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px"}}>
                    <h4 style={{margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px"}}>
                        <i className="bi bi-trophy"></i> 입찰 순위
                    </h4>
                    <button
                        onClick={() => setShowAllBids(!showAllBids)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "white",
                            border: "1px solid #007bff",
                            color: "#007bff",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "13px"
                        }}
                    >
                        모든 입찰 보기({totalBids})
                        <i className={`bi bi-chevron-${showAllBids ? "up" : "down"}`}></i>
                    </button>
                </div>

                {/* 입찰 목록 */}
                <div>
                    {bidList.length === 0 ? (
                        <div style={{padding: "20px", textAlign: "center", color: "#666"}}>
                            아직 입찰이 없습니다.
                        </div>
                    ) : (
                        (showAllBids ? bidList : bidList.slice(0, 3)).map((bid, index) => {
                            // 입찰 시간 포맷팅 (년월일시 형식)
                            const bidTime = new Date(bid.bidTime);
                            const year = bidTime.getFullYear();
                            const month = bidTime.getMonth() + 1;
                            const day = bidTime.getDate();
                            const hours = bidTime.getHours();
                            const minutes = bidTime.getMinutes();
                            const timeStr = `${year}년 ${month}월 ${day}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            
                            // 현재 로그인한 사용자가 이 입찰의 입찰자인지 확인
                            const memId = sessionStorage.getItem("memId");
                            const isCurrentUserBid = memId && bid.bidderId === memId;
                            
                            return (
                                <div 
                                    key={bid.bidSeq || index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "12px",
                                        border: "1px solid #ffeb99",
                                        borderRadius: "4px",
                                        marginBottom: "10px",
                                        gap: "15px"
                                    }}
                                >
                                    <div style={{width: "30px", fontWeight: "bold"}}>{index + 1}</div>
                                    <div style={{flex: "1"}}>
                                        <span style={{color: "#999", fontSize: "12px"}}>입찰자</span> {bid.bidderNickname || bid.bidderId}
                                    </div>
                                    <div style={{color: "#999", fontSize: "12px", textAlign: "center", width: "200px"}}>
                                        {timeStr}
                                    </div>
                                    <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                                        <span style={{fontWeight: "bold", color: "#d9534f"}}>₩ {bid.bidAmount.toLocaleString()}</span>
                                        {isCurrentUserBid && (
                                            <button
                                                onClick={() => {
                                                    if(window.confirm("정말로 입찰을 취소하시겠습니까?")) {
                                                        handleCancelBidBySeq(bid.bidSeq);
                                                    }
                                                }}
                                                style={{
                                                    padding: "4px 8px",
                                                    backgroundColor: "#dc3545",
                                                    border: "none",
                                                    color: "white",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "11px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px"
                                                }}
                                                title="입찰 취소"
                                            >
                                                <i className="bi bi-x-circle" style={{fontSize: "10px"}}></i>
                                                취소
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 목록 및 수정 버튼 */}
            <div style={{textAlign: "center", marginTop: "30px"}}>
                <button className="btn btn-secondary" onClick={handleList}>
                    <i className="bi bi-list"></i> 목록
                </button>
                {/* 작성자만 수정 및 경매 포기 버튼 표시 */}
                {isAuthor() && imageboardData.status !== "포기" && (
                    <>
                        &nbsp;
                        <button className="btn btn-primary" onClick={handleModify}>
                            <i className="bi bi-pencil-square"></i> 수정
                        </button>
                        &nbsp;
                        <button className="btn btn-danger" onClick={handleCancelAuction}>
                            <i className="bi bi-x-circle"></i> 경매 포기
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

export default ImageboardView;
