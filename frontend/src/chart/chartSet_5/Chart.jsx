import { useState } from "react";
import "./chart.css";

// 차트 컴포넌트 (GOLD 탭의 왼쪽 패널) - 샘플 데이터
function Chart({ domesticPeriod, setDomesticPeriod }) {
    // 샘플 금 시세 데이터 (7일치)
    const sampleData = {
        "1개월": [
            { date: "1일", price: 285000 },
            { date: "2일", price: 287000 },
            { date: "3일", price: 286500 },
            { date: "4일", price: 288500 },
            { date: "5일", price: 289000 },
            { date: "6일", price: 290000 },
            { date: "7일", price: 291000 }
        ],
        "5개월": [
            { date: "1월", price: 280000 },
            { date: "2월", price: 282000 },
            { date: "3월", price: 285000 },
            { date: "4월", price: 287000 },
            { date: "5월", price: 289000 }
        ],
        "1년": [
            { date: "1분기", price: 275000 },
            { date: "2분기", price: 280000 },
            { date: "3분기", price: 285000 },
            { date: "4분기", price: 289000 }
        ],
        "3년": [
            { date: "2022", price: 270000 },
            { date: "2023", price: 280000 },
            { date: "2024", price: 289000 }
        ]
    };

    const currentData = sampleData[domesticPeriod] || sampleData["1개월"];
    const maxPrice = Math.max(...currentData.map(d => d.price));
    const minPrice = Math.min(...currentData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 1;

    return (
        <div className="chart-container">
            <h3 className="chart-title">
                국제 금 시세 (KRW/3.75g)
            </h3>
        
            {/* 기간 선택 탭 */}
            <div className="chart-period-group">
                {["1개월", "5개월", "1년", "3년"].map(period => (
                    <button
                        key={period}
                        onClick={() => setDomesticPeriod && setDomesticPeriod(period)}
                        className={`chart-period-btn ${domesticPeriod === period ? "active" : ""}`}
                    >
                        {period}
                    </button>
                ))}
            </div>
            
            {/* 샘플 차트 영역 */}
            <div className="chart-area">
                <div className="chart-content">
                    {/* 차트 그리드 */}
                    <div className="chart-grid">
                        {currentData.map((item, index) => {
                            const height = ((item.price - minPrice) / priceRange) * 100;
                            return (
                                <div key={index} className="chart-bar-wrapper">
                                    <div 
                                        className="chart-bar" 
                                        style={{ height: `${height}%` }}
                                        title={`${item.date}: ${item.price.toLocaleString()}원`}
                                    />
                                    <div className="chart-label">{item.date}</div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* 현재 가격 표시 */}
                    <div className="chart-price-info">
                        <div className="price-item">
                            <span className="price-label">현재가</span>
                            <span className="price-value">{currentData[currentData.length - 1].price.toLocaleString()}원</span>
                        </div>
                        <div className="price-item">
                            <span className="price-label">최고가</span>
                            <span className="price-value high">{maxPrice.toLocaleString()}원</span>
                        </div>
                        <div className="price-item">
                            <span className="price-label">최저가</span>
                            <span className="price-value low">{minPrice.toLocaleString()}원</span>
                        </div>
                    </div>
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
