import "./chart.css";

// 뉴스 컴포넌트 (GOLD 탭의 오른쪽 패널)
function News({ newsList, newsLoading, newsError }) {
    return (
        <div className="news-container">
            <h3 className="news-title">
                경제 뉴스 브리핑
            </h3>
            
            {/* 네이버 뉴스 목록 */}
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
                ) : newsList.length === 0 ? (
                    <div className="news-empty">
                        뉴스가 없습니다.
                    </div>
                ) : (
                    <div>
                        {newsList.map((news, index) => {
                            // HTML 태그 제거 및 텍스트만 추출
                            const cleanTitle = news.title.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                            const cleanDescription = news.description ? news.description.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : '';
                            
                            // 출처 추출
                            let source = '뉴스 출처';
                            try {
                                if(news.originallink) {
                                    source = new URL(news.originallink).hostname;
                                } else if(news.link) {
                                    source = new URL(news.link).hostname;
                                }
                            } catch(e) {
                                source = '뉴스 출처';
                            }
                            
                            return (
                                <div key={index} className="news-item">
                                    {/* 타이틀 */}
                                    <div className="news-item-title">
                                        {cleanTitle}
                                    </div>
                                    
                                    {/* 내용 (2줄로 제한) */}
                                    {cleanDescription && (
                                        <div className="news-item-description">
                                            {cleanDescription}
                                        </div>
                                    )}
                                    
                                    {/* 출처 */}
                                    <div className="news-item-source">
                                        {source}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* 데이터 출처 표기 */}
            <div className="news-source-link">
                데이터 출처: <a href="https://news.deepsearch.com/" target="_blank" rel="noopener noreferrer">https://news.deepsearch.com/</a>
            </div>
        </div>
    );
}

export default News;

