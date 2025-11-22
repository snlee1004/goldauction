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
    const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false }); // 남은 시간 (실시간)
    
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
                console.log("경매 상태:", data.item.status); // 디버깅용
                console.log("경매 종료일:", data.item.auctionEndDate); // 디버깅용
                console.log("경매 시작일:", data.item.auctionStartDate); // 디버깅용
                setImageboardData(data.item);
                // 등록자 닉네임 조회
                if(data.item.imageid) {
                    fetchWriterNickname(data.item.imageid);
                }
            } else {
                alert("해당 게시글이 존재하지 않습니다.");
            }
        } catch(err) {
            console.error("경매 데이터 조회 오류:", err);
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

    // 남은 시간 계산 (실시간)
    const calculateRemainingTime = () => {
        if(!imageboardData.auctionEndDate) {
            return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }
        
        const endDate = new Date(imageboardData.auctionEndDate);
        const now = new Date();
        const diffTime = endDate - now;
        
        if(diffTime <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }
        
        const hours = Math.floor(diffTime / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
        
        return { hours, minutes, seconds, isExpired: false };
    };

    // 실시간 카운터 업데이트
    useEffect(() => {
        if(!imageboardData.auctionEndDate) {
            setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
            return;
        }
        
        // 즉시 계산
        const updateTime = () => {
            if(!imageboardData.auctionEndDate) {
                setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }
            
            const endDate = new Date(imageboardData.auctionEndDate);
            const now = new Date();
            const diffTime = endDate - now;
            
            if(diffTime <= 0) {
                setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }
            
            // 일자 계산
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            // 일자를 제외한 나머지 시간
            const remainingAfterDays = diffTime % (1000 * 60 * 60 * 24);
            const hours = Math.floor(remainingAfterDays / (1000 * 60 * 60));
            const minutes = Math.floor((remainingAfterDays % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingAfterDays % (1000 * 60)) / 1000);
            
            setRemainingTime({ days, hours, minutes, seconds, isExpired: false });
        };
        
        // 즉시 계산
        updateTime();
        
        // 1초마다 업데이트
        const interval = setInterval(updateTime, 1000);
        
        return () => clearInterval(interval);
    }, [imageboardData.auctionEndDate]);

    // 경매 상태 확인
    const getAuctionStatus = () => {
        // DB의 status 필드를 우선적으로 사용 (가장 신뢰할 수 있는 값)
        const dbStatus = imageboardData.status;
        console.log("=== 경매 상태 확인 ===");
        console.log("DB 상태:", dbStatus);
        console.log("경매 종료일:", imageboardData.auctionEndDate);
        console.log("전체 데이터:", imageboardData);
        
        // DB 상태가 명확하게 설정되어 있으면 그대로 사용 (우선순위 1)
        if(dbStatus && dbStatus.trim() !== "") {
            // "진행중"이 아닌 다른 상태는 그대로 반환
            if(dbStatus !== "진행중") {
                console.log("DB 상태 사용 (명확한 상태):", dbStatus);
                return dbStatus;
            }
        }
        
        // DB 상태가 "진행중"이거나 없을 때만 날짜로 확인
        // 경매 종료일이 없으면 진행중으로 반환
        if(!imageboardData.auctionEndDate) {
            console.log("경매 종료일이 없음 - 진행중 반환");
            return "진행중";
        }
        
        // 경매 종료일과 현재 날짜 비교 (보조 확인용)
        // 단, DB 상태가 "진행중"인 경우에만 날짜로 재확인
        try {
            // 날짜 문자열 파싱
            let endDateStr = imageboardData.auctionEndDate;
            
            // 문자열이 배열인 경우 첫 번째 요소 사용
            if(Array.isArray(endDateStr)) {
                endDateStr = endDateStr[0];
            }
            
            // 날짜 파싱
            let endDate = null;
            if(typeof endDateStr === 'string') {
                // ISO 형식 또는 일반 날짜 형식
                endDate = new Date(endDateStr);
                
                // Invalid Date 체크
                if(isNaN(endDate.getTime())) {
                    // 다른 형식 시도
                    const cleaned = endDateStr.replace(/[^\d-:T\s]/g, '');
                    endDate = new Date(cleaned);
                }
            } else if(endDateStr instanceof Date) {
                endDate = endDateStr;
            } else {
                console.warn("경매 종료일 형식을 알 수 없음:", endDateStr);
                return dbStatus || "진행중";
            }
            
            // Invalid Date 체크
            if(isNaN(endDate.getTime())) {
                console.error("경매 종료일 파싱 실패:", endDateStr);
                return dbStatus || "진행중";
            }
            
            const today = new Date();
            
            // 날짜 비교 (시간 제외, 로컬 시간대 사용)
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            console.log("종료일 (파싱됨):", endDateOnly.toISOString().split('T')[0]);
            console.log("오늘:", todayOnly.toISOString().split('T')[0]);
            console.log("종료일이 지났는가?", todayOnly > endDateOnly);
            
            // 종료일이 지났고 DB 상태가 "진행중"이거나 없을 때만 "종료"로 변경
            // 하지만 DB 상태가 다른 값이면 그대로 사용
            if(todayOnly > endDateOnly) {
                if(!dbStatus || dbStatus === "진행중") {
                    console.log("경매 종료일이 지남 - 종료 반환 (DB 상태는 진행중 또는 없음)");
                    return "종료";
                } else {
                    console.log("경매 종료일이 지났지만 DB 상태 유지:", dbStatus);
                    return dbStatus;
                }
            } else {
                console.log("경매 진행중 - DB 상태 유지:", dbStatus || "진행중");
                return dbStatus || "진행중";
            }
        } catch(e) {
            console.error("날짜 파싱 오류:", e, "원본 데이터:", imageboardData.auctionEndDate);
            return dbStatus || "진행중";
        }
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
    
    // 경매 재등록 처리 (기존 데이터를 복사하여 새 경매 등록)
    const handleReRegister = () => {
        // 기존 경매 데이터를 세션 스토리지에 저장하여 등록 페이지로 전달
        const reRegisterData = {
            productName: imageboardData.imagename || "",
            category: imageboardData.category || "",
            startPrice: imageboardData.imageprice || "",
            maxBidPrice: imageboardData.maxBidPrice || imageboardData.max_bid_price || "",
            transactionMethod: imageboardData.transactionMethod || "",
            description: imageboardData.imagecontent || ""
        };
        
        // 세션 스토리지에 저장
        sessionStorage.setItem("reRegisterData", JSON.stringify(reRegisterData));
        
        // 등록 페이지로 이동
        navigate("/imageboard/imageboardWriteForm");
    };
    
    // 경매 삭제 처리
    const handleDelete = async () => {
        if(!window.confirm("정말로 이 경매를 삭제하시겠습니까? 삭제된 경매는 복구할 수 없습니다.")) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardDelete?seq=${seq}`, {
                method: "GET"
            });
            
            const data = await response.json();
            if(data.rt === "OK") {
                alert("경매가 삭제되었습니다.");
                // 목록 페이지로 이동
                navigate("/imageboard/imageboardList");
            } else {
                alert(data.msg || "경매 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("경매 삭제 오류:", err);
            alert("경매 삭제 중 오류가 발생했습니다.");
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
    const unitPrice = imageboardData.imageprice || 0; // 단가

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "0"}}>
            {/* 상품명과 남은 기간 */}
            <div style={{marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div style={{fontSize: "20px", color: "#4169E1", fontWeight: "bold"}}>
                    상품명 : {imageboardData.imagename || imageboardData.productname || "웰치스"}
                </div>
                <div style={{fontSize: "16px", color: "#666", display: "flex", alignItems: "center", gap: "5px"}}>
                    {status === "진행중" ? (
                        <>
                            <i className="bi bi-clock" style={{fontSize: "18px"}}></i>
                            <span>
                                경매 마감까지: 
                                {remainingTime.isExpired ? (
                                    <span style={{color: "#d9534f", fontWeight: "bold", marginLeft: "5px"}}>종료됨</span>
                                ) : (
                                    <span style={{color: "#d9534f", fontWeight: "bold", marginLeft: "5px"}}>
                                        {remainingTime.days > 0 && `${remainingTime.days}일 `}
                                        {remainingTime.hours}시간 {remainingTime.minutes.toString().padStart(2, '0')}분 {remainingTime.seconds.toString().padStart(2, '0')}초
                                    </span>
                                )}
                            </span>
                        </>
                    ) : status === "종료" ? (
                        <>
                            <i className="bi bi-x-circle" style={{fontSize: "18px", color: "#d9534f"}}></i>
                            <span style={{color: "#d9534f", fontWeight: "bold"}}>
                                경매가 종료되었습니다.
                            </span>
                        </>
                    ) : status === "판매완료" ? (
                        <>
                            <i className="bi bi-check-circle" style={{fontSize: "18px", color: "#5cb85c"}}></i>
                            <span style={{color: "#5cb85c", fontWeight: "bold"}}>
                                판매가 완료되었습니다.
                            </span>
                        </>
                    ) : status === "포기" ? (
                        <>
                            <i className="bi bi-x-octagon" style={{fontSize: "18px", color: "#d9534f"}}></i>
                            <span style={{color: "#d9534f", fontWeight: "bold"}}>
                                경매가 포기되었습니다.
                            </span>
                        </>
                    ) : (
                        <>
                            <i className="bi bi-info-circle" style={{fontSize: "18px"}}></i>
                            <span>상태: {status || "알 수 없음"}</span>
                        </>
                    )}
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
                                <td style={{padding: "10px", fontWeight: "bold", fontSize: "13px"}}>경매 시작가격</td>
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
                        <div style={{fontSize: "16px", color: "#337ab7", fontWeight: "bold"}}>
                            <i className="bi bi-clock"></i> 경매가 진행 중입니다.
                        </div>
                    ) : status === "종료" ? (
                        <div style={{fontSize: "20px", color: "#d9534f", fontWeight: "bold"}}>
                            <i className="bi bi-x-circle"></i> 경매가 종료되었습니다.
                        </div>
                    ) : status === "판매완료" ? (
                        <div style={{fontSize: "20px", color: "#5cb85c", fontWeight: "bold"}}>
                            <i className="bi bi-check-circle"></i> 판매가 완료되었습니다.
                        </div>
                    ) : status === "포기" ? (
                        <div style={{fontSize: "20px", color: "#d9534f", fontWeight: "bold"}}>
                            <i className="bi bi-x-octagon"></i> 경매가 포기되었습니다.
                        </div>
                    ) : (
                        <div style={{fontSize: "16px", color: "#666", fontWeight: "bold"}}>
                            상태: {status || "알 수 없음"}
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
                {/* 작성자만 수정 및 경매 포기 버튼 표시 (진행중인 경우) */}
                {isAuthor() && imageboardData.status !== "포기" && status === "진행중" && (
                    <>
                        &nbsp;
                        <button 
                            className="btn btn-primary" 
                            onClick={handleModify}
                            style={{
                                backgroundColor: "#D4AF37",
                                borderColor: "#D4AF37",
                                color: "#000"
                            }}
                        >
                            <i className="bi bi-pencil-square"></i> 수정
                        </button>
                        &nbsp;
                        <button className="btn btn-danger" onClick={handleCancelAuction}>
                            <i className="bi bi-x-circle"></i> 경매 포기
                        </button>
                    </>
                )}
                {/* 작성자만 재등록 및 삭제 버튼 표시 (경매 종료된 경우) */}
                {isAuthor() && status === "종료" && (
                    <>
                        &nbsp;
                        <button 
                            className="btn btn-success" 
                            onClick={handleReRegister}
                            style={{
                                backgroundColor: "#28a745",
                                borderColor: "#28a745",
                                color: "#fff"
                            }}
                        >
                            <i className="bi bi-arrow-repeat"></i> 재등록
                        </button>
                        &nbsp;
                        <button 
                            className="btn btn-danger" 
                            onClick={handleDelete}
                        >
                            <i className="bi bi-trash"></i> 경매 삭제
                        </button>
                    </>
                )}
                {/* 작성자만 판매정보상세 및 삭제 버튼 표시 (판매완료된 경우) */}
                {isAuthor() && status === "판매완료" && (
                    <>
                        &nbsp;
                        <button 
                            className="btn btn-info" 
                            onClick={() => navigate("/member/memberInfo")}
                            style={{
                                backgroundColor: "#17a2b8",
                                borderColor: "#17a2b8",
                                color: "#fff"
                            }}
                        >
                            <i className="bi bi-person-circle"></i> 판매정보상세
                        </button>
                        &nbsp;
                        <button 
                            className="btn btn-danger" 
                            onClick={handleDelete}
                        >
                            <i className="bi bi-trash"></i> 경매 삭제
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
