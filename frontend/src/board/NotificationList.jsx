import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function NotificationList() {
    const navigate = useNavigate();
    const loginCheckedRef = useRef(false);
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showOnlyUnread, setShowOnlyUnread] = useState(false);

    useEffect(() => {
        if(loginCheckedRef.current) return;
        loginCheckedRef.current = true;
        
        // 로그인 체크
        const memberId = sessionStorage.getItem("id");
        if(!memberId) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
        
        fetchNotifications();
        fetchUnreadCount();
    }, [navigate, showOnlyUnread]);

    // 알림 목록 조회
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const memberId = sessionStorage.getItem("id");
            const url = showOnlyUnread
                ? `http://localhost:8080/board/notification/unread?memberId=${memberId}`
                : `http://localhost:8080/board/notification/list?memberId=${memberId}`;
            
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if(data.rt === "OK") {
                setNotifications(data.list || []);
            } else {
                setError(data.msg || "알림 목록을 불러오는데 실패했습니다.");
            }
        } catch(err) {
            console.error("알림 목록 조회 오류:", err);
            setError("알림 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 안읽은 알림 수 조회
    const fetchUnreadCount = async () => {
        try {
            const memberId = sessionStorage.getItem("id");
            const response = await fetch(`http://localhost:8080/board/notification/unread-count?memberId=${memberId}`);
            const data = await response.json();
            if(data.rt === "OK") {
                setUnreadCount(data.count || 0);
            }
        } catch(err) {
            console.error("안읽은 알림 수 조회 오류:", err);
        }
    };

    // 알림 읽음 처리
    const handleMarkAsRead = async (notificationSeq) => {
        try {
            const response = await fetch("http://localhost:8080/board/notification/read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ notificationSeq: notificationSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                fetchNotifications();
                fetchUnreadCount();
            } else {
                alert(data.msg || "알림 읽음 처리에 실패했습니다.");
            }
        } catch(err) {
            console.error("알림 읽음 처리 오류:", err);
            alert("알림 읽음 처리 중 오류가 발생했습니다.");
        }
    };

    // 모든 알림 읽음 처리
    const handleMarkAllAsRead = async () => {
        try {
            const memberId = sessionStorage.getItem("id");
            const response = await fetch("http://localhost:8080/board/notification/read-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ memberId: memberId })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "모든 알림이 읽음 처리되었습니다.");
                fetchNotifications();
                fetchUnreadCount();
            } else {
                alert(data.msg || "알림 읽음 처리에 실패했습니다.");
            }
        } catch(err) {
            console.error("알림 읽음 처리 오류:", err);
            alert("알림 읽음 처리 중 오류가 발생했습니다.");
        }
    };

    // 알림 삭제
    const handleDelete = async (notificationSeq) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/board/notification/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ notificationSeq: notificationSeq })
            });

            const data = await response.json();
            
            if(data.rt === "OK") {
                alert(data.msg || "알림이 삭제되었습니다.");
                fetchNotifications();
                fetchUnreadCount();
            } else {
                alert(data.msg || "알림 삭제에 실패했습니다.");
            }
        } catch(err) {
            console.error("알림 삭제 오류:", err);
            alert("알림 삭제 중 오류가 발생했습니다.");
        }
    };

    // 알림 클릭 처리 (게시글로 이동)
    const handleNotificationClick = (notification) => {
        // 읽음 처리
        if(notification.isRead !== "Y") {
            handleMarkAsRead(notification.notificationSeq);
        }
        
        // 게시글로 이동
        if(notification.relatedPostSeq) {
            navigate(`/board/post/${notification.relatedPostSeq}`);
        }
    };

    return (
        <div style={{
            maxWidth: "800px",
            margin: "auto",
            padding: "20px",
            marginTop: "70px"
        }}>
            <h2 style={{
                marginBottom: "30px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center"
            }}>
                알림 목록
            </h2>

            {/* 필터 및 버튼 */}
            <div style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontWeight: "bold", color: "#333" }}>
                        <input
                            type="checkbox"
                            checked={showOnlyUnread}
                            onChange={(e) => setShowOnlyUnread(e.target.checked)}
                            style={{ marginRight: "5px" }}
                        />
                        안읽은 알림만
                    </label>
                    {unreadCount > 0 && (
                        <span style={{
                            padding: "4px 8px",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold"
                        }}>
                            {unreadCount}개
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#337ab7",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        모두 읽음 처리
                    </button>
                )}
            </div>

            {error && (
                <div style={{
                    padding: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div>
                    {notifications.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666"
                        }}>
                            알림이 없습니다.
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.notificationSeq}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: "15px",
                                        marginBottom: "10px",
                                        backgroundColor: notification.isRead === "Y" ? "#fff" : "#e7f3ff",
                                        borderRadius: "8px",
                                        border: notification.isRead === "Y" ? "1px solid #dee2e6" : "2px solid #337ab7",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateX(5px)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateX(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start"
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: "14px",
                                                fontWeight: notification.isRead === "Y" ? "normal" : "bold",
                                                color: "#333",
                                                marginBottom: "5px"
                                            }}>
                                                {notification.notificationContent || "새로운 알림이 있습니다."}
                                            </div>
                                            <div style={{
                                                fontSize: "12px",
                                                color: "#666"
                                            }}>
                                                {new Date(notification.createdDate).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            gap: "5px"
                                        }}>
                                            {notification.isRead !== "Y" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.notificationSeq);
                                                    }}
                                                    style={{
                                                        padding: "4px 8px",
                                                        backgroundColor: "#28a745",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "11px"
                                                    }}
                                                >
                                                    읽음
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.notificationSeq);
                                                }}
                                                style={{
                                                    padding: "4px 8px",
                                                    backgroundColor: "#dc3545",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "11px"
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 뒤로가기 버튼 */}
            <div style={{
                marginTop: "30px",
                textAlign: "center"
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    뒤로가기
                </button>
            </div>
        </div>
    );
}

export default NotificationList;

