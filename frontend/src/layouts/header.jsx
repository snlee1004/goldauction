import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const NavbarComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [memName, setMemName] = useState("");

    // 로그인 상태 확인
    useEffect(() => {
        const memId = sessionStorage.getItem("memId");
        const name = sessionStorage.getItem("memName");
        if(memId && name) {
            setIsLoggedIn(true);
            setMemName(name);
        } else {
            setIsLoggedIn(false);
            setMemName("");
        }
    }, [location]); // location이 변경될 때마다 로그인 상태 확인

    // 로그아웃 처리
    const handleLogout = () => {
        sessionStorage.removeItem("memId");
        sessionStorage.removeItem("memName");
        setIsLoggedIn(false);
        setMemName("");
        navigate("/member/loginForm");
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/imageboard/imageboardList">
                        <i className="bi bi-gem"></i> 골드옥션
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={{gap: "20px"}}>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === "/notice" ? "active" : ""}`} 
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
                                    <span style={{ fontWeight: "bold", fontSize: "1.25rem" }}>경매 GOGO</span>
                                </Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === "/member/modifyForm" ? "active" : ""}`} 
                                              to="/member/modifyForm">
                                            <i className="bi bi-person-circle"></i> {memName}님
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