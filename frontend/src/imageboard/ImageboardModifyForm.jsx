import {useState, useRef, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import { validateModify } from "../script/imageboardValidation";

function ImageboardModifyForm() {
    const [seq, setSeq] = useState(0);
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [startPrice, setStartPrice] = useState("");
    const [auctionPeriod, setAuctionPeriod] = useState("");
    const [transactionMethod, setTransactionMethod] = useState("");
    const [description, setDescription] = useState("");
    const [imageFiles, setImageFiles] = useState([]); // 새로 추가할 이미지 파일들
    const [imagePreviews, setImagePreviews] = useState([]); // 새 이미지 미리보기
    const [existingImages, setExistingImages] = useState([]); // 기존 이미지들

    const productNameRef = useRef(null);
    const categoryRef = useRef(null);
    const startPriceRef = useRef(null);
    const auctionPeriodRef = useRef(null);
    const transactionMethodRef = useRef(null);
    const descriptionRef = useRef(null);
    const imgRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const loginCheckedRef = useRef(false); // 로그인 체크 중복 방지

    // 로그인 상태 확인 - 로그인하지 않았으면 로그인 페이지로 리다이렉트
    useEffect(() => {
        if(loginCheckedRef.current) return; // 이미 체크했으면 리턴
        loginCheckedRef.current = true;
        
        const memId = sessionStorage.getItem("memId");
        const memName = sessionStorage.getItem("memName");
        if(!memId || !memName) {
            alert("로그인이 필요합니다.");
            navigate("/member/loginForm");
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const seqParam = parseInt(queryParams.get("seq"));
        setSeq(seqParam);
        if(seqParam) {
            fetchBoardData(seqParam);
        }
    }, [location]);

    // 기존 데이터 불러오기
    const fetchBoardData = async (seq) => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardView?seq=${seq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                const item = data.item;
                // 기존 필드명 매핑 (백엔드 호환성 유지)
                setProductName(item.imagename || item.productname || "");
                setStartPrice(item.imageprice || "");
                setDescription(item.imagecontent || item.description || "");
                
                // 기존 이미지 설정 (image1이 있으면 배열로 변환)
                if(item.image1) {
                    setExistingImages([item.image1]);
                }
                
                // TODO: 백엔드에서 category, auctionPeriod, transactionMethod를 지원하면 설정
                // setCategory(item.category || "");
                // setAuctionPeriod(item.auctionPeriod || "");
                // setTransactionMethod(item.transactionMethod || "");
            } else {
                alert("해당 게시글이 존재하지 않습니다.");
                navigate("/imageboard/imageboardList");
            }
        } catch(err) {
            console.error(err);
            alert("데이터를 불러오는 중 오류가 발생했습니다.");
        }
    };

    // 새 이미지 파일 선택 처리 (최대 8장)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + imageFiles.length;
        
        if(totalImages + files.length > 8) {
            alert("최대 8장까지만 업로드 가능합니다.");
            return;
        }
        
        const newFiles = files.slice(0, 8 - totalImages);
        setImageFiles([...imageFiles, ...newFiles]);
        
        // 미리보기 생성
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    // 새 이미지 삭제
    const handleRemoveNewImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
        
        // 파일 입력 초기화
        if(imgRef.current) {
            imgRef.current.value = "";
        }
    };

    // 기존 이미지 삭제
    const handleRemoveExistingImage = (index) => {
        const newExistingImages = existingImages.filter((_, i) => i !== index);
        setExistingImages(newExistingImages);
    };

    // 수정 처리
    const fetchModifyData = async (formData) => {
        try {
            const response = await fetch("http://localhost:8080/imageboard/imageboardModify",
                                        {   method: "POST",
                                            body: formData
                                        });
            const data = await response.json();
            if(response.ok) {
                if(data.rt === "OK") {
                    alert("수정 성공");
                    navigate(`/imageboard/imageboardView?seq=${seq}`);
                } else {
                    alert("수정 실패");
                }
            } else {
                alert("글 수정에 실패했습니다.");
            }
        } catch(err) {
            alert("글 수정 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 검증 데이터 준비 (기존 필드명 사용)
        const validationData = {
            productName, 
            category, 
            startPrice, 
            auctionPeriod, 
            transactionMethod, 
            description, 
            imageFiles: [...existingImages, ...imageFiles]
        };
        const refs = {
            productNameRef, 
            categoryRef, 
            startPriceRef, 
            auctionPeriodRef, 
            transactionMethodRef, 
            descriptionRef, 
            imgRef
        };
        
        if(!validateModify(validationData, refs)) {
            return false;
        }
        
        const formData = new FormData();
        formData.append("seq", seq);
        // backend API와 일치하는 필드명 사용
        formData.append("productName", productName);
        formData.append("category", category);
        formData.append("startPrice", startPrice);
        formData.append("auctionPeriod", auctionPeriod);
        formData.append("transactionMethod", transactionMethod);
        formData.append("description", description);
        
        // 새 이미지 파일들 추가
        imageFiles.forEach((file) => {
            formData.append("images", file);
        });
        
        fetchModifyData(formData);
    };

    const handleReset = () => {
        fetchBoardData(seq);
        setImageFiles([]);
        setImagePreviews([]);
        if(imgRef.current) {
            imgRef.current.value = "";
        }
    };

    return (
        <div className="container" style={{maxWidth: "800px", margin: "auto", padding: "20px"}}>
            <h3 align="center" style={{marginBottom: "10px"}}>경매 수정</h3>
            <p style={{textAlign: "center", color: "#666", marginBottom: "30px"}}>
                수정할 정보를 입력해주세요
            </p>
            
            <form onSubmit={handleSubmit} encType="multipart/form-data" style={{margin: 0, padding: 0, width: "100%"}}>
                {/* 상품 이미지 */}
                <div style={{marginBottom: "30px"}}>
                    <label style={{display: "block", marginBottom: "10px", fontWeight: "bold"}}>
                        <span style={{color: "red"}}>*</span> 상품 이미지
                    </label>
                    
                    {/* 기존 이미지 표시 */}
                    {existingImages.length > 0 && (
                        <div style={{display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px"}}>
                            {existingImages.map((image, index) => (
                                <div key={`existing-${index}`} style={{position: "relative", width: "100px", height: "100px"}}>
                                    <img 
                                        src={`http://localhost:8080/storage/${image}`}
                                        alt={`기존 이미지 ${index + 1}`}
                                        style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px"}}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(index)}
                                        style={{
                                            position: "absolute",
                                            top: "-5px",
                                            right: "-5px",
                                            background: "red",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "20px",
                                            height: "20px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* 새 이미지 추가 박스 */}
                    {(existingImages.length + imageFiles.length) < 8 && (
                        <div 
                            style={{
                                border: "2px dashed #ccc",
                                borderRadius: "8px",
                                padding: "20px",
                                textAlign: "center",
                                cursor: "pointer",
                                backgroundColor: "#f9f9f9"
                            }}
                            onClick={() => imgRef.current?.click()}
                        >
                            <i className="bi bi-camera" style={{fontSize: "32px", color: "#999", display: "block", marginBottom: "8px"}}></i>
                            <div style={{color: "#666", marginBottom: "8px", fontSize: "14px"}}>
                                사진 추가 (최대 {8 - existingImages.length - imageFiles.length}장)
                            </div>
                            <div style={{fontSize: "11px", color: "#666"}}>
                                * 첫 번째 사진이 대표 이미지로 설정되며, 순서대로 저장됩니다
                            </div>
                            <input 
                                type="file" 
                                ref={imgRef} 
                                onChange={handleImageChange}
                                multiple
                                accept="image/*"
                                style={{display: "none"}}
                            />
                        </div>
                    )}
                    
                    {/* 새 이미지 미리보기 */}
                    {imagePreviews.length > 0 && (
                        <div style={{display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px"}}>
                            {imagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} style={{position: "relative", width: "100px", height: "100px"}}>
                                    <img 
                                        src={preview} 
                                        alt={`미리보기 ${index + 1}`}
                                        style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px"}}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(index)}
                                        style={{
                                            position: "absolute",
                                            top: "-5px",
                                            right: "-5px",
                                            background: "red",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "20px",
                                            height: "20px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 상품명 */}
                <div style={{marginBottom: "20px"}}>
                    <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>
                        <span style={{color: "red"}}>*</span> 상품명
                    </label>
                    <input 
                        type="text" 
                        value={productName}
                        ref={productNameRef}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="상품명을 입력하세요"
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    />
                    <div style={{marginTop: "5px", fontSize: "12px", color: "#666"}}>
                        * 상품명은 2자 이상 입력해주세요
                    </div>
                </div>

                {/* 카테고리 */}
                <div style={{marginBottom: "20px", position: "relative", zIndex: 10}}>
                    <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>
                        <span style={{color: "red"}}>*</span> 카테고리
                    </label>
                    <select
                        value={category}
                        ref={categoryRef}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    >
                        <option value="">카테고리를 선택하세요</option>
                        <option value="골드">골드</option>
                        <option value="실버">실버</option>
                        <option value="백금">백금</option>
                        <option value="다이아">다이아</option>
                        <option value="귀금속">귀금속</option>
                        <option value="주화">주화</option>
                        <option value="금은정련">금은정련</option>
                        <option value="유가증권">유가증권</option>
                    </select>
                </div>

                {/* 입찰 시작가격 */}
                <div style={{marginBottom: "20px"}}>
                    <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>
                        입찰 시작가격
                    </label>
                    <input 
                        type="number" 
                        value={startPrice}
                        ref={startPriceRef}
                        onChange={(e) => setStartPrice(e.target.value)}
                        placeholder="시작가격을 입력하세요"
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    />
                </div>

                {/* 경매종료일 */}
                <div style={{marginBottom: "20px"}}>
                    <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>
                        경매종료일
                        <span style={{fontSize: "14px", fontWeight: "normal", color: "#ffb3d9", marginLeft: "10px"}}>
                            (종료일을 선택해주세요)
                        </span>
                    </label>
                    <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
                        <button
                            type="button"
                            onClick={() => setAuctionPeriod("7일후")}
                            style={{
                                padding: "10px 20px",
                                border: auctionPeriod === "7일후" ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "4px",
                                backgroundColor: auctionPeriod === "7일후" ? "#e7f3ff" : "#fff",
                                color: auctionPeriod === "7일후" ? "#007bff" : "#333",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: auctionPeriod === "7일후" ? "bold" : "normal"
                            }}
                        >
                            7일후
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuctionPeriod("14일후")}
                            style={{
                                padding: "10px 20px",
                                border: auctionPeriod === "14일후" ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "4px",
                                backgroundColor: auctionPeriod === "14일후" ? "#e7f3ff" : "#fff",
                                color: auctionPeriod === "14일후" ? "#007bff" : "#333",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: auctionPeriod === "14일후" ? "bold" : "normal"
                            }}
                        >
                            14일후
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuctionPeriod("21일후")}
                            style={{
                                padding: "10px 20px",
                                border: auctionPeriod === "21일후" ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "4px",
                                backgroundColor: auctionPeriod === "21일후" ? "#e7f3ff" : "#fff",
                                color: auctionPeriod === "21일후" ? "#007bff" : "#333",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: auctionPeriod === "21일후" ? "bold" : "normal"
                            }}
                        >
                            21일후
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuctionPeriod("30일후")}
                            style={{
                                padding: "10px 20px",
                                border: auctionPeriod === "30일후" ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "4px",
                                backgroundColor: auctionPeriod === "30일후" ? "#e7f3ff" : "#fff",
                                color: auctionPeriod === "30일후" ? "#007bff" : "#333",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: auctionPeriod === "30일후" ? "bold" : "normal"
                            }}
                        >
                            30일후
                        </button>
                    </div>
                </div>

                {/* 거래 방식 */}
                <div style={{marginBottom: "20px"}}>
                    <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>
                        거래 방식
                    </label>
                    <div style={{display: "flex", gap: "20px", flexWrap: "wrap"}}>
                        <label style={{display: "flex", alignItems: "center", cursor: "pointer"}}>
                            <input 
                                type="radio" 
                                name="transactionMethod"
                                value="직거래"
                                checked={transactionMethod === "직거래"}
                                onChange={(e) => setTransactionMethod(e.target.value)}
                                style={{marginRight: "5px"}}
                            />
                            직거래
                        </label>
                        <label style={{display: "flex", alignItems: "center", cursor: "pointer"}}>
                            <input 
                                type="radio" 
                                name="transactionMethod"
                                value="매장방문"
                                checked={transactionMethod === "매장방문"}
                                onChange={(e) => setTransactionMethod(e.target.value)}
                                style={{marginRight: "5px"}}
                            />
                            매장방문
                        </label>
                        <label style={{display: "flex", alignItems: "center", cursor: "pointer"}}>
                            <input 
                                type="radio" 
                                name="transactionMethod"
                                value="에스크로"
                                checked={transactionMethod === "에스크로"}
                                onChange={(e) => setTransactionMethod(e.target.value)}
                                style={{marginRight: "5px"}}
                            />
                            에스크로
                        </label>
                        <label style={{display: "flex", alignItems: "center", cursor: "pointer"}}>
                            <input 
                                type="radio" 
                                name="transactionMethod"
                                value="중계소 이용"
                                checked={transactionMethod === "중계소 이용"}
                                onChange={(e) => setTransactionMethod(e.target.value)}
                                style={{marginRight: "5px"}}
                            />
                            중계소 이용
                        </label>
                    </div>
                </div>

                {/* 상세 설명 */}
                <div style={{marginBottom: "30px"}}>
                    <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>
                        <span style={{color: "red"}}>*</span> 상세 설명
                    </label>
                    <textarea 
                        value={description}
                        ref={descriptionRef}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="상품에 대한 자세한 설명을 입력해주세요."
                        rows="7"
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            resize: "vertical"
                        }}
                    />
                </div>

                {/* 버튼 */}
                <div style={{textAlign: "center", marginTop: "30px"}}>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{
                            padding: "10px 30px",
                            marginRight: "10px",
                            fontSize: "16px"
                        }}
                    >
                        수정
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleReset}
                        style={{
                            padding: "10px 30px",
                            fontSize: "16px"
                        }}
                    >
                        다시 작성
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ImageboardModifyForm;
