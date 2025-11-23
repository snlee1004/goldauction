import "./chart.css";

// 뉴스 컴포넌트 (GOLD 탭의 오른쪽 패널) - 샘플 데이터
function News({ newsList, newsLoading, newsError }) {
    // 샘플 뉴스 데이터 - 한국어
    const sampleNews = [
        {
            title: "금 시세 연중 최고치 기록하며 투자자들 관심 집중",
            description: "국제 금 시세가 올해 들어 최고치를 기록하며 상승세를 이어가고 있습니다. 투자자들의 안전자산 선호가 높아지면서 금 수요가 급증하고 있으며, 전문가들은 이 추세가 당분간 지속될 것으로 전망하고 있습니다.",
            source: "경제일보"
        },
        {
            title: "중앙은행 금리 인하 기대감 확산으로 금 시장에 긍정적 영향",
            description: "주요 중앙은행들의 금리 인하 기대감이 확산되면서 금 시장에 긍정적인 영향을 미치고 있습니다. 금리 하락 시 금 투자 수익률이 높아질 수 있어 투자자들의 관심이 집중되고 있습니다.",
            source: "금융뉴스"
        },
        {
            title: "경제 불확실성 속 금 투자 급증하며 안전자산 선호 증가",
            description: "글로벌 경제 불확실성이 지속되면서 투자자들의 금 투자가 크게 증가하고 있습니다. 주식과 채권 등 위험자산 대신 안정적인 금에 대한 선호도가 높아지고 있는 추세입니다.",
            source: "투자타임스"
        },
        {
            title: "금 ETF 거래량 급증하며 개인투자자 관심 높아져",
            description: "금 ETF 거래량이 급증하며 개인투자자들의 관심이 높아지고 있습니다. 접근성이 좋은 금 ETF를 통해 금 투자에 참여하는 투자자들이 크게 늘어나고 있으며, 이는 금 시장 활성화에 기여하고 있습니다.",
            source: "증권일보"
        },
        {
            title: "금 채굴 기업 주가 상승세 지속하며 시세 상승 수혜",
            description: "금 시세 상승에 힘입어 금 채굴 기업들의 주가가 상승세를 보이고 있습니다. 금 가격 상승으로 인한 수익성 개선 기대감이 주가 상승의 주요 동력으로 작용하고 있습니다.",
            source: "산업뉴스"
        }
    ];

    // 항상 한국어 샘플 데이터 사용 (API 데이터 무시)
    const displayNews = sampleNews;

    return (
        <div className="news-container">
            <h3 className="news-title">
                경제 뉴스 브리핑
            </h3>
            
            {/* 뉴스 목록 */}
            <div className="news-list">
                {newsLoading ? (
                    <div className="news-loading">
                        뉴스를 불러오는 중...
                    </div>
                ) : newsError ? (
                    <div className="news-error">
                        <div className="news-error-icon">⚠️</div>
                        <div>{newsError}</div>
                        <div className="news-error-detail">
                            브라우저 콘솔을 확인해주세요.
                        </div>
                    </div>
                ) : displayNews.length === 0 ? (
                    <div className="news-empty">
                        뉴스가 없습니다.
                    </div>
                ) : (
                    <div>
                        {displayNews.map((news, index) => {
                            return (
                                <div key={index} className="news-item">
                                    {/* 타이틀 */}
                                    <div className="news-item-title">
                                        {news.title}
                                    </div>
                                    
                                    {/* 내용 (2줄로 제한) */}
                                    {news.description && (
                                        <div className="news-item-description">
                                            {news.description}
                                        </div>
                                    )}
                                    
                                    {/* 출처 */}
                                    <div className="news-item-source">
                                        {news.source}
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
