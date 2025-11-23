import "./chart.css";

// 공지사항 컴포넌트 (GOLD 탭의 왼쪽 패널) - 금 구매 관련
function Chart({ domesticPeriod, setDomesticPeriod }) {
    // 금 구매 관련 공지사항 샘플 데이터
    const noticeList = [
        {
            title: "금 구매 시 세금 혜택 안내",
            content: "금 구매 시 부가가치세 면제 혜택을 받을 수 있습니다. 순금 99.9% 이상의 금괴나 금덩이 구매 시 세금 혜택이 적용되며, 구매 증빙서류를 보관하시기 바랍니다.",
            date: "2024.01.15",
            important: true
        },
        {
            title: "금 구매 시 인증서 발급 안내",
            content: "구매하신 금의 품질을 보장하기 위해 공인 인증서를 발급해드립니다. 인증서는 구매 후 3일 이내에 발급되며, 온라인에서도 확인 가능합니다.",
            date: "2024.01.10",
            important: false
        },
        {
            title: "금 보관 서비스 이용 안내",
            content: "구매하신 금을 안전하게 보관할 수 있는 금고 서비스를 제공합니다. 월 보관료는 금액의 0.1%이며, 언제든지 인출이 가능합니다.",
            date: "2024.01.05",
            important: true
        },
        {
            title: "금 구매 시 할인 이벤트 진행",
            content: "신규 회원 가입 시 금 구매 금액의 1% 할인 혜택을 제공합니다. 이벤트 기간은 1월 한 달간이며, 중복 할인은 불가합니다.",
            date: "2024.01.01",
            important: false
        },
        {
            title: "금 구매 후 환불 정책 안내",
            content: "구매하신 금은 구매일로부터 7일 이내에 환불이 가능합니다. 단, 금의 상태가 손상되지 않은 경우에 한하며, 환불 수수료 2%가 차감됩니다.",
            date: "2023.12.28",
            important: true
        }
    ];

    return (
        <div className="chart-container">
            <h3 className="chart-title">
                금 구매 공지사항
            </h3>
            
            {/* 공지사항 목록 */}
            <div className="chart-area">
                <div className="notice-list">
                    {noticeList.map((notice, index) => (
                        <div key={index} className={`notice-item ${notice.important ? 'important' : ''}`}>
                            {/* 중요 표시 */}
                            {notice.important && (
                                <div className="notice-badge">
                                    중요
                                </div>
                            )}
                            
                            {/* 제목 */}
                            <div className="notice-item-title">
                                {notice.title}
                            </div>
                            
                            {/* 내용 */}
                            <div className="notice-item-content">
                                {notice.content}
                            </div>
                            
                            {/* 날짜 */}
                            <div className="notice-item-date">
                                {notice.date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 데이터 출처 표기 */}
            <div className="chart-source">
                샘플 데이터 (실제 API 연동 시 교체)
            </div>
        </div>
    );
}

export default Chart;

