import {BrowserRouter, Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
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
            <div style={{width: "800px", margin: "auto"}}>
                <div>
                    <NavbarComponent />

                    <div style={{height: "550px"}}>
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

                    <FooterComponent />
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App
