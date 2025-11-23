import { useEffect } from "react";

function CssLoader() {
    useEffect(() => {
        // 활성화된 CSS 조회 및 적용
        const loadActiveCss = async () => {
            try {
                const response = await fetch("http://localhost:8080/css/apply/active");
                if(response.ok) {
                    const data = await response.json();
                    console.log("CSS 로드 응답:", data); // 디버깅용
                    
                    if(data.rt === "OK" && data.data) {
                        // 기존 동적 CSS 제거
                        const existingStyles = document.querySelectorAll('style[data-dynamic-css]');
                        existingStyles.forEach(style => style.remove());
                        
                        // default_set인 경우 해당 스타일셋의 CSS 적용
                        if(data.data.setName === "default_set") {
                            console.log("default_set 적용 시작, CSS 파일 수:", data.data.cssFiles?.length || 0);
                            
                            // default_set의 CSS 파일이 있으면 적용
                            if(data.data.cssFiles && data.data.cssFiles.length > 0) {
                                data.data.cssFiles.forEach(cssFile => {
                                    if(cssFile.cssContent && cssFile.cssContent.trim() !== "") {
                                        const style = document.createElement("style");
                                        style.setAttribute("data-dynamic-css", cssFile.fileType);
                                        style.setAttribute("data-css-set", "default_set");
                                        style.textContent = cssFile.cssContent;
                                        document.head.appendChild(style);
                                        console.log(`default_set ${cssFile.fileType}.css 적용됨`);
                                    } else {
                                        console.log(`default_set ${cssFile.fileType}.css 내용이 비어있음`);
                                    }
                                });
                            } else {
                                console.warn("default_set CSS 파일이 없습니다.");
                            }
                            return;
                        }
                        
                        // default_set이 아닌 경우 CSS 파일 적용
                        if(data.data.cssFiles && data.data.cssFiles.length > 0) {
                            // 새로운 CSS 적용 (각 스타일셋의 독립적인 CSS)
                            data.data.cssFiles.forEach(cssFile => {
                                // 빈 CSS 내용은 스킵
                                if(!cssFile.cssContent || cssFile.cssContent.trim() === "") {
                                    return;
                                }
                                
                                const style = document.createElement("style");
                                style.setAttribute("data-dynamic-css", cssFile.fileType);
                                style.setAttribute("data-css-set", data.data.setName);
                                style.textContent = cssFile.cssContent;
                                // 동적 CSS를 head의 맨 끝에 추가하여 우선순위 높임
                                document.head.appendChild(style);
                            });
                        }
                    } else if(data.rt === "OK" && !data.data) {
                        // 적용된 CSS가 없는 경우 (default_set 또는 적용 해제 상태)
                        // 기존 동적 CSS만 제거
                        const existingStyles = document.querySelectorAll('style[data-dynamic-css]');
                        existingStyles.forEach(style => style.remove());
                        console.log("적용된 CSS 없음: 모든 동적 CSS 제거됨");
                    }
                } else {
                    console.error("CSS API 응답 오류:", response.status, response.statusText);
                }
            } catch(err) {
                console.error("CSS 로드 오류:", err);
            }
        };
        
        // 페이지 로드 후 약간의 지연을 두고 CSS 로드 (DOM이 완전히 준비된 후)
        const timer = setTimeout(() => {
            loadActiveCss();
        }, 100);
        
        // 주기적으로 CSS 갱신 (5분마다)
        const interval = setInterval(loadActiveCss, 5 * 60 * 1000);
        
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return null; // 이 컴포넌트는 렌더링하지 않음
}

export default CssLoader;

