package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

/**
 * Multipart 파일 업로드 설정
 * 최대 20개 파일 업로드 지원 (최대 8개 이미지 + 여유분)
 * 
 * 파일 개수 제한은 application.properties의 
 * server.tomcat.max-part-count로 설정됩니다.
 * (Spring Boot 4.0에서는 max-part-count 속성 사용)
 */
@Configuration
public class MultipartConfig {

    /**
     * StandardServletMultipartResolver 설정
     * 파일 개수 제한을 늘리기 위한 설정
     */
    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        StandardServletMultipartResolver resolver = new StandardServletMultipartResolver();
        resolver.setResolveLazily(true); // 지연 로딩 활성화 (성능 개선)
        return resolver;
    }
}

