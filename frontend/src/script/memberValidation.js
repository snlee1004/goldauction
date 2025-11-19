// 회원 관련 입력값 검증 함수들

// 이름 형식 검증 (한글, 영문만 허용, 2-10자)
export const validateName = (name, nameRef) => {
    if(!name || name.trim() === "") {
        alert("이름을 입력하세요.");
        if(nameRef && nameRef.current) nameRef.current.focus();
        return false;
    }
    const namePattern = /^[가-힣a-zA-Z\s]{2,10}$/;
    if(!namePattern.test(name.trim())) {
        alert("이름은 한글 또는 영문 2-10자만 입력 가능합니다.");
        if(nameRef && nameRef.current) nameRef.current.focus();
        return false;
    }
    return true;
};

// 아이디 형식 검증 (영문, 숫자만 허용, 4-12자)
export const validateIdFormat = (id, idRef) => {
    if(!id || id.trim() === "") {
        alert("아이디를 입력하세요.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    const idPattern = /^[a-zA-Z0-9]{4,12}$/;
    if(!idPattern.test(id.trim())) {
        alert("아이디는 영문, 숫자만 사용 가능하며 4-12자여야 합니다.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    return true;
};

// 비밀번호 형식 검증 (영문, 숫자 조합, 8-20자)
export const validatePwdFormat = (pwd, pwdRef) => {
    if(!pwd || pwd.trim() === "") {
        alert("비밀번호를 입력하세요.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    if(pwd.length < 8 || pwd.length > 20) {
        alert("비밀번호는 8-20자여야 합니다.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    // 영문과 숫자를 포함하는지 확인
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if(!hasLetter || !hasNumber) {
        alert("비밀번호는 영문과 숫자를 포함한 8-20자여야 합니다.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    // 영문, 숫자, 특수문자만 허용
    const pwdPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,20}$/;
    if(!pwdPattern.test(pwd)) {
        alert("비밀번호는 영문, 숫자, 특수문자만 사용 가능합니다.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    return true;
};

// 이메일 형식 검증
export const validateEmail = (email1, email2, email1Ref) => {
    if(!email1 || email1.trim() === "" || !email2 || email2.trim() === "") {
        alert("이메일을 입력하세요.");
        if(email1Ref && email1Ref.current) email1Ref.current.focus();
        return false;
    }
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const fullEmail = `${email1.trim()}@${email2.trim()}`;
    if(!emailPattern.test(fullEmail)) {
        alert("올바른 이메일 형식을 입력하세요.");
        if(email1Ref && email1Ref.current) email1Ref.current.focus();
        return false;
    }
    return true;
};

// 전화번호 형식 검증
export const validateTel = (tel1, tel2, tel3, tel1Ref) => {
    if(!tel1 || tel1.trim() === "" || !tel2 || tel2.trim() === "" || !tel3 || tel3.trim() === "") {
        alert("전화번호를 입력하세요.");
        if(tel1Ref && tel1Ref.current) tel1Ref.current.focus();
        return false;
    }
    
    // 숫자만 입력되었는지 확인
    const numPattern = /^[0-9]+$/;
    if(!numPattern.test(tel1.trim()) || !numPattern.test(tel2.trim()) || !numPattern.test(tel3.trim())) {
        alert("전화번호는 숫자만 입력 가능합니다.");
        if(tel1Ref && tel1Ref.current) tel1Ref.current.focus();
        return false;
    }
    
    // 길이 확인
    if(tel1.trim().length !== 3 || tel2.trim().length < 3 || tel2.trim().length > 4 || tel3.trim().length !== 4) {
        alert("올바른 전화번호 형식을 입력하세요. (예: 010-1234-5678)");
        if(tel1Ref && tel1Ref.current) tel1Ref.current.focus();
        return false;
    }
    
    // 첫 번째 자리수는 010, 011, 016, 017, 018, 019만 허용
    const validPrefix = ["010", "011", "016", "017", "018", "019"];
    if(!validPrefix.includes(tel1.trim())) {
        alert("올바른 휴대폰 번호를 입력하세요.");
        if(tel1Ref && tel1Ref.current) tel1Ref.current.focus();
        return false;
    }
    return true;
};

// 주소 검증
export const validateAddr = (addr, addrRef) => {
    if(!addr || addr.trim() === "") {
        alert("주소를 입력하세요.");
        if(addrRef && addrRef.current) addrRef.current.focus();
        return false;
    }
    if(addr.trim().length < 5) {
        alert("주소를 정확히 입력하세요.");
        if(addrRef && addrRef.current) addrRef.current.focus();
        return false;
    }
    return true;
};

// 닉네임 형식 검증 (한글, 영문, 숫자만 허용, 2-10자)
export const validateNickname = (nickname, nicknameRef) => {
    if(!nickname || nickname.trim() === "") {
        alert("닉네임을 입력하세요.");
        if(nicknameRef && nicknameRef.current) nicknameRef.current.focus();
        return false;
    }
    const nicknamePattern = /^[가-힣a-zA-Z0-9]{2,10}$/;
    if(!nicknamePattern.test(nickname.trim())) {
        alert("닉네임은 한글, 영문, 숫자만 사용 가능하며 2-10자여야 합니다.");
        if(nicknameRef && nicknameRef.current) nicknameRef.current.focus();
        return false;
    }
    return true;
};

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
    const { name, id, nickname, pwd, pwdConfirm, gender, email1, email2, tel1, tel2, tel3, addr } = formData;
    const { nameRef, idRef, nicknameRef, pwdRef, pwdConfirmRef, genderRef, email1Ref, tel1Ref, addrRef } = refs;
    
    // 닉네임 검증
    if(!validateNickname(nickname, nicknameRef)) {
        return false;
    }
    
    // 이름 검증
    if(!validateName(name, nameRef)) {
        return false;
    }
    
    // 아이디 형식 검증
    if(!validateIdFormat(id, idRef)) {
        return false;
    }
    
    // 아이디 중복 확인 검증
    if(idCheckMsg !== "사용 가능한 아이디입니다.") {
        alert("아이디 중복 확인을 해주세요.");
        if(idRef && idRef.current) idRef.current.focus();
        return false;
    }
    
    // 비밀번호 형식 검증
    if(!validatePwdFormat(pwd, pwdRef)) {
        return false;
    }
    
    // 비밀번호 확인 검증
    if(pwd !== pwdConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        if(pwdConfirmRef && pwdConfirmRef.current) pwdConfirmRef.current.focus();
        return false;
    }
    
    // 성별 검증
    if(!gender || gender.trim() === "") {
        alert("성별을 선택하세요.");
        if(genderRef && genderRef.current) genderRef.current.focus();
        return false;
    }
    
    // 이메일 검증
    if(!validateEmail(email1, email2, email1Ref)) {
        return false;
    }
    
    // 전화번호 검증
    if(!validateTel(tel1, tel2, tel3, tel1Ref)) {
        return false;
    }
    
    // 주소 검증
    if(!validateAddr(addr, addrRef)) {
        return false;
    }
    
    return true;
};

// 회원정보 수정 입력값 검증
export const validateModify = (formData, refs) => {
    const { nickname, name, pwd, pwdConfirm, gender, email1, email2, tel1, tel2, tel3, addr } = formData;
    const { nicknameRef, nameRef, pwdRef, pwdConfirmRef, genderRef, email1Ref, tel1Ref, addrRef } = refs;
    
    // 닉네임 검증
    if(!validateNickname(nickname, nicknameRef)) {
        return false;
    }
    
    // 이름 검증
    if(!validateName(name, nameRef)) {
        return false;
    }
    
    // 비밀번호는 선택사항 (변경하지 않으면 비워둘 수 있음)
    // 비밀번호가 입력된 경우에만 검증
    if(pwd && pwd.trim() !== "") {
        // 비밀번호 형식 검증
        if(!validatePwdFormat(pwd, pwdRef)) {
            return false;
        }
        
        // 비밀번호 확인 검증
        if(pwd !== pwdConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            if(pwdConfirmRef && pwdConfirmRef.current) pwdConfirmRef.current.focus();
            return false;
        }
    } else if(pwdConfirm && pwdConfirm.trim() !== "") {
        // 비밀번호는 비어있는데 확인은 입력된 경우
        alert("비밀번호를 입력하세요.");
        if(pwdRef && pwdRef.current) pwdRef.current.focus();
        return false;
    }
    
    // 성별 검증
    if(!gender || gender.trim() === "") {
        alert("성별을 선택하세요.");
        if(genderRef && genderRef.current) genderRef.current.focus();
        return false;
    }
    
    // 이메일 검증
    if(!validateEmail(email1, email2, email1Ref)) {
        return false;
    }
    
    // 전화번호 검증
    if(!validateTel(tel1, tel2, tel3, tel1Ref)) {
        return false;
    }
    
    // 주소 검증
    if(!validateAddr(addr, addrRef)) {
        return false;
    }
    
    return true;
};

// 아이디 중복 확인 검증 (형식 검증 포함)
export const validateCheckId = (id, idRef) => {
    // 아이디 형식 검증
    if(!validateIdFormat(id, idRef)) {
        return false;
    }
    return true;
};

