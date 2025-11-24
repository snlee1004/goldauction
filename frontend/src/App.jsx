import {BrowserRouter, Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import NavbarComponent from "./layouts/header";
import FooterComponent from "./layouts/footer";
import ImageboardWriteForm from "./imageboard/ImageboardWriteForm";
import ImageboardModifyForm from "./imageboard/ImageboardModifyForm";
import ImageboardView from "./imageboard/ImageboardView";
import ImageboardList from "./imageboard/ImageboardList";
import ImageboardCanceledList from "./imageboard/ImageboardCanceledList";
import ImageboardCanceledView from "./imageboard/ImageboardCanceledView";
import LoginForm from "./member/LoginForm";
import WriteForm from "./member/WriteForm";
import ModifyForm from "./member/ModifyForm";
import MemberInfo from "./member/MemberInfo";
import MemberSuspended from "./member/MemberSuspended";
import ManagerInfo from "./manager/managercontronl";
import ManagerLoginForm from "./manager/ManagerLoginForm";
import ManagerDetailInfo from "./manager/ManagerDetailInfo";
import MemberList from "./membercontrol/MemberList";
import MemberModify from "./membercontrol/MemberModify";
import MemberSuspend from "./membercontrol/MemberSuspend";
import PopupManage from "./popup/PopupManage";
import ChartSetManage from "./chart/ChartSetManage";
import ChartSetEditor from "./chart/ChartSetEditor";
import CssSetManage from "./manager/CssSetManage";
import CssSetEditor from "./manager/CssSetEditor";
import CssLoader from "./layouts/CssLoader";
import Intro from "./Intro";
import BoardCreateForm from "./board/BoardCreateForm";
import BoardList from "./board/BoardList";
import PostList from "./board/PostList";
import PostWriteForm from "./board/PostWriteForm";
import PostView from "./board/PostView";
import PostModifyForm from "./board/PostModifyForm";
import ProfanityFilterManage from "./board/ProfanityFilterManage";
import EventProductManage from "./board/EventProductManage";
import EventProductView from "./board/EventProductView";
import BoardManage from "./board/BoardManage";
import EventBoardManage from "./board/EventBoardManage";
import BoardStatistics from "./board/BoardStatistics";
import NotificationList from "./board/NotificationList";

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <CssLoader />
                <div className="app-content">
                    <NavbarComponent />

                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<Intro/>} />
                            <Route path="/imageboard/imageboardWriteForm" 
                                element={<ImageboardWriteForm/>} />
                            <Route path="/imageboard/imageboardModifyForm" 
                                element={<ImageboardModifyForm/>} />
                            <Route path="/imageboard/imageboardList" 
                                element={<ImageboardList/>} />
                            <Route path="/imageboard/imageboardView" 
                                element={<ImageboardView/>} />
                            <Route path="/imageboard/imageboardCanceledList" 
                                element={<ImageboardCanceledList/>} />
                            <Route path="/imageboard/imageboardCanceledView" 
                                element={<ImageboardCanceledView/>} />
                            <Route path="/member/loginForm" 
                                element={<LoginForm/>} />
                            <Route path="/member/writeForm" 
                                element={<WriteForm/>} />
                            <Route path="/member/modifyForm" 
                                element={<ModifyForm/>} />
                            <Route path="/member/memberInfo" 
                                element={<MemberInfo/>} />
                            <Route path="/member/suspended" 
                                element={<MemberSuspended/>} />
                            <Route path="/manager/managerInfo" 
                                element={<ManagerInfo/>} />
                            <Route path="/manager/loginForm" 
                                element={<ManagerLoginForm/>} />
                            <Route path="/manager/detailInfo" 
                                element={<ManagerDetailInfo/>} />
                            <Route path="/membercontrol/list" 
                                element={<MemberList/>} />
                            <Route path="/membercontrol/modify" 
                                element={<MemberModify/>} />
                            <Route path="/membercontrol/suspend" 
                                element={<MemberSuspend/>} />
                            <Route path="/popup/manage" 
                                element={<PopupManage/>} />
                            <Route path="/chart/manage" 
                                element={<ChartSetManage/>} />
                            <Route path="/chart/editor" 
                                element={<ChartSetEditor/>} />
                            <Route path="/manager/cssSetManage" 
                                element={<CssSetManage/>} />
                            <Route path="/manager/cssSetEditor" 
                                element={<CssSetEditor/>} />
                            <Route path="/board/create" 
                                element={<BoardCreateForm/>} />
                            <Route path="/board/list" 
                                element={<BoardList/>} />
                            <Route path="/board/:boardSeq/posts" 
                                element={<PostList/>} />
                            <Route path="/board/:boardSeq/post/write" 
                                element={<PostWriteForm/>} />
                            <Route path="/board/post/:postSeq" 
                                element={<PostView/>} />
                            <Route path="/board/post/:postSeq/modify" 
                                element={<PostModifyForm/>} />
                            <Route path="/profanity/manage" 
                                element={<ProfanityFilterManage/>} />
                            <Route path="/board/:boardSeq/products/manage" 
                                element={<EventProductManage/>} />
                            <Route path="/event/product/:productSeq" 
                                element={<EventProductView/>} />
                            <Route path="/board/:boardSeq/manage" 
                                element={<BoardManage/>} />
                            <Route path="/board/:boardSeq/event/manage" 
                                element={<EventBoardManage/>} />
                            <Route path="/board/:boardSeq/statistics" 
                                element={<BoardStatistics/>} />
                            <Route path="/board/notifications" 
                                element={<NotificationList/>} />
                        </Routes>
                    </div>
                </div>

                <FooterComponent />
            </div>
        </BrowserRouter>
    )
}

export default App
