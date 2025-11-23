// Intro.jsx에서 사용하는 API 호출 및 유틸리티 함수들

// 입찰 베스트 목록 조회 (입찰자 수 기준 정렬)
export const fetchBestBids = async (setBestBidList) => {
    try {
        const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=1`);
        if(response.ok) {
            const data = await response.json();
            if(data.rt === "OK") {
                // 현재 날짜
                const now = new Date();
                now.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교
                
                // 경매 종료되지 않은 항목만 필터링
                const activeItems = (data.items || []).filter(item => {
                    if(!item.auctionEndDate) {
                        return true; // 종료일이 없으면 진행 중으로 간주
                    }
                    const endDate = new Date(item.auctionEndDate);
                    endDate.setHours(0, 0, 0, 0);
                    return endDate >= now; // 종료일이 오늘 이후이거나 오늘인 경우만 포함
                });
                
                // 입찰 수 기준으로 정렬 (내림차순)
                const sorted = [...activeItems].sort((a, b) => {
                    const bidCountA = a.bidCount || 0;
                    const bidCountB = b.bidCount || 0;
                    return bidCountB - bidCountA;
                });
                setBestBidList(sorted.slice(0, 5)); // 상위 5개만
            }
        }
    } catch(err) {
        console.error("입찰 베스트 조회 오류:", err);
    }
};

// 최근 등록순 목록 조회
export const fetchRecentList = async (setRecentList) => {
    try {
        const response = await fetch(`http://localhost:8080/imageboard/imageboardList?pg=1`);
        if(response.ok) {
            const data = await response.json();
            if(data.rt === "OK") {
                // 등록일 기준으로 정렬 (내림차순)
                const sorted = [...(data.items || [])].sort((a, b) => {
                    const timeA = a.logtime ? new Date(a.logtime).getTime() : 0;
                    const timeB = b.logtime ? new Date(b.logtime).getTime() : 0;
                    return timeB - timeA;
                });
                setRecentList(sorted.slice(0, 5)); // 상위 5개만
            }
        }
    } catch(err) {
        console.error("최근 등록순 조회 오류:", err);
    }
};

