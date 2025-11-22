package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS 설정 클래스 (Cross-Origin Resource Sharing)
// 프론트엔드와 백엔드가 다른 포트에서 실행될 때 필요한 설정
@Configuration
public class CorsConfig implements WebMvcConfigurer {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")  // 모든 경로에 대해
			.allowedOrigins("http://localhost:5173", "http://localhost:5174")  // 프론트엔드 포트 허용
			.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // 허용할 HTTP 메서드
			.allowedHeaders("*")  // 모든 헤더 허용
			.allowCredentials(true)  // 인증 정보 허용
			.maxAge(3600);  // preflight 요청 캐시 시간 (1시간)
	}
	
	// 추가적인 CORS 필터 설정 (더 세밀한 제어가 필요한 경우)
	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		
		// 허용할 Origin 설정
		config.addAllowedOrigin("http://localhost:5173");
		config.addAllowedOrigin("http://localhost:5174");
		
		// 허용할 HTTP 메서드 설정
		config.addAllowedMethod("*");
		
		// 허용할 헤더 설정
		config.addAllowedHeader("*");
		
		// 인증 정보 허용
		config.setAllowCredentials(true);
		
		// 모든 경로에 적용
		source.registerCorsConfiguration("/**", config);
		
		return new CorsFilter(source);
	}
}

