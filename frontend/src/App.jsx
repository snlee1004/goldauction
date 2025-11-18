import {BrowserRouter, Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import NavbarComponent from "./layouts/header";
import FooterComponent from "./layouts/footer";
import ImageboardWriteForm from "./imageboard/ImageboardWriteForm";
import ImageboardModifyForm from "./imageboard/ImageboardModifyForm";
import ImageboardView from "./imageboard/ImageboardView";
import ImageboardList from "./imageboard/ImageboardList";
import LoginForm from "./member/LoginForm";
import WriteForm from "./member/WriteForm";
import ModifyForm from "./member/ModifyForm";

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <div className="app-content">
                    <NavbarComponent />

                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<LoginForm/>} />
                            <Route path="/imageboard/imageboardWriteForm" 
                                element={<ImageboardWriteForm/>} />
                            <Route path="/imageboard/imageboardModifyForm" 
                                element={<ImageboardModifyForm/>} />
                            <Route path="/imageboard/imageboardList" 
                                element={<ImageboardList/>} />
                            <Route path="/imageboard/imageboardView" 
                                element={<ImageboardView/>} />
                            <Route path="/member/loginForm" 
                                element={<LoginForm/>} />
                            <Route path="/member/writeForm" 
                                element={<WriteForm/>} />
                            <Route path="/member/modifyForm" 
                                element={<ModifyForm/>} />
                        </Routes>
                    </div>
                </div>

                <FooterComponent />
            </div>
        </BrowserRouter>
    )
}

export default App
