package com.example.backend.util;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class ImageThumbnailUtil {
    
    @Value("${project.upload.path}")
    private String uploadPath;
    
    // 썸네일 크기 설정
    private static final int THUMBNAIL_WIDTH = 300;  // 목록용 썸네일 너비
    private static final int THUMBNAIL_HEIGHT = 300; // 목록용 썸네일 높이
    
    // 비동기 썸네일 생성을 위한 ExecutorService
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);
    
    /**
     * 원본 이미지 저장 (썸네일은 비동기로 생성)
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
        
        // 썸네일은 비동기로 생성 (응답 지연 방지)
        File finalOriginalSaveFile = originalSaveFile;
        CompletableFuture.runAsync(() -> {
            try {
                File thumbSaveFile = new File(thumbDir, fileName);
                Thumbnails.of(finalOriginalSaveFile)
                        .size(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                        .outputFormat("jpg")  // 썸네일은 항상 JPG로 저장 (용량 최적화)
                        .outputQuality(0.85)  // 품질 85% (용량과 품질의 균형)
                        .toFile(thumbSaveFile);
                System.out.println("썸네일 생성 완료: " + fileName);
            } catch (IOException e) {
                System.err.println("썸네일 생성 오류: " + fileName + " - " + e.getMessage());
                e.printStackTrace();
            }
        }, executorService);
        
        // DB에 저장할 경로 반환 (original/파일명 형식)
        return "original/" + fileName;
    }
    
    /**
     * MultipartFile에서 직접 원본 저장 (썸네일은 비동기로 생성)
     * @param inputStream 업로드된 파일의 InputStream
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
        
        // 썸네일은 비동기로 생성 (응답 지연 방지)
        File finalOriginalSaveFile = originalSaveFile;
        CompletableFuture.runAsync(() -> {
            try {
                File thumbSaveFile = new File(thumbDir, fileName);
                Thumbnails.of(finalOriginalSaveFile)
                        .size(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                        .outputFormat("jpg")
                        .outputQuality(0.85)
                        .toFile(thumbSaveFile);
                System.out.println("썸네일 생성 완료: " + fileName);
            } catch (IOException e) {
                System.err.println("썸네일 생성 오류: " + fileName + " - " + e.getMessage());
                e.printStackTrace();
            }
        }, executorService);
        
        // DB에 저장할 경로 반환 (원본만 저장하고 즉시 반환)
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

