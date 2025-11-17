// 회원 관련 입력값 검증 함수들

// 로그인 입력값 검증
export const validateLogin = (id, pwd, idRef, pwdRef) => {
    if(!id || id.trim() === "") {
        alert("아이디를 입력하세요.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    if(!pwd || pwd.trim() === "") {
        alert("비밀번호를 입력하세요.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    return true;
};

// 회원가입 입력값 검증
export const validateWrite = (formData, refs, idCheckMsg) => {
    const { name, id, pwd, pwdConfirm, gender, email1, email2, tel1, tel2, tel3, addr } = formData;
    const { nameRef, idRef, pwdRef, pwdConfirmRef, genderRef, email1Ref, tel1Ref, addrRef } = refs;
    
    if(!name || name.trim() === "") {
        alert("이름을 입력하세요.");
        if(nameRef && nameRef.current) nameRef.current.focus();
        return false;
    }
    if(!id || id.trim() === "") {
        alert("아이디를 입력하세요.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    if(idCheckMsg !== "사용 가능한 아이디입니다.") {
        alert("아이디 중복 확인을 해주세요.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    if(!pwd || pwd.trim() === "") {
        alert("비밀번호를 입력하세요.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    if(pwd !== pwdConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        if(pwdConfirmRef && pwdConfirmRef.current) pwdConfirmRef.current.focus();
        return false;
    }
    if(!gender || gender.trim() === "") {
        alert("성별을 선택하세요.");
        if(genderRef && genderRef.current) genderRef.current.focus();
        return false;
    }
    if(!email1 || email1.trim() === "" || !email2 || email2.trim() === "") {
        alert("이메일을 입력하세요.");
        if(email1Ref && email1Ref.current) email1Ref.current.focus();
        return false;
    }
    if(!tel1 || tel1.trim() === "" || !tel2 || tel2.trim() === "" || !tel3 || tel3.trim() === "") {
        alert("전화번호를 입력하세요.");
        if(tel1Ref && tel1Ref.current) tel1Ref.current.focus();
        return false;
    }
    if(!addr || addr.trim() === "") {
        alert("주소를 입력하세요.");
        if(addrRef && addrRef.current) addrRef.current.focus();
        return false;
    }
    return true;
};

// 회원정보 수정 입력값 검증
export const validateModify = (formData, refs) => {
    const { name, pwd, pwdConfirm, gender, email1, email2, tel1, tel2, tel3, addr } = formData;
    const { nameRef, pwdRef, pwdConfirmRef, genderRef, email1Ref, tel1Ref, addrRef } = refs;
    
    if(!name || name.trim() === "") {
        alert("이름을 입력하세요.");
        if(nameRef && nameRef.current) nameRef.current.focus();
        return false;
    }
    if(!pwd || pwd.trim() === "") {
        alert("비밀번호를 입력하세요.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    if(pwd !== pwdConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        if(pwdConfirmRef && pwdConfirmRef.current) pwdConfirmRef.current.focus();
        return false;
    }
    if(!gender || gender.trim() === "") {
        alert("성별을 선택하세요.");
        if(genderRef && genderRef.current) genderRef.current.focus();
        return false;
    }
    if(!email1 || email1.trim() === "" || !email2 || email2.trim() === "") {
        alert("이메일을 입력하세요.");
        if(email1Ref && email1Ref.current) email1Ref.current.focus();
        return false;
    }
    if(!tel1 || tel1.trim() === "" || !tel2 || tel2.trim() === "" || !tel3 || tel3.trim() === "") {
        alert("전화번호를 입력하세요.");
        if(tel1Ref && tel1Ref.current) tel1Ref.current.focus();
        return false;
    }
    if(!addr || addr.trim() === "") {
        alert("주소를 입력하세요.");
        if(addrRef && addrRef.current) addrRef.current.focus();
        return false;
    }
    return true;
};

// 아이디 중복 확인 검증
export const validateCheckId = (id, idRef) => {
    if(!id || id.trim() === "") {
        alert("아이디를 입력하세요.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    return true;
};

