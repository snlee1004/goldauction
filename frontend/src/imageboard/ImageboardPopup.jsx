import { useState, useEffect } from "react";

function ImageboardPopup({ imageboardSeq, imageboardData, isOpen, onClose }) {
    const [allImages, setAllImages] = useState([]); // 모든 상품 이미지 목록
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 표시 시작 인덱스
    const [imagesPerPage, setImagesPerPage] = useState(3); // 한 번에 표시할 이미지 수

    // 모든 이미지 가져오기
    const fetchAllImages = async (seq) => {
        if(!seq) return;
        
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/imageboard/images?imageboardSeq=${seq}`);
            const data = await response.json();
            console.log("이미지 목록 응답:", data); // 디버깅용
            if(data.rt === "OK") {
                const images = data.items || [];
                console.log("가져온 이미지 목록:", images); // 디버깅용
                // 이미지가 없으면 대표 이미지(image1)를 사용
                if(images.length === 0 && imageboardData?.image1) {
                    setAllImages([{
                        imgSeq: 0,
                        imageboardSeq: seq,
                        imagePath: imageboardData.image1,
                        imageOrder: 1
                    }]);
                } else {
                    setAllImages(images);
                }
            } else {
                // 이미지가 없으면 대표 이미지(image1)를 사용
                if(imageboardData?.image1) {
                    setAllImages([{
                        imgSeq: 0,
                        imageboardSeq: seq,
                        imagePath: imageboardData.image1,
                        imageOrder: 1
                    }]);
                } else {
                    setAllImages([]);
                }
            }
        } catch(err) {
            console.error("이미지 목록 조회 오류:", err);
            // 에러 발생 시 대표 이미지(image1)를 사용
            if(imageboardData?.image1) {
                setAllImages([{
                    imgSeq: 0,
                    imageboardSeq: seq,
                    imagePath: imageboardData.image1,
                    imageOrder: 1
                }]);
            } else {
                setAllImages([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // 팝업이 열릴 때 이미지 목록 가져오기
    useEffect(() => {
        if(isOpen && imageboardSeq) {
            fetchAllImages(imageboardSeq);
            setCurrentIndex(0); // 팝업 열릴 때 인덱스 초기화
        }
    }, [isOpen, imageboardSeq]);

    // 화면 크기에 따라 표시할 이미지 수 조정
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if(width >= 1600) {
                setImagesPerPage(4);
            } else if(width >= 1200) {
                setImagesPerPage(3);
            } else if(width >= 800) {
                setImagesPerPage(2);
            } else {
                setImagesPerPage(1);
            }
        };
        
        handleResize(); // 초기 설정
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 이전 이미지로 이동
    const handlePrev = () => {
        setCurrentIndex(prev => Math.max(0, prev - imagesPerPage));
    };

    // 다음 이미지로 이동
    const handleNext = () => {
        setCurrentIndex(prev => Math.min(allImages.length - imagesPerPage, prev + imagesPerPage));
    };

    // 현재 표시할 이미지들
    const displayedImages = allImages.slice(currentIndex, currentIndex + imagesPerPage);
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex + imagesPerPage < allImages.length;

    if(!isOpen) return null;

    return (
        <div 
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "40px",
                    width: "98%",
                    maxWidth: "1600px",
                    maxHeight: "98%",
                    overflow: "auto",
                    position: "relative"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    ×
                </button>
                
                <h3 style={{marginTop: "0", marginBottom: "20px", textAlign: "center"}}>
                    상품 이미지 전체보기 ({allImages.length}장)
                </h3>
                
                {loading ? (
                    <div style={{padding: "40px", textAlign: "center", color: "#666"}}>
                        <i className="bi bi-arrow-repeat" style={{animation: "spin 1s linear infinite"}}></i> 로딩 중...
                    </div>
                ) : allImages.length === 0 ? (
                    <div style={{padding: "40px", textAlign: "center", color: "#666"}}>
                        등록된 이미지가 없습니다.
                    </div>
                ) : (
                    <div style={{position: "relative"}}>
                        {/* 좌측 화살표 */}
                        {allImages.length > imagesPerPage && canGoPrev && (
                            <button
                                onClick={handlePrev}
                                style={{
                                    position: "absolute",
                                    left: "-50px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "50px",
                                    height: "50px",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 10
                                }}
                            >
                                ‹
                            </button>
                        )}

                        {/* 이미지 그리드 */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${imagesPerPage}, 1fr)`,
                            gap: "20px",
                            minHeight: "300px"
                        }}>
                            {displayedImages.map((img, index) => {
                                const actualIndex = currentIndex + index;
                                const imageUrl = img.imagePath ? `http://localhost:8080/storage/${img.imagePath}` : null;
                                return (
                                    <div key={img.imgSeq || actualIndex} style={{textAlign: "center"}}>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={`상품 이미지 ${actualIndex + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "300px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "2px solid #ddd",
                                                    cursor: "pointer"
                                                }}
                                                onError={(e) => {
                                                    console.error("이미지 로드 실패:", imageUrl);
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: "100%",
                                                height: "300px",
                                                backgroundColor: "#f0f0f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "8px",
                                                border: "2px solid #ddd"
                                            }}>
                                                <i className="bi bi-image" style={{color: "#999", fontSize: "48px"}}></i>
                                            </div>
                                        )}
                                        <div style={{marginTop: "12px", fontSize: "14px", color: "#666", fontWeight: "bold"}}>
                                            {img.imageOrder === 1 ? "대표 이미지" : `이미지 ${img.imageOrder || actualIndex + 1}`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 우측 화살표 */}
                        {allImages.length > imagesPerPage && canGoNext && (
                            <button
                                onClick={handleNext}
                                style={{
                                    position: "absolute",
                                    right: "-50px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "50px",
                                    height: "50px",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 10
                                }}
                            >
                                ›
                            </button>
                        )}

                        {/* 페이지 인디케이터 */}
                        {allImages.length > imagesPerPage && (
                            <div style={{
                                textAlign: "center",
                                marginTop: "20px",
                                fontSize: "14px",
                                color: "#666"
                            }}>
                                {Math.floor(currentIndex / imagesPerPage) + 1} / {Math.ceil(allImages.length / imagesPerPage)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageboardPopup;

