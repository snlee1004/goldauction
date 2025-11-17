import {BrowserRouter, Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarComponent from "./layouts/header";
import FooterComponent from "./layouts/footer";
import ImageboardWriteForm from "./imageboard/ImageboardWriteForm";
import ImageboardView from "./imageboard/ImageboardView";
import ImageboardList from "./imageboard/ImageboardList";

function App() {
    return (
        <div style={{width: "800px", margin: "auto"}}>
            <div>
                <NavbarComponent />

                <div style={{height: "550px"}}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<ImageboardWriteForm/>} />
                            <Route path="/imageboard/imageboardWriteForm" 
                                element={<ImageboardWriteForm/>} />
                            <Route path="/imageboard/imageboardList" 
                                element={<ImageboardList/>} />
                            <Route path="/imageboard/imageboardView" 
                                element={<ImageboardView/>} />
                        </Routes>
                    </BrowserRouter>
                </div>

                <FooterComponent />
            </div>
        </div>
    )
}

export default App
