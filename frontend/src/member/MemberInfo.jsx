import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function MemberInfo() {
    const [memberData, setMemberData] = useState({});
    const [activeList, setActiveList] = useState([]); // 진행중인 경매
    const [completedList, setCompletedList] = useState([]); // 판매 완료/종료
    const [canceledList, setCanceledList] = useState([]); // 포기한 경매
    const [bidParticipatedList, setBidParticipatedList] = useState([]); // 입찰 참여한 경매
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false); // 로그인 체크 중복 방지

    useEffect(() => {
        if(loginCheckedRef.current) return; // 이미 체크했으면 리턴
        loginCheckedRef.current = true;
        
        const memId = sessionStorage.getItem("memId");
        if(!memId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        fetchMemberData(memId);
        fetchAuctionList(memId);
        fetchBidParticipatedList(memId);
    }, [navigate]);

    // 회원 정보 조회
    const fetchMemberData = async (memId) => {
        try {
            const response = await fetch(`http://localhost:8080/member/getMember?id=${memId}`);
            const data = await response.json();
            if(response.ok && data.rt === "OK") {
                setMemberData(data.member);
            } else {
                setError("회원정보를 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("회원정보 조회 오류:", err);
            setError("회원정보 조회 중 오류가 발생했습니다.");
        }
    };

    // 입찰 참여한 경매 목록 조회
    const fetchBidParticipatedList = async (memId) => {
        try {
            const response = await fetch(`http://localhost:8080/bid/auctionsByBidder?bidderId=${encodeURIComponent(memId)}`);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("입찰 참여 경매 목록 조회 응답:", data);
            
            if(data.rt === "OK") {
                setBidParticipatedList(data.items || []);
            } else {
                setBidParticipatedList([]);
            }
        } catch(err) {
            console.error("입찰 참여 경매 목록 조회 오류:", err);
            setBidParticipatedList([]);
        }
    };

    // 경매 목록 조회
    const fetchAuctionList = async (memId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/imageboard/listByMember?memberId=${encodeURIComponent(memId)}`);
            
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("경매 목록 조회 응답:", data); // 디버깅용
            
            if(data.rt === "OK") {
                setActiveList(data.activeList || []);
                setCompletedList(data.completedList || []);
                setCanceledList(data.canceledList || []);
            } else {
                const errorMsg = data.msg || "경매 목록을 불러오는데 실패했습니다.";
                setError(errorMsg);
                // 실패해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
                setActiveList([]);
                setCompletedList([]);
                setCanceledList([]);
            }
        } catch(err) {
            console.error("경매 목록 조회 오류:", err);
            const errorMsg = err.message || "경매 목록 조회 중 오류가 발생했습니다.";
            setError(errorMsg);
            // 오류 발생 시에도 빈 배열로 설정
            setActiveList([]);
            setCompletedList([]);
            setCanceledList([]);
        } finally {
            setLoading(false);
        }
    };

    // 회원정보 수정 페이지로 이동
    const handleModify = () => {
        navigate("/member/modifyForm");
    };

    // 경매 상세 페이지로 이동
    const handleViewAuction = (seq, status) => {
        if(status === "포기") {
            navigate(`/imageboard/imageboardCanceledView?seq=${seq}`);
        } else {
            navigate(`/imageboard/imageboardView?seq=${seq}`);
        }
    };

    // 상태별 스타일
    const getStatusStyle = (status) => {
        if(status === "포기") {
            return {color: "#d9534f", fontWeight: "bold"};
        } else if(status === "종료" || status === "판매완료") {
            return {color: "#5cb85c", fontWeight: "bold"};
        } else {
            return {color: "#337ab7", fontWeight: "bold"};
        }
    };

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px", marginTop: "70px", paddingTop: "10px"}}>
            {error && (
                <div style={{
                    padding: "15px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#721c24",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            {/* 회원 정보 섹션 */}
            <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden", marginBottom: "30px", display: "flex", justifyContent: "center", padding: "20px", maxWidth: "550px", margin: "0 auto 30px auto"}}>
                <table style={{margin: 0}}>
                    <tbody>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", width: "150px", textAlign: "left", fontSize: "13px"}}>닉네임</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{memberData.nickname || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>이름</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{memberData.name || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>아이디</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{memberData.id || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>성별</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{memberData.gender || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>이메일</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>
                                {memberData.email1 && memberData.email2 
                                    ? `${memberData.email1}@${memberData.email2}` 
                                    : "-"}
                            </td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>전화번호</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>
                                {memberData.tel1 && memberData.tel2 && memberData.tel3
                                    ? `${memberData.tel1}-${memberData.tel2}-${memberData.tel3}`
                                    : "-"}
                            </td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>주소</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>{memberData.addr || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{padding: "6px 12px", fontWeight: "bold", textAlign: "left", fontSize: "13px"}}>가입일</td>
                            <td style={{padding: "6px 12px", textAlign: "left", fontSize: "13px"}}>
                                {memberData.logtime 
                                    ? new Date(memberData.logtime).toLocaleDateString() 
                                    : "-"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 회원정보 수정 버튼 */}
            <div style={{textAlign: "center", marginBottom: "30px"}}>
                <button 
                    className="btn btn-primary" 
                    onClick={handleModify}
                    style={{
                        padding: "6px 12px",
                        fontSize: "13px",
                        backgroundColor: "#D4AF37",
                        borderColor: "#D4AF37",
                        color: "#000"
                    }}
                >
                    <i className="bi bi-pencil-square"></i> 회원정보 수정하기
                </button>
            </div>

            {loading && (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* 진행중인 경매 목록 */}
            <div style={{marginBottom: "30px"}}>
                <h4 style={{marginBottom: "15px", color: "#337ab7", fontSize: "16px", fontWeight: "bold"}}>진행중인 경매 ({activeList.length}건)</h4>
                {activeList.length === 0 ? (
                    <div style={{padding: "20px", textAlign: "center", color: "#666", border: "1px solid #ccc", borderRadius: "4px"}}>
                        진행중인 경매가 없습니다.
                    </div>
                ) : (
                    <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden"}}>
                        <div style={{maxHeight: "220px", overflowY: "auto"}}>
                            <table style={{margin: 0, width: "100%"}}>
                                <thead style={{position: "sticky", top: 0, backgroundColor: "#b3d9ff", zIndex: 1}}>
                                    <tr>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품코드</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품명</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>시작가격</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상태</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>등록일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeList.map(item => (
                                        <tr key={item.seq} style={{cursor: "pointer"}} onClick={() => handleViewAuction(item.seq, item.status)}>
                                            <td style={{padding: "10px", textAlign: "center"}}>{item.seq}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>{item.imagename}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>₩ {item.imageprice?.toLocaleString() || 0}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>
                                                <span style={getStatusStyle(item.status || "진행중")}>
                                                    {item.status || "진행중"}
                                                </span>
                                            </td>
                                            <td style={{padding: "10px", textAlign: "center"}}>
                                                {item.logtime ? new Date(item.logtime).toLocaleDateString() : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 판매 완료/종료된 경매 목록 */}
            <div style={{marginBottom: "30px"}}>
                <h4 style={{marginBottom: "15px", color: "#5cb85c", fontSize: "16px", fontWeight: "bold"}}>판매 완료/종료된 경매 ({completedList.length}건)</h4>
                {completedList.length === 0 ? (
                    <div style={{padding: "20px", textAlign: "center", color: "#666", border: "1px solid #ccc", borderRadius: "4px"}}>
                        판매 완료/종료된 경매가 없습니다.
                    </div>
                ) : (
                    <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden"}}>
                        <div style={{maxHeight: "220px", overflowY: "auto"}}>
                            <table style={{margin: 0, width: "100%"}}>
                                <thead style={{position: "sticky", top: 0, backgroundColor: "#b3d9ff", zIndex: 1}}>
                                    <tr>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품코드</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품명</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>시작가격</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상태</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>종료일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedList.map(item => (
                                        <tr key={item.seq} style={{cursor: "pointer"}} onClick={() => handleViewAuction(item.seq, item.status)}>
                                            <td style={{padding: "10px", textAlign: "center"}}>{item.seq}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>{item.imagename}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>₩ {item.imageprice?.toLocaleString() || 0}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>
                                                <span style={getStatusStyle(item.status)}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{padding: "10px", textAlign: "center"}}>
                                                {item.auctionEndDate ? new Date(item.auctionEndDate).toLocaleDateString() : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 입찰 참여한 경매 목록 */}
            <div style={{marginBottom: "30px"}}>
                {(() => {
                    // 자신이 등록한 경매는 제외 (imageid가 현재 로그인한 사용자 ID와 같으면 제외)
                    const memId = sessionStorage.getItem("memId");
                    const filteredList = bidParticipatedList.filter(item => {
                        // imageid가 현재 사용자 ID와 다를 때만 포함
                        return item.imageid !== memId;
                    });
                    
                    return (
                        <>
                            <h4 style={{marginBottom: "15px", color: "#b3d9ff", fontSize: "16px", fontWeight: "bold"}}>입찰 참여한 경매 ({filteredList.length}건)</h4>
                            {filteredList.length === 0 ? (
                                <div style={{padding: "20px", textAlign: "center", color: "#666", border: "1px solid #ccc", borderRadius: "4px"}}>
                                    입찰에 참여한 경매가 없습니다.
                                </div>
                            ) : (
                                <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden"}}>
                                    <div style={{maxHeight: "220px", overflowY: "auto"}}>
                                        <table style={{margin: 0, width: "100%"}}>
                                            <thead style={{position: "sticky", top: 0, backgroundColor: "#b3d9ff", zIndex: 1}}>
                                                <tr>
                                                    <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품코드</th>
                                                    <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품명</th>
                                                    <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>내 최고 입찰가</th>
                                                    <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상태</th>
                                                    <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>종료일</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredList.map(item => {
                                                    // 상태가 진행중인지 확인
                                                    const isActive = (item.status || "진행중") === "진행중";
                                                    
                                                    return (
                                                        <tr 
                                                            key={item.seq} 
                                                            style={{
                                                                cursor: isActive ? "pointer" : "not-allowed",
                                                                opacity: isActive ? 1 : 0.6
                                                            }} 
                                                            onClick={isActive ? () => handleViewAuction(item.seq, item.status) : undefined}
                                                        >
                                                            <td style={{
                                                                padding: "10px", 
                                                                textAlign: "center",
                                                                textDecoration: isActive ? "none" : "line-through"
                                                            }}>
                                                                {item.seq}
                                                            </td>
                                                            <td style={{
                                                                padding: "10px", 
                                                                textAlign: "center",
                                                                textDecoration: isActive ? "none" : "line-through"
                                                            }}>
                                                                {item.imagename}
                                                            </td>
                                                            <td style={{
                                                                padding: "10px", 
                                                                textAlign: "center", 
                                                                color: "#d9534f", 
                                                                fontWeight: "bold",
                                                                textDecoration: isActive ? "none" : "line-through"
                                                            }}>
                                                                ₩ {item.myMaxBidAmount?.toLocaleString() || 0}
                                                            </td>
                                                            <td style={{
                                                                padding: "10px", 
                                                                textAlign: "center",
                                                                textDecoration: isActive ? "none" : "line-through"
                                                            }}>
                                                                <span style={getStatusStyle(item.status || "진행중")}>
                                                                    {item.status || "진행중"}
                                                                </span>
                                                            </td>
                                                            <td style={{
                                                                padding: "10px", 
                                                                textAlign: "center",
                                                                textDecoration: isActive ? "none" : "line-through"
                                                            }}>
                                                                {item.auctionEndDate ? new Date(item.auctionEndDate).toLocaleDateString() : "-"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            {/* 포기한 경매 목록 */}
            <div style={{marginBottom: "30px"}}>
                <h4 style={{marginBottom: "15px", color: "#d9534f", fontSize: "16px", fontWeight: "bold"}}>포기한 경매 ({canceledList.length}건)</h4>
                {canceledList.length === 0 ? (
                    <div style={{padding: "20px", textAlign: "center", color: "#666", border: "1px solid #ccc", borderRadius: "4px"}}>
                        포기한 경매가 없습니다.
                    </div>
                ) : (
                    <div style={{border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden"}}>
                        <div style={{maxHeight: "220px", overflowY: "auto"}}>
                            <table style={{margin: 0, width: "100%"}}>
                                <thead style={{position: "sticky", top: 0, backgroundColor: "#b3d9ff", zIndex: 1}}>
                                    <tr>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품코드</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상품명</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>시작가격</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>상태</th>
                                        <th style={{padding: "10px", fontWeight: "bold", textAlign: "center"}}>등록일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {canceledList.map(item => (
                                        <tr key={item.seq} style={{cursor: "pointer"}} onClick={() => handleViewAuction(item.seq, item.status)}>
                                            <td style={{padding: "10px", textAlign: "center"}}>{item.seq}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>{item.imagename}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>₩ {item.imageprice?.toLocaleString() || 0}</td>
                                            <td style={{padding: "10px", textAlign: "center"}}>
                                                <span style={getStatusStyle(item.status)}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{padding: "10px", textAlign: "center"}}>
                                                {item.logtime ? new Date(item.logtime).toLocaleDateString() : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MemberInfo;

