# 이미지 썸네일 자동 생성 구현 가이드 (Thumbnailator)

## 📋 개요

ImageboardList에서 이미지 로딩이 느린 문제를 해결하기 위해, 파일 업로드 시 원본 이미지와 함께 썸네일을 자동으로 생성하는 기능을 구현합니다.

**중요**: 오라클 DB 스키마 변경 없이 구현 가능합니다. (기존 IMAGE_PATH 컬럼에 원본 파일명만 저장)

---

## ✅ DB 스키마 변경 불필요

현재 구조:
- `IMAGEBOARD_IMAGES1` 테이블의 `IMAGE_PATH` 컬럼에 파일명만 저장
- 예: `1234567890_image.jpg`

구현 후:
- DB에는 여전히 원본 파일명만 저장 (변경 없음)
- 파일 시스템에 원본과 썸네일을 별도로 저장
- 예: 
  - 원본: `storage/original/1234567890_image.jpg`
  - 썸네일: `storage/thumb/1234567890_image.jpg`
  - DB: `original/1234567890_image.jpg` (또는 `1234567890_image.jpg`)

---

## 📦 1. 의존성 추가

### build.gradle에 Thumbnailator 라이브러리 추가

**파일**: `backend/build.gradle`

```gradle
dependencies {
    // 기존 의존성들...
    implementation("com.oracle.database.jdbc:ojdbc8:23.9.0.25.07")
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    
    // Thumbnailator - 이미지 썸네일 생성 라이브러리
    implementation 'net.coobird:thumbnailator:0.4.20'
    
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

**위치**: `backend/build.gradle` 파일의 `dependencies` 블록에 추가

**의존성 적용**:
```bash
# Gradle 프로젝트 새로고침 (IDE에서)
# 또는 터미널에서
cd backend
./gradlew build --refresh-dependencies
```

---

## 🗂️ 2. 폴더 구조 설계

### 저장 경로 구조

```
storage/
├── original/          # 원본 이미지 저장 폴더
│   ├── 1234567890_image1.jpg
│   ├── 1234567890_image2.jpg
│   └── ...
└── thumb/             # 썸네일 이미지 저장 폴더
    ├── 1234567890_image1.jpg
    ├── 1234567890_image2.jpg
    └── ...
