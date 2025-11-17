package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 파일 저장 폴더 관리 클래스
@Configuration
public class ResourceConfiguration implements WebMvcConfigurer{
	// 파일 저장 폴더의 경로 저장
	// => application.properties 파일의 project.upload.path값을 
	//    읽어와서 저장한다.
	@Value("${project.upload.path}")
	private String uploadpath;
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// http://localhost:8080/storage/cupra.jpg
		registry.addResourceHandler("/storage/**")
		.addResourceLocations("file:///" + uploadpath + "/");
	}
}