// 네이버 경제 뉴스 조회 (금 관련) - 백엔드 프록시를 통해 호출
export const fetchGoldNews = async (setNewsList, setNewsLoading, setNewsError) => {
    setNewsLoading(true);
    setNewsError(null);
    try {
        // 백엔드 프록시 API 호출
        const apiUrl = `http://localhost:8080/news/gold?query=${encodeURIComponent('금 시세 경제')}&display=10`;
        
        console.log("뉴스 API 호출 시작:", apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log("뉴스 API 응답 상태:", response.status, response.statusText);
        
        if(response.ok) {
            const result = await response.json();
            console.log("뉴스 API 응답 데이터:", result);
            
            if(result.rt === "OK" && result.data && result.data.items && Array.isArray(result.data.items) && result.data.items.length > 0) {
                console.log("뉴스 개수:", result.data.items.length);
                setNewsList(result.data.items);
                setNewsError(null);
            } else {
                console.warn("뉴스 데이터가 없거나 배열이 아닙니다:", result);
                setNewsList([]);
                setNewsError(result.msg || "뉴스 데이터를 찾을 수 없습니다.");
            }
        } else {
            const errorText = await response.text();
            console.error("뉴스 API 호출 실패:", response.status, errorText);
            setNewsList([]);
            setNewsError(`API 호출 실패 (${response.status}): ${errorText}`);
        }
    } catch(err) {
        console.error("뉴스 조회 오류:", err);
        setNewsList([]);
        setNewsError(`오류 발생: ${err.message}`);
    } finally {
        setNewsLoading(false);
    }
};

// 임시 데이터로 금 시세 설정
export const fetchGoldPrice = async (activeTab, setPriceLoading, setTradingStandard, setYearComparisonData, setDomesticChartData, setInternationalChartData) => {
    if(activeTab !== "GOLD") return; // GOLD 탭일 때만 조회
    
    setPriceLoading(true);
    try {
        // 임시 데이터 설정
        const now = new Date();
        const lastUpdate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        // 임시 매매기준가 데이터
        setTradingStandard({
            quotationTime: lastUpdate,
            internationalPrice: 2650.50,
            exchangeRate: 1467.03,
            priceChange: 23.44,
            rateChange: -1.68
        });
        
        // 임시 전년 대비 데이터
        setYearComparisonData([
            { name: "전년", value: 600000 },
            { name: "오늘", value: 845000 }
        ]);
        
        // 임시 국내 시세 차트 데이터
        setDomesticChartData([
            { date: "06-01", price: 600000 },
            { date: "07-01", price: 638000 },
            { date: "08-01", price: 720000 },
            { date: "09-01", price: 900000 },
            { date: "10-01", price: 845000 },
            { date: "11-01", price: 850000 },
            { date: "12-01", price: 880000 }
        ]);
        
        // 임시 국제 시세 차트 데이터
        setInternationalChartData([
            { date: "06-01", price: 3200 },
            { date: "07-01", price: 3400 },
            { date: "08-01", price: 3800 },
            { date: "09-01", price: 4400 },
            { date: "10-01", price: 4108 },
            { date: "11-01", price: 4150 },
            { date: "12-01", price: 4300 }
        ]);
    } catch(err) {
        console.error("금 시세 데이터 설정 오류:", err);
    } finally {
        setPriceLoading(false);
    }
};

// 노출 중인 팝업 조회
export const fetchVisiblePopups = async (setPopupList, setShowPopup, setCurrentPopup, setCurrentPopupIndex) => {
    try {
        const response = await fetch("http://localhost:8080/popup/visible");
        if(response.ok) {
            const data = await response.json();
            if(data.rt === "OK" && data.items && data.items.length > 0) {
                // 오늘 하루 보지 않기 체크
                const today = new Date().toDateString();
                const visiblePopups = data.items.filter(popup => {
                    const hiddenDate = localStorage.getItem(`popup_${popup.popupSeq}_hidden`);
                    // localStorage에 저장된 날짜가 오늘이 아니면 표시
                    return hiddenDate !== today;
                });
                
                if(visiblePopups.length > 0) {
                    setPopupList(visiblePopups);
                    setCurrentPopupIndex(0);
                    setCurrentPopup(visiblePopups[0]); // 첫 번째 팝업 표시
                    setShowPopup(true);
                }
            }
        }
    } catch(err) {
        console.error("팝업 조회 오류:", err);
    }
};

// 팝업 닫기 (다음 팝업이 있으면 표시)
export const handleClosePopup = (currentPopupIndex, popupList, setCurrentPopupIndex, setCurrentPopup, setShowPopup) => {
    const nextIndex = currentPopupIndex + 1;
    if(nextIndex < popupList.length) {
        // 다음 팝업 표시
        setCurrentPopupIndex(nextIndex);
        setCurrentPopup(popupList[nextIndex]);
    } else {
        // 모든 팝업을 표시했으면 닫기
        setShowPopup(false);
        setCurrentPopup(null);
        setCurrentPopupIndex(0);
    }
};

// 현재 적용된 차트셋 조회 및 컴포넌트 로드
export const loadChartSet = async (setCurrentChartSet, setChartComponent, setNewsComponent, setChartComponentsLoaded) => {
    try {
        const response = await fetch("http://localhost:8080/chart/current");
        if(response.ok) {
            const data = await response.json();
            if(data.rt === "OK" && data.name) {
                const chartSetName = data.name;
                setCurrentChartSet(chartSetName);
                
                // 차트셋 컴포넌트 동적 import
                try {
                    const chartModule = await import(`../chart/${chartSetName}/Chart.jsx`);
                    const newsModule = await import(`../chart/${chartSetName}/News.jsx`);
                    setChartComponent(() => chartModule.default);
                    setNewsComponent(() => newsModule.default);
                    setChartComponentsLoaded(true);
                    console.log("차트셋 로드 성공:", chartSetName);
                } catch(err) {
                    console.error("차트셋 컴포넌트 로드 실패, 기본값 사용:", err);
                    // 기본값 사용
                    try {
                        const chartModule = await import(`../chart/chartSet_1/Chart.jsx`);
                        const newsModule = await import(`../chart/chartSet_1/News.jsx`);
                        setChartComponent(() => chartModule.default);
                        setNewsComponent(() => newsModule.default);
                        setChartComponentsLoaded(true);
                        console.log("기본 차트셋 로드 성공: chartSet_1");
                    } catch(importErr) {
                        console.error("기본 차트셋 로드 실패:", importErr);
                    }
                }
            } else {
                // 응답이 OK가 아니면 기본값 사용
                console.log("차트셋 응답이 없음, 기본값 사용");
                const chartModule = await import(`../chart/chartSet_1/Chart.jsx`);
                const newsModule = await import(`../chart/chartSet_1/News.jsx`);
                setChartComponent(() => chartModule.default);
                setNewsComponent(() => newsModule.default);
                setChartComponentsLoaded(true);
            }
        } else {
            // 응답 실패 시 기본값 사용
            console.log("차트셋 API 응답 실패, 기본값 사용");
            const chartModule = await import(`../chart/chartSet_1/Chart.jsx`);
            const newsModule = await import(`../chart/chartSet_1/News.jsx`);
            setChartComponent(() => chartModule.default);
            setNewsComponent(() => newsModule.default);
            setChartComponentsLoaded(true);
        }
    } catch(err) {
        console.error("차트셋 조회 오류:", err);
        // 기본값 사용
        try {
            const chartModule = await import(`../chart/chartSet_1/Chart.jsx`);
            const newsModule = await import(`../chart/chartSet_1/News.jsx`);
            setChartComponent(() => chartModule.default);
            setNewsComponent(() => newsModule.default);
            setChartComponentsLoaded(true);
            console.log("기본 차트셋 로드 성공 (오류 후): chartSet_1");
        } catch(importErr) {
            console.error("기본 차트셋 로드 실패:", importErr);
        }
    }
};

