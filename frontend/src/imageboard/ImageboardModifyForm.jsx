import {useState, useRef, useEffect} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import { validateModify } from "../script/imageboardValidation";

function ImageboardModifyForm() {
    const [seq, setSeq] = useState(0);
    const [imageId, setImageId] = useState("");
    const [imageName, setImageName] = useState("");
    const [imagePrice, setImagePrice] = useState("");
    const [imageQty, setImageQty] = useState("");
    const [imageContent, setImageContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [existingImage, setExistingImage] = useState("");

    const imageIdRef = useRef(null);
    const imageNameRef = useRef(null);
    const imagePriceRef = useRef(null);
    const imageQtyRef = useRef(null);
    const imageContentRef = useRef(null);
    const imgRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const seqParam = parseInt(queryParams.get("seq"));
        setSeq(seqParam);
        fetchBoardData(seqParam);
    }, []);

    const fetchBoardData = async (seq) => {
        try {
            const response = await fetch(`http://localhost:8080/imageboard/imageboardView?seq=${seq}`);
            const data = await response.json();
            if(data.rt === "OK") {
                const item = data.item;
                setImageId(item.imageid);
                setImageName(item.imagename);
                setImagePrice(item.imageprice);
                setImageQty(item.imageqty);
                setImageContent(item.imagecontent);
                setExistingImage(item.image1);
            } else {
                alert("해당 게시글이 존재하지 않습니다.");
                navigate("/imageboard/imageboardList");
            }
        } catch(err) {
            console.error(err);
        }
    };


    const fetchModifyData = async (formData) => {
        try {
            const response = await fetch("http://localhost:8080/imageboard/imageboardModify",
                                        {   method: "POST",
                                            body: formData
                                        });
            const data = await response.json();
            if(response.ok) {
                if(data.rt === "OK") {
                    alert("수정 성공");
                    navigate(`/imageboard/imageboardView?seq=${seq}`);
                } else {
                    alert("수정 실패");
                }
            } else {
                alert("글 수정에 실패했습니다.");
            }
        } catch(err) {
            alert("글 수정 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationData = {
            imageId, imageName, imagePrice, imageQty, imageContent
        };
        const refs = {
            imageIdRef, imageNameRef, imagePriceRef, imageQtyRef, imageContentRef
        };
        
        if(!validateModify(validationData, refs)) {
            return false;
        }
        
        const formData = new FormData();
        formData.append("seq", seq);
        formData.append("imageId", imageId);
        formData.append("imageName", imageName);
        formData.append("imagePrice", imagePrice);
        formData.append("imageQty", imageQty);
        formData.append("imageContent", imageContent);
        if(imageFile) {
            formData.append("img", imageFile);
        }
        fetchModifyData(formData);
    };

    const handleReset = () => {
        fetchBoardData(seq);
        setImageFile(null);
        if(imgRef.current) {
            imgRef.current.value = "";
        }
    };

    return (
        <div className="container">
            <h3 align="center">
                <i className="bi bi-pencil-square"></i> 이미지 수정
            </h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <table className="table" style={{width:"500px", margin:"auto"}}>
                    <tbody>
                        <tr>
                            <td align="right">상품 코드</td>
                            <td>
                                <input type="text" value={imageId} size="45"
                                        ref={imageIdRef} 
                                        onChange={(e) => setImageId(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">상품명</td>
                            <td>
                                <input type="text" value={imageName} size="45"
                                        ref={imageNameRef} 
                                        onChange={(e) => setImageName(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">단가</td>
                            <td>
                                <input type="text" value={imagePrice} size="45"
                                        ref={imagePriceRef} 
                                        onChange={(e) => setImagePrice(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">개수</td>
                            <td>
                                <input type="text" value={imageQty} size="45"
                                        ref={imageQtyRef} 
                                        onChange={(e) => setImageQty(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">내용</td>
                            <td>
                                <textarea value={imageContent} rows="7" cols="47"
                                        ref={imageContentRef} 
                                        onChange={(e) => setImageContent(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">기존 이미지</td>
                            <td>
                                {existingImage && (
                                    <img width="150" height="150" alt="기존 이미지"
                                        src={`http://localhost:8080/storage/${existingImage}`}/>
                                )}
                            </td>
                        </tr>
                        <tr>                            
                            <td colSpan="2">
                                <input type="file" size="45" ref={imgRef} 
                                        onChange={(e) => setImageFile(e.target.files[0])}/>
                                <small style={{color: "gray"}}>새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다.</small>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" colSpan="2">
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-check-circle"></i> 수정
                                </button>
                                &nbsp;
                                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                                    <i className="bi bi-arrow-clockwise"></i> 다시 작성
                                </button>
                            </td>                            
                        </tr>
                        <tr>
                            <td colSpan="2" align="center">
                                <Link to="/imageboard/imageboardList">
                                    <i className="bi bi-list"></i> 목록
                                </Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}

export default ImageboardModifyForm;