```

**장점**:
- 원본과 썸네일을 명확히 구분
- 관리가 용이
- 기존 파일과 충돌 없음

---

## 🔧 3. 유틸리티 클래스 생성

### ImageThumbnailUtil.java 생성

**경로**: `backend/src/main/java/com/example/backend/util/ImageThumbnailUtil.java`

```java
package com.example.backend.util;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class ImageThumbnailUtil {
    
    @Value("${project.upload.path}")
    private String uploadPath;
    
    // 썸네일 크기 설정
    private static final int THUMBNAIL_WIDTH = 300;  // 목록용 썸네일 너비
    private static final int THUMBNAIL_HEIGHT = 300; // 목록용 썸네일 높이
    
    /**
     * 원본 이미지와 썸네일을 생성하고 저장
     * @param originalFile 원본 파일
     * @param fileName 저장할 파일명
     * @return 저장된 원본 파일 경로 (DB에 저장할 값)
     * @throws IOException 파일 저장 오류
     */
    public String saveImageWithThumbnail(File originalFile, String fileName) throws IOException {
        // 폴더 생성
        File originalDir = new File(uploadPath, "original");
        File thumbDir = new File(uploadPath, "thumb");
        
        if (!originalDir.exists()) {
            originalDir.mkdirs();
        }
        if (!thumbDir.exists()) {
            thumbDir.mkdirs();
        }
        
        // 원본 파일 저장 경로
        File originalSaveFile = new File(originalDir, fileName);
        
        // 원본 파일 복사 (MultipartFile에서 이미 저장된 경우는 이동만)
        if (originalFile.exists() && !originalFile.getAbsolutePath().equals(originalSaveFile.getAbsolutePath())) {
            // 파일이 다른 위치에 있으면 이동
            originalFile.renameTo(originalSaveFile);
        }
        
        // 썸네일 생성 및 저장
        File thumbSaveFile = new File(thumbDir, fileName);
        Thumbnails.of(originalSaveFile)
                .size(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                .outputFormat("jpg")  // 썸네일은 항상 JPG로 저장 (용량 최적화)
                .outputQuality(0.85)  // 품질 85% (용량과 품질의 균형)
                .toFile(thumbSaveFile);
        
        // DB에 저장할 경로 반환 (original/파일명 형식)
        return "original/" + fileName;
    }
    
    /**
     * MultipartFile에서 직접 원본과 썸네일 생성
     * @param multipartFile 업로드된 파일
     * @param fileName 저장할 파일명
     * @return 저장된 원본 파일 경로 (DB에 저장할 값)
     * @throws IOException 파일 저장 오류
     */
    public String saveImageWithThumbnail(java.io.InputStream inputStream, String fileName) throws IOException {
        // 폴더 생성
        File originalDir = new File(uploadPath, "original");
        File thumbDir = new File(uploadPath, "thumb");
        
        if (!originalDir.exists()) {
            originalDir.mkdirs();
        }
        if (!thumbDir.exists()) {
            thumbDir.mkdirs();
        }
        
        // 원본 파일 저장 경로
        File originalSaveFile = new File(originalDir, fileName);
        
        // 원본 파일 저장
        try (java.io.FileOutputStream fos = new java.io.FileOutputStream(originalSaveFile);
             java.io.BufferedInputStream bis = new java.io.BufferedInputStream(inputStream)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = bis.read(buffer)) != -1) {
                fos.write(buffer, 0, bytesRead);
            }
        }
        
        // 썸네일 생성 및 저장
        File thumbSaveFile = new File(thumbDir, fileName);
        Thumbnails.of(originalSaveFile)
                .size(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                .outputFormat("jpg")
                .outputQuality(0.85)
                .toFile(thumbSaveFile);
        
        // DB에 저장할 경로 반환
        return "original/" + fileName;
    }
    
    /**
     * 썸네일 경로 반환
     * @param originalPath 원본 경로 (DB에 저장된 값)
     * @return 썸네일 경로
     */
    public String getThumbnailPath(String originalPath) {
        if (originalPath == null || originalPath.isEmpty()) {
            return null;
        }
        
        // original/파일명 형식인 경우
        if (originalPath.startsWith("original/")) {
            return originalPath.replace("original/", "thumb/");
        }
        
        // 파일명만 있는 경우 (기존 데이터 호환성)
        return "thumb/" + originalPath;
    }
    
    /**
     * 원본 경로 반환
     * @param dbPath DB에 저장된 경로
     * @return 원본 경로
     */
    public String getOriginalPath(String dbPath) {
        if (dbPath == null || dbPath.isEmpty()) {
            return null;
        }
        
        // original/파일명 형식인 경우
        if (dbPath.startsWith("original/")) {
            return dbPath;
        }
        
        // 파일명만 있는 경우 (기존 데이터 호환성)
        return "original/" + dbPath;
    }
}
```

---

## 🔄 4. ImageboardController 수정

### 이미지 저장 로직 수정

**파일**: `backend/src/main/java/com/example/backend/controller/ImageboardController.java`

#### 수정 사항 1: 유틸리티 주입

```java
@Autowired
ImageThumbnailUtil thumbnailUtil;
```

#### 수정 사항 2: 이미지 저장 로직 변경

**기존 코드 (175-212줄)**:
```java
// 다중 이미지 저장
if(images != null && !images.isEmpty()) {
    int order = 1;
    for(MultipartFile file : images) {
        if(file != null && !file.isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File saveFile = new File(uploadpath, fileName);
                file.transferTo(saveFile);
                
                // 첫 번째 이미지를 대표 이미지로 설정
                if(order == 1) {
                    dto.setSeq(imageboard.getSeq());
                    dto.setImage1(fileName);
                    service.imageboardModify(dto);
                }
                
                // 이미지 정보 저장
                ImageboardImagesDTO imgDto = new ImageboardImagesDTO();
                imgDto.setImageboardSeq(imageboard.getSeq());
                imgDto.setImagePath(fileName);
                imgDto.setImageOrder(order);
                imgDto.setUploadDate(new Date());
                imagesService.save(imgDto);
                
                order++;
            } catch (IllegalStateException | IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

**수정된 코드**:
```java
// 다중 이미지 저장 (원본 + 썸네일 자동 생성)
if(images != null && !images.isEmpty()) {
    System.out.println("받은 이미지 개수: " + images.size());
    int order = 1;
    for(MultipartFile file : images) {
        if(file != null && !file.isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                
                // 원본과 썸네일 자동 생성
                String savedPath = thumbnailUtil.saveImageWithThumbnail(file.getInputStream(), fileName);
                System.out.println("이미지 저장 완료: " + savedPath + " (순서: " + order + ")");
                
                // 첫 번째 이미지를 대표 이미지로 설정
                if(order == 1) {
                    dto.setSeq(imageboard.getSeq());
                    dto.setImage1(savedPath);  // original/파일명 형식으로 저장
                    service.imageboardModify(dto);
                    System.out.println("대표 이미지 설정: " + savedPath);
                }
                
                // 이미지 정보 저장 (DB에는 original/파일명 형식으로 저장)
                ImageboardImagesDTO imgDto = new ImageboardImagesDTO();
                imgDto.setImageboardSeq(imageboard.getSeq());
                imgDto.setImagePath(savedPath);  // original/파일명 형식
                imgDto.setImageOrder(order);
                imgDto.setUploadDate(new Date());
                ImageboardImages savedImage = imagesService.save(imgDto);
                System.out.println("이미지 정보 저장 완료: seq=" + savedImage.getImgSeq() + ", path=" + savedImage.getImagePath());
                
                order++;
            } catch (IllegalStateException | IOException e) {
                System.out.println("이미지 저장 오류: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("빈 파일 건너뜀 (순서: " + order + ")");
        }
    }
    System.out.println("총 저장된 이미지 개수: " + (order - 1));
} else {
    System.out.println("이미지가 없거나 비어있음");
}
```

#### 수정 사항 3: 이미지 수정 로직도 동일하게 변경

**파일 수정 부분 (575-605줄)**도 동일한 방식으로 수정

---

## 🌐 5. ResourceConfiguration 수정

### 썸네일 폴더도 정적 리소스로 등록

**파일**: `backend/src/main/java/com/example/backend/controller/ResourceConfiguration.java`

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // http://localhost:8080/storage/original/xxx.jpg (원본)
    // http://localhost:8080/storage/thumb/xxx.jpg (썸네일)
    registry.addResourceHandler("/storage/**")
            .addResourceLocations("file:///" + uploadpath + "/");
}
```

**기존 코드와 동일** - `/storage/**` 패턴이 이미 `original/`과 `thumb/` 폴더를 모두 포함하므로 추가 수정 불필요

---

## 🎨 6. 프론트엔드 수정

### ImageboardList.jsx - 목록에서 썸네일 사용

**파일**: `frontend/src/imageboard/ImageboardList.jsx`

#### 수정 사항: 이미지 경로를 썸네일로 변경

**기존 코드 (308-328줄)**:
```javascript
<Link to={viewPath} style={{display: "inline-block"}}>
    {dto.image1 ? (
        <img 
            src={`http://localhost:8080/storage/${dto.image1}`}
            alt={dto.imagename}
            style={{width: "120px", height: "120px", objectFit: "cover", borderRadius: "4px"}}
        />
    ) : (
        // ... 기본 이미지
    )}
</Link>
```

**수정된 코드**:
```javascript
<Link to={viewPath} style={{display: "inline-block"}}>
    {dto.image1 ? (
        <img 
            src={(() => {
                // DB에 저장된 경로가 original/파일명 형식인 경우
                if (dto.image1.startsWith("original/")) {
                    return `http://localhost:8080/storage/${dto.image1.replace("original/", "thumb/")}`;
                }
                // 기존 데이터 호환성 (파일명만 있는 경우)
                return `http://localhost:8080/storage/thumb/${dto.image1}`;
            })()}
            alt={dto.imagename}
            style={{width: "120px", height: "120px", objectFit: "cover", borderRadius: "4px"}}
        />
    ) : (
        // ... 기본 이미지
    )}
</Link>
```

### ImageboardView.jsx - 상세 페이지에서 원본 이미지 사용

**파일**: `frontend/src/imageboard/ImageboardView.jsx`

#### 수정 사항: 상세 페이지 이미지는 원본 사용

**기존 코드 (627줄)**:
```javascript
<img 
    width="280" 
    height="280" 
    alt="상품 이미지"
    src={imageboardData.image1 ? `http://localhost:8080/storage/${imageboardData.image1}` : "/placeholder-image.png"}
    style={{border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", width: "280px", height: "280px", objectFit: "cover"}}
    onClick={handleImageClick}
/>
```

**수정된 코드**:
```javascript
<img 
    width="280" 
    height="280" 
    alt="상품 이미지"
    src={(() => {
        if (!imageboardData.image1) return "/placeholder-image.png";
        
        // DB에 저장된 경로가 original/파일명 형식인 경우 (이미 원본 경로)
        if (imageboardData.image1.startsWith("original/")) {
            return `http://localhost:8080/storage/${imageboardData.image1}`;
        }
        // 기존 데이터 호환성 (파일명만 있는 경우 - 원본이 storage 루트에 있음)
        return `http://localhost:8080/storage/${imageboardData.image1}`;
    })()}
    style={{border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", width: "280px", height: "280px", objectFit: "cover"}}
    onClick={handleImageClick}
/>
```

**참고**: 상세 페이지에서는 항상 원본 이미지를 표시합니다. 클릭 시 열리는 `ImageboardPopup`도 원본을 표시합니다.

### ImageboardPopup.jsx - 팝업에서도 원본 이미지 사용

**파일**: `frontend/src/imageboard/ImageboardPopup.jsx`

#### 수정 사항: 팝업 이미지도 원본 사용

**기존 코드 (211줄)**:
```javascript
const imageUrl = img.imagePath ? `http://localhost:8080/storage/${img.imagePath}` : null;
```

**수정된 코드**:
```javascript
const imageUrl = (() => {
    if (!img.imagePath) return null;
    
    // DB에 저장된 경로가 original/파일명 형식인 경우 (이미 원본 경로)
    if (img.imagePath.startsWith("original/")) {
        return `http://localhost:8080/storage/${img.imagePath}`;
    }
    // 기존 데이터 호환성 (파일명만 있는 경우)
    return `http://localhost:8080/storage/${img.imagePath}`;
})();
```

**중요**: 
- **목록 페이지**: 썸네일 사용 (빠른 로딩)
- **상세 페이지**: 원본 사용 (고화질)
- **이미지 클릭 팝업**: 원본 사용 (확대 보기)

### Intro.jsx - 입찰 베스트/경매목록에서도 썸네일 사용

**파일**: `frontend/src/Intro.jsx`

목록에서 이미지를 표시하는 부분도 동일하게 수정 (썸네일 사용)

---

## 📝 7. 기존 데이터 호환성

### 기존 이미지 처리

기존에 업로드된 이미지는 파일명만 DB에 저장되어 있을 수 있습니다.

**해결 방법**:
1. **옵션 1**: 기존 데이터는 그대로 두고, 목록에서 썸네일이 없으면 원본 사용
2. **옵션 2**: 배치 작업으로 기존 이미지의 썸네일 생성

**옵션 1 구현 (프론트엔드)**:
```javascript
// 썸네일이 없으면 원본 사용
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // original/파일명 형식인 경우
    if (imagePath.startsWith("original/")) {
        return `http://localhost:8080/storage/${imagePath.replace("original/", "thumb/")}`;
    }
    
    // 기존 데이터 (파일명만 있는 경우)
    // 썸네일을 먼저 시도하고, 없으면 원본 사용
    return `http://localhost:8080/storage/thumb/${imagePath}`;
};
```

---

## 🚀 8. 구현 단계

### Step 1: 의존성 추가
1. `backend/build.gradle`에 Thumbnailator 의존성 추가
2. Gradle 프로젝트 새로고침 (IDE에서 Reload Gradle Project 또는 `./gradlew build --refresh-dependencies`)

### Step 2: 유틸리티 클래스 생성
1. `ImageThumbnailUtil.java` 파일 생성
2. 위의 코드 복사 및 붙여넣기

### Step 3: Controller 수정
1. `ImageboardController.java`에 `ImageThumbnailUtil` 주입
2. 이미지 저장 로직 수정 (imageboardWrite, imageboardModify 메서드)

### Step 4: 프론트엔드 수정
1. `ImageboardList.jsx`에서 목록 이미지를 썸네일로 변경
2. `Intro.jsx`에서도 동일하게 수정

### Step 5: 프론트엔드 추가 수정
1. `ImageboardView.jsx`에서 상세 페이지 이미지 경로 확인 (원본 사용)
2. `ImageboardPopup.jsx`에서 팝업 이미지 경로 확인 (원본 사용)

### Step 6: 테스트
1. 새 이미지 업로드 테스트
2. 목록에서 썸네일 표시 확인 (빠른 로딩)
3. 상세 페이지에서 원본 이미지 표시 확인 (고화질)
4. 상세 페이지 이미지 클릭 시 팝업에서 원본 이미지 표시 확인

---

## ⚙️ 9. 썸네일 크기 조정

필요에 따라 썸네일 크기를 조정할 수 있습니다.

**ImageThumbnailUtil.java**에서:
```java
private static final int THUMBNAIL_WIDTH = 300;   // 목록용 너비
private static final int THUMBNAIL_HEIGHT = 300;  // 목록용 높이
```

**권장 크기**:
- 목록용: 200x200 ~ 300x300
- 썸네일 갤러리: 150x150
- 작은 아이콘: 100x100

---

## 📊 10. 성능 개선 효과

### 예상 효과

**이미지 크기 비교** (예시):
- 원본: 2MB (1920x1080)
- 썸네일: 50KB (300x300)
- **용량 감소: 약 97%**

**로딩 속도 개선**:
- 목록 페이지: 10개 이미지 기준
  - 기존: 20MB (2MB × 10)
  - 개선: 500KB (50KB × 10)
  - **로딩 시간 약 40배 단축**

---

## ⚠️ 11. 주의사항

1. **폴더 생성**: `original/`과 `thumb/` 폴더가 자동 생성되지만, 서버 재시작 후 첫 업로드 시 확인 필요

2. **기존 데이터**: 기존에 업로드된 이미지는 썸네일이 없을 수 있으므로, 프론트엔드에서 fallback 처리 필요

3. **파일 형식**: 썸네일은 항상 JPG로 저장되므로, 원본이 PNG인 경우도 JPG로 변환됨

4. **디스크 공간**: 원본과 썸네일을 모두 저장하므로 디스크 사용량이 약 1.1배 증가 (썸네일이 작으므로)

---

## 🔍 12. 디버깅

### 문제 해결

**썸네일이 생성되지 않는 경우**:
1. `original/` 폴더에 원본이 저장되었는지 확인
2. `thumb/` 폴더 권한 확인
3. Thumbnailator 의존성이 제대로 추가되었는지 확인

**이미지가 표시되지 않는 경우**:
1. 브라우저 개발자 도구에서 이미지 URL 확인
2. 서버 로그에서 파일 경로 확인
3. `ResourceConfiguration`의 경로 설정 확인

---

## ✅ 결론

**DB 스키마 변경 없이 구현 가능**합니다!

- 기존 `IMAGE_PATH` 컬럼에 `original/파일명` 형식으로 저장
- 파일 시스템에 원본과 썸네일을 별도 폴더에 저장
- **목록에서는 썸네일 사용** (빠른 로딩)
- **상세 페이지에서는 원본 사용** (고화질)
- **이미지 클릭 팝업에서도 원본 사용** (확대 보기)
- 기존 데이터와의 호환성 유지

이 방식으로 구현하면 이미지 로딩 속도가 크게 개선되면서도, 상세 페이지와 팝업에서는 고화질 원본 이미지를 제공할 수 있습니다.

