import {useState, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import { validateWrite } from "../script/imageboardValidation";

function ImageboardWriteForm() {
    const [imageId, setImageId] = useState("img_");
    const [imageName, setImageName] = useState("");
    const [imagePrice, setImagePrice] = useState("");
    const [imageQty, setImageQty] = useState("");
    const [imageContent, setImageContent] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const imageIdRef = useRef(null);
    const imageNameRef = useRef(null);
    const imagePriceRef = useRef(null);
    const imageQtyRef = useRef(null);
    const imageContentRef = useRef(null);
    const imgRef = useRef(null);

    const navigate = useNavigate();


    const fetchWriteData = async (formData) => {
        try {
            const response = await fetch("http://localhost:8080/imageboard/imageboardWrite",
                                        {   method: "POST",
                                            body: formData
                                        });
            const data = await response.json();
            if(response.ok) {
                if(data.rt === "OK") {
                    alert("저장 성공");
                    navigate("/imageboard/imageboardList");
                } else {
                    alert("저장 실패");
                }
            } else {
                alert("글 작성에 실패했습니다.");
            }
        } catch(err) {
            alert("글 작성 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationData = {
            imageId, imageName, imagePrice, imageQty, imageContent, imageFile
        };
        const refs = {
            imageIdRef, imageNameRef, imagePriceRef, imageQtyRef, imageContentRef, imgRef
        };
        
        if(!validateWrite(validationData, refs)) {
            return false;
        }
        
        const formData = new FormData();
        formData.append("imageId", imageId);
        formData.append("imageName", imageName);
        formData.append("imagePrice", imagePrice);
        formData.append("imageQty", imageQty);
        formData.append("imageContent", imageContent);
        if(imageFile) {
            formData.append("img", imageFile);
        }
        fetchWriteData(formData);
    };
    const handleReset = () => {
        setImageId("img_");
        setImageName("");
        setImagePrice("");
        setImageQty("");
        setImageContent("");
        setImageFile(null);
        imgRef.current.value = "";  // 선택된 파일명 삭제
    };

    return (
        <div className="container">
            <h3 align="center">이미지 등록</h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <table className="table" style={{width:"500px", margin:"auto"}}>
                    <tbody>
                        <tr>
                            <td  align="right">상품 코드</td>
                            <td>
                                <input type="text" value={imageId} size="45"
                                        ref={imageIdRef} 
                                        onChange={(e) => setImageId(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td  align="right">상품명</td>
                            <td>
                                <input type="text" value={imageName} size="45"
                                        ref={imageNameRef} 
                                        onChange={(e) => setImageName(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td  align="right">단가</td>
                            <td>
                                <input type="text" value={imagePrice} size="45"
                                        ref={imagePriceRef} 
                                        onChange={(e) => setImagePrice(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td  align="right">개수</td>
                            <td>
                                <input type="text" value={imageQty} size="45"
                                        ref={imageQtyRef} 
                                        onChange={(e) => setImageQty(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td  align="right">내용</td>
                            <td>
                                <textarea value={imageContent} rows="7" cols="47"
                                        ref={imageContentRef} 
                                        onChange={(e) => setImageContent(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>                            
                            <td colSpan="2">
                                <input type="file" size="45" ref={imgRef} 
                                        onChange={(e) => setImageFile(e.target.files[0])}/>
                            </td>
                        </tr>
                        <tr>
                            <td  align="center" colSpan="2">
                                <input type="submit" value="이미지 등록"/>&nbsp;
                                <input type="button" value="다시 작성" onClick={handleReset}/>
                            </td>                            
                        </tr>
                        <tr>
                            <td colSpan="2" align="center">
                                <Link to="/imageboard/imageboardList">목록</Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}

export default ImageboardWriteForm;