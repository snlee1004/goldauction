import { useState } from "react";
import "./chart.css";

// 차트 컴포넌트 (GOLD 탭의 왼쪽 패널)
function Chart({ domesticPeriod, setDomesticPeriod }) {
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
                        onClick={() => setDomesticPeriod(period)}
                        className={`chart-period-btn ${domesticPeriod === period ? "active" : ""}`}
                    >
                        {period}
                    </button>
                ))}
            </div>
            
            {/* TradingView Mini Chart - 국내 금시세 (KRW) */}
            <div className="chart-area">
                <div style={{ width: "100%", height: "100%" }}>
                    {(() => {
                        // 기간에 따라 interval 조정
                        const getInterval = (period) => {
                            switch(period) {
                                case "1개월": return "D";
                                case "5개월": return "W";
                                case "1년": return "M";
                                case "3년": return "12M";
                                default: return "D";
                            }
                        };
                        
                        const interval = getInterval(domesticPeriod);
                        const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_domestic_${domesticPeriod}&symbol=OANDA:XAUUSD&interval=${interval}&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Asia%2FSeoul&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=kr&utm_source=www.koreagoldx.co.kr&utm_medium=widget&utm_campaign=chart&utm_term=OANDA:XAUUSD`;
                        
                        return (
                            <iframe
                                key={domesticPeriod}
                                src={widgetUrl}
                                className="chart-iframe"
                                title="국내 금시세 차트"
                            />
                        );
                    })()}
                </div>
            </div>
            
            {/* 데이터 출처 표기 */}
            <div className="chart-source">
                데이터 출처: TradingView
            </div>
        </div>
    );
}

export default Chart;

