import "./chart.css";

// 공동구매 컴포넌트 (GOLD 탭의 오른쪽 패널) - 금 구매 관련
function News({ newsList, newsLoading, newsError }) {
    // 금 구매 관련 공동구매 샘플 데이터
    const groupBuyList = [
        {
            title: "순금 1돈 공동구매",
            price: 285000,
            targetAmount: 10000000,
            currentAmount: 7500000,
            participants: 26,
            deadline: "2024.01.25",
            status: "진행중"
        },
        {
            title: "금괴 1kg 공동구매",
            price: 75000000,
            targetAmount: 150000000,
            currentAmount: 120000000,
            participants: 1,
            deadline: "2024.01.30",
            status: "진행중"
        },
        {
            title: "금반지 세트 공동구매",
            price: 1500000,
            targetAmount: 5000000,
            currentAmount: 3200000,
            participants: 2,
            deadline: "2024.01.20",
            status: "진행중"
        },
        {
            title: "금 목걸이 공동구매",
            price: 850000,
            targetAmount: 3000000,
            currentAmount: 3000000,
            participants: 3,
            deadline: "2024.01.18",
            status: "완료"
        },
        {
            title: "금 팔찌 공동구매",
            price: 1200000,
            targetAmount: 4000000,
            currentAmount: 2800000,
            participants: 2,
            deadline: "2024.01.22",
            status: "진행중"
        }
    ];

    // 진행률 계산 함수
    const getProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    return (
        <div className="news-container">
            <h3 className="news-title">
                금 구매 공동구매
            </h3>
            
            {/* 공동구매 목록 */}
            <div className="news-list">
                {newsLoading ? (
                    <div className="news-loading">
                        공동구매 정보를 불러오는 중...
                    </div>
                ) : newsError ? (
                    <div className="news-error">
                        <div className="news-error-icon">⚠️</div>
                        <div>{newsError}</div>
                        <div className="news-error-detail">
                            브라우저 콘솔을 확인해주세요.
                        </div>
                    </div>
                ) : groupBuyList.length === 0 ? (
                    <div className="news-empty">
                        진행 중인 공동구매가 없습니다.
                    </div>
                ) : (
                    <div>
                        {groupBuyList.map((item, index) => {
                            const progress = getProgress(item.currentAmount, item.targetAmount);
                            
                            return (
                                <div key={index} className={`news-item ${item.status === '완료' ? 'completed' : ''}`}>
                                    {/* 제목 */}
                                    <div className="news-item-title">
                                        {item.title}
                                    </div>
                                    
                                    {/* 가격 정보 */}
                                    <div className="groupbuy-price">
                                        <span className="price-label">개당 가격</span>
                                        <span className="price-value">{item.price.toLocaleString()}원</span>
                                    </div>
                                    
                                    {/* 진행률 */}
                                    <div className="groupbuy-progress">
                                        <div className="progress-info">
                                            <span className="progress-label">진행률</span>
                                            <span className="progress-percent">{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="progress-amount">
                                            {item.currentAmount.toLocaleString()}원 / {item.targetAmount.toLocaleString()}원
                                        </div>
                                    </div>
                                    
                                    {/* 참여자 및 마감일 */}
                                    <div className="groupbuy-info">
                                        <div className="info-item">
                                            <span className="info-label">참여자</span>
                                            <span className="info-value">{item.participants}명</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">마감일</span>
                                            <span className="info-value">{item.deadline}</span>
                                        </div>
                                        <div className={`status-badge ${item.status === '완료' ? 'completed' : 'ongoing'}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* 데이터 출처 표기 */}
            <div className="news-source-link">
                샘플 데이터 (실제 API 연동 시 교체)
            </div>
        </div>
    );
}

export default News;

