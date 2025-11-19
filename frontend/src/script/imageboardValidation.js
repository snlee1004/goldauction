// 이미지 게시판 관련 입력값 검증 함수들

// 글 작성 입력값 검증
export const validateWrite = (formData, refs) => {
    const { productName, category, startPrice, auctionPeriod, transactionMethod, description, imageFiles } = formData;
    const { productNameRef, categoryRef, startPriceRef, auctionPeriodRef, transactionMethodRef, descriptionRef, imgRef } = refs;
    
    // 상품명 체크
    if(!productName || productName.trim() === "") {
        alert("상품명을 입력하세요.");
        if(productNameRef && productNameRef.current) productNameRef.current.focus();
        return false;
    }
    if(productName.trim().length < 2) {
        alert("상품명은 2자 이상 입력해주세요.");
        if(productNameRef && productNameRef.current) productNameRef.current.focus();
        return false;
    }
    
    // 카테고리 체크
    if(!category || category.trim() === "") {
        alert("카테고리를 선택하세요.");
        if(categoryRef && categoryRef.current) categoryRef.current.focus();
        return false;
    }
    
    // 입찰 시작가격 체크 (선택사항이므로 제거)
    // if(!startPrice || isNaN(startPrice) || parseInt(startPrice) <= 0) {
    //     alert("입찰 시작가격을 올바르게 입력하세요.");
    //     if(startPriceRef && startPriceRef.current) startPriceRef.current.focus();
    //     return false;
    // }
    
    // 경매종료일 체크 (선택사항이므로 제거)
    // if(!auctionPeriod || auctionPeriod.trim() === "") {
    //     alert("경매종료일을 선택하세요.");
    //     if(auctionPeriodRef && auctionPeriodRef.current) auctionPeriodRef.current.focus();
    //     return false;
    // }
    
    // 거래방식 체크 (선택사항이므로 제거)
    // if(!transactionMethod || transactionMethod.trim() === "") {
    //     alert("거래방식을 선택하세요.");
    //     if(transactionMethodRef && transactionMethodRef.current) transactionMethodRef.current.focus();
    //     return false;
    // }
    
    // 상세 설명 체크
    if(!description || description.trim() === "") {
        alert("상세 설명을 입력하세요.");
        if(descriptionRef && descriptionRef.current) descriptionRef.current.focus();
        return false;
    }
    if(description.trim().length < 10) {
        alert("상세 설명은 10자 이상 입력해주세요.");
        if(descriptionRef && descriptionRef.current) descriptionRef.current.focus();
        return false;
    }
    
    // 이미지 파일 체크
    if(!imageFiles || imageFiles.length === 0) {
        alert("상품 이미지를 최소 1장 이상 선택하세요.");
        if(imgRef && imgRef.current) imgRef.current.focus();
        return false;
    }
    
    return true;
};

// 글 수정 입력값 검증 (파일 선택은 선택사항)
export const validateModify = (formData, refs) => {
    const { productName, category, startPrice, auctionPeriod, transactionMethod, description, imageFiles } = formData;
    const { productNameRef, categoryRef, startPriceRef, auctionPeriodRef, transactionMethodRef, descriptionRef, imgRef } = refs;
    
    // 상품명 체크
    if(!productName || productName.trim() === "") {
        alert("상품명을 입력하세요.");
        if(productNameRef && productNameRef.current) productNameRef.current.focus();
        return false;
    }
    if(productName.trim().length < 2) {
        alert("상품명은 2자 이상 입력해주세요.");
        if(productNameRef && productNameRef.current) productNameRef.current.focus();
        return false;
    }
    
    // 카테고리 체크
    if(!category || category.trim() === "") {
        alert("카테고리를 선택하세요.");
        if(categoryRef && categoryRef.current) categoryRef.current.focus();
        return false;
    }
    
    // 상세 설명 체크
    if(!description || description.trim() === "") {
        alert("상세 설명을 입력하세요.");
        if(descriptionRef && descriptionRef.current) descriptionRef.current.focus();
        return false;
    }
    if(description.trim().length < 10) {
        alert("상세 설명은 10자 이상 입력해주세요.");
        if(descriptionRef && descriptionRef.current) descriptionRef.current.focus();
        return false;
    }
    
    // 이미지 파일 체크 (수정 시에는 기존 이미지가 있으면 새 이미지 선택은 선택사항)
    // 기존 이미지와 새 이미지가 모두 없을 때만 체크
    const totalImages = (imageFiles && imageFiles.length) || 0;
    if(totalImages === 0) {
        alert("상품 이미지가 필요합니다. 기존 이미지가 있거나 새 이미지를 선택하세요.");
        if(imgRef && imgRef.current) imgRef.current.focus();
        return false;
    }
    
    return true;
};

