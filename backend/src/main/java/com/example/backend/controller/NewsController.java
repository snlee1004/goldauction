package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class NewsController {
	
	// 딥서치 뉴스 API 키
	private static final String DEEPSEARCH_API_KEY = "27827029bf844344aa0360f9f954e70f";
	
	// 딥서치 뉴스 API 프록시 - 국내 뉴스
	@GetMapping("/news/gold")
	public Map<String, Object> getGoldNews(
			@RequestParam(value = "query", required = false) String query,
			@RequestParam(value = "display", defaultValue = "10") int display) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 검색어가 없으면 기본값 사용
			if(query == null || query.trim().isEmpty()) {
				query = "금 시세 경제";
			}
			
			// 딥서치 뉴스 API 호출 - global-articles (국내 뉴스 포함)
			// 엔드포인트: https://api-v2.deepsearch.com/v1/global-articles
			// 인증: Authorization Bearer 헤더 사용
			String apiUrl = "https://api-v2.deepsearch.com/v1/global-articles"
							+ "?query=" + java.net.URLEncoder.encode(query, "UTF-8")
							+ "&page_size=" + display;
			
			// HTTP 헤더 설정 (Authorization Bearer 사용)
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			headers.set("Authorization", "Bearer " + DEEPSEARCH_API_KEY);
			
			HttpEntity<String> entity = new HttpEntity<>(headers);
			
			// RestTemplate을 사용하여 API 호출
			RestTemplate restTemplate = new RestTemplate();
			ResponseEntity<String> response = restTemplate.exchange(
				apiUrl,
				HttpMethod.GET,
				entity,
				String.class
			);
			
			if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				// JSON 문자열을 Map으로 변환
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.getBody(), Map.class);
				
				java.util.List<Map<String, Object>> items = new java.util.ArrayList<>();
				
				// global-articles API 응답 형식에 맞게 데이터 변환
				// 응답 구조: { "data": [...], "total_items": ..., "page": ... }
				java.util.List<Map<String, Object>> articles = null;
				
				if(responseData.containsKey("data") && responseData.get("data") instanceof java.util.List) {
					@SuppressWarnings("unchecked")
					java.util.List<Map<String, Object>> data = (java.util.List<Map<String, Object>>) responseData.get("data");
					articles = data;
				}
				
				if(articles != null) {
					for(Map<String, Object> article : articles) {
						Map<String, Object> item = new HashMap<>();
						
						// 제목
						item.put("title", article.getOrDefault("title", ""));
						
						// 설명 (summary 우선, 없으면 빈 문자열)
						item.put("description", article.getOrDefault("summary", ""));
						
						// 링크
						String contentUrl = (String) article.getOrDefault("content_url", "");
						item.put("link", contentUrl);
						item.put("originallink", contentUrl);
						
						// 발행일
						String publishedAt = (String) article.getOrDefault("published_at", "");
						item.put("pubDate", publishedAt);
						
						// 출판사
						item.put("publisher", article.getOrDefault("publisher", ""));
						
						// 섹션 (카테고리)
						@SuppressWarnings("unchecked")
						java.util.List<String> sections = (java.util.List<String>) article.getOrDefault("sections", new java.util.ArrayList<>());
						if(sections != null && !sections.isEmpty()) {
							item.put("category", sections.get(0));
						} else {
							item.put("category", "");
						}
						
						items.add(item);
					}
				}
				
				Map<String, Object> data = new HashMap<>();
				data.put("items", items);
				
				result.put("rt", "OK");
				result.put("data", data);
			} else {
				result.put("rt", "FAIL");
				result.put("msg", "뉴스 조회에 실패했습니다.");
			}
			
		} catch(org.springframework.web.client.HttpClientErrorException e) {
			e.printStackTrace();
			result.put("rt", "FAIL");
			
			// 에러 응답 본문에서 상세 메시지 추출 시도
			String errorMessage = e.getMessage();
			try {
				if(e.getResponseBodyAsString() != null && !e.getResponseBodyAsString().isEmpty()) {
					ObjectMapper errorMapper = new ObjectMapper();
					Map<String, Object> errorData = errorMapper.readValue(e.getResponseBodyAsString(), Map.class);
					if(errorData.containsKey("detail")) {
						@SuppressWarnings("unchecked")
						Map<String, Object> detail = (Map<String, Object>) errorData.get("detail");
						if(detail.containsKey("message")) {
							errorMessage = (String) detail.get("message");
						}
					}
				}
			} catch(Exception parseEx) {
				// JSON 파싱 실패 시 원본 메시지 사용
			}
			
			if(e.getStatusCode().value() == 401) {
				result.put("msg", "딥서치 뉴스 API 인증 실패: API 키를 확인하거나 https://news.deepsearch.com/api/ 에서 API 키를 발급받아 NewsController.java의 DEEPSEARCH_API_KEY에 설정해주세요.");
			} else if(e.getStatusCode().value() == 403) {
				result.put("msg", "딥서치 뉴스 API 구독 권한이 없습니다. 국내 거시경제 브리핑 API는 추가 구독이 필요합니다. " + errorMessage + " 자세한 내용은 https://news.deepsearch.com/api/ 를 확인해주세요.");
			} else if(e.getStatusCode().value() == 404) {
				result.put("msg", "딥서치 뉴스 API 엔드포인트를 찾을 수 없습니다. API 문서를 확인해주세요: https://news.deepsearch.com/api/");
			} else {
				result.put("msg", "뉴스 조회 중 오류가 발생했습니다: " + errorMessage);
			}
		} catch(Exception e) {
			e.printStackTrace();
			result.put("rt", "FAIL");
			result.put("msg", "뉴스 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return result;
	}
}

