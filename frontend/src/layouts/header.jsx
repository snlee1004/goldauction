import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./header.css";

const NavbarComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [memNickname, setMemNickname] = useState("");

    // 로그인 상태 확인
    useEffect(() => {
        const memId = sessionStorage.getItem("memId");
        const nickname = sessionStorage.getItem("memNickname");
        const name = sessionStorage.getItem("memName");
        console.log("헤더 - 로그인 상태 확인:", { memId, nickname, name }); // 디버깅용
        if(memId) {
            setIsLoggedIn(true);
            // 닉네임이 있으면 닉네임 사용, 없으면 이름 사용
            setMemNickname(nickname || name || "");
        } else {
            setIsLoggedIn(false);
            setMemNickname("");
        }
    }, [location]); // location이 변경될 때마다 로그인 상태 확인

    // 로그아웃 처리
    const handleLogout = () => {
        sessionStorage.removeItem("memId");
        sessionStorage.removeItem("memName");
        sessionStorage.removeItem("memNickname");
        setIsLoggedIn(false);
        setMemNickname("");
        navigate("/member/loginForm");
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-custom">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <i className="bi bi-gem"></i> 골드옥션
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={{gap: "20px"}}>
                            <li className="nav-item">
                                <Link className={`nav-link notice-link ${location.pathname === "/notice" ? "active" : ""}`} 
                                      to="/notice">
                                    공지사항
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === "/imageboard/imageboardWriteForm" ? "active" : ""}`} 
                                      to="/imageboard/imageboardWriteForm">
                                    경매등록
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === "/imageboard/imageboardList" || location.pathname === "/" ? "active" : ""}`} 
                                      to="/imageboard/imageboardList">
                                    <span style={{ fontWeight: "bold", fontSize: "1.25rem" }}>경매 GO</span>
                                </Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === "/member/memberInfo" ? "active" : ""}`} 
                                              to="/member/memberInfo">
                                            <i className="bi bi-person-circle"></i> {memNickname}님
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right"></i> 로그아웃
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === "/member/loginForm" ? "active" : ""}`} 
                                              to="/member/loginForm">
                                            <i className="bi bi-box-arrow-in-right"></i> 로그인
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === "/member/writeForm" ? "active" : ""}`} 
                                              to="/member/writeForm">
                                            <i className="bi bi-person-plus"></i> 회원가입
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default NavbarComponent;