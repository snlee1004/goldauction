package com.example.backend.config;

import java.time.ZoneId;
import java.util.TimeZone;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Jackson JSON 직렬화/역직렬화 설정
 * 날짜를 ISO 8601 형식으로 직렬화하도록 설정
 */
@Configuration
public class JacksonConfig {

	@Bean
	public ObjectMapper objectMapper() {
		ObjectMapper objectMapper = new ObjectMapper();
		
		// Java 8 날짜/시간 타입 지원 모듈 등록
		objectMapper.registerModule(new JavaTimeModule());
		
		// 날짜를 타임스탬프가 아닌 문자열로 직렬화
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		
		// 타임존 설정
		objectMapper.setTimeZone(TimeZone.getTimeZone(ZoneId.of("Asia/Seoul")));
		
		return objectMapper;
	}
}

