// 이미지 게시판 관련 입력값 검증 함수들

// 글 작성 입력값 검증
export const validateWrite = (formData, refs) => {
    const { imageId, imageName, imagePrice, imageQty, imageContent, imageFile } = formData;
    const { imageIdRef, imageNameRef, imagePriceRef, imageQtyRef, imageContentRef, imgRef } = refs;
    
    if(!imageId || imageId === "img_" || imageId.trim() === "") {
        alert("상품 코드를 입력하세요.");
        if(imageIdRef && imageIdRef.current) imageIdRef.current.focus();
        return false;
    }
    if(!imageName || imageName.trim() === "") {
        alert("상품명을 입력하세요.");
        if(imageNameRef && imageNameRef.current) imageNameRef.current.focus();
        return false;
    }
    if(!imagePrice || isNaN(imagePrice)) {
        alert("상품 가격을 숫자로 입력하세요.");
        if(imagePriceRef && imagePriceRef.current) imagePriceRef.current.focus();
        return false;
    }
    if(!imageQty || isNaN(imageQty)) {
        alert("상품 개수를 숫자로 입력하세요.");
        if(imageQtyRef && imageQtyRef.current) imageQtyRef.current.focus();
        return false;
    }
    if(!imageContent || imageContent.trim() === "") {
        alert("상품 내용을 입력하세요.");
        if(imageContentRef && imageContentRef.current) imageContentRef.current.focus();
        return false;
    }
    if(!imageFile) {
        alert("파일을 선택하세요.");
        if(imgRef && imgRef.current) imgRef.current.focus();
        return false;
    }
    return true;
};

// 글 수정 입력값 검증 (파일 선택은 선택사항)
export const validateModify = (formData, refs) => {
    const { imageId, imageName, imagePrice, imageQty, imageContent } = formData;
    const { imageIdRef, imageNameRef, imagePriceRef, imageQtyRef, imageContentRef } = refs;
    
    if(!imageId || imageId === "img_" || imageId.trim() === "") {
        alert("상품 코드를 입력하세요.");
        if(imageIdRef && imageIdRef.current) imageIdRef.current.focus();
        return false;
    }
    if(!imageName || imageName.trim() === "") {
        alert("상품명을 입력하세요.");
        if(imageNameRef && imageNameRef.current) imageNameRef.current.focus();
        return false;
    }
    if(!imagePrice || isNaN(imagePrice)) {
        alert("상품 가격을 숫자로 입력하세요.");
        if(imagePriceRef && imagePriceRef.current) imagePriceRef.current.focus();
        return false;
    }
    if(!imageQty || isNaN(imageQty)) {
        alert("상품 개수를 숫자로 입력하세요.");
        if(imageQtyRef && imageQtyRef.current) imageQtyRef.current.focus();
        return false;
    }
    if(!imageContent || imageContent.trim() === "") {
        alert("상품 내용을 입력하세요.");
        if(imageContentRef && imageContentRef.current) imageContentRef.current.focus();
        return false;
    }
    return true;
};

