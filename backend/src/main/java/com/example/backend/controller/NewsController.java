package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class NewsController {
	
	// 딥서치 뉴스 API 키
	private static final String DEEPSEARCH_API_KEY = "27827029bf844344aa0360f9f954e70f";
	
	// 딥서치 뉴스 API 프록시 - 국내 거시경제 브리핑
	@GetMapping("/news/gold")
	public Map<String, Object> getGoldNews(@RequestParam(value = "display", defaultValue = "2") int display) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 딥서치 뉴스 API 호출 - 국내 거시경제 브리핑 (구독 필요)
			// 엔드포인트: https://api-v2.deepsearch.com/v1/briefings/macro/kr
			// 파라미터: page_size, api_key
			// 주의: 이 API는 추가 구독이 필요합니다. 구독이 없으면 global-articles API를 사용합니다.
			
			String apiUrl = "https://api-v2.deepsearch.com/v1/briefings/macro/kr?api_key=" 
							+ DEEPSEARCH_API_KEY
							+ "&page_size=" + display;
			boolean useBriefingApi = true; // 브리핑 API 사용 여부
			
			// HTTP 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			
			HttpEntity<String> entity = new HttpEntity<>(headers);
			
			// RestTemplate을 사용하여 API 호출
			RestTemplate restTemplate = new RestTemplate();
			ResponseEntity<String> response = null;
			
			try {
				// 먼저 브리핑 API 시도
				response = restTemplate.exchange(
					apiUrl,
					HttpMethod.GET,
					entity,
					String.class
				);
			} catch(org.springframework.web.client.HttpClientErrorException e) {
				// 403 Forbidden 에러 발생 시 global-articles API로 대체
				if(e.getStatusCode().value() == 403) {
					useBriefingApi = false;
					apiUrl = "https://api-v2.deepsearch.com/v1/global-articles?api_key=" 
							+ DEEPSEARCH_API_KEY
							+ "&query=" + java.net.URLEncoder.encode("금 시세 경제", "UTF-8")
							+ "&limit=" + display;
					// global-articles API 재시도
					response = restTemplate.exchange(
						apiUrl,
						HttpMethod.GET,
						entity,
						String.class
					);
				} else {
					// 다른 에러는 그대로 throw
					throw e;
				}
			}
			
			if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				// JSON 문자열을 Map으로 변환
				ObjectMapper objectMapper = new ObjectMapper();
				Map<String, Object> responseData = objectMapper.readValue(response.getBody(), Map.class);
				
				java.util.List<Map<String, Object>> items = new java.util.ArrayList<>();
				
				if(useBriefingApi) {
					// 국내 거시경제 브리핑 API 응답 형식에 맞게 데이터 변환
					// 응답 구조: { "detail": {...}, "data": [...] }
					if(responseData.containsKey("data") && responseData.get("data") instanceof java.util.List) {
						@SuppressWarnings("unchecked")
						java.util.List<Map<String, Object>> briefings = (java.util.List<Map<String, Object>>) responseData.get("data");
						
						for(Map<String, Object> briefing : briefings) {
							Map<String, Object> item = new HashMap<>();
							// 브리핑 정보를 뉴스 형식으로 변환
							String category = (String) briefing.getOrDefault("category", "");
							String keyTrends = (String) briefing.getOrDefault("key_trends", "");
							String title = category + ": " + keyTrends;
							
							item.put("title", title);
							item.put("description", briefing.getOrDefault("key_indicators", 
									briefing.getOrDefault("key_trends", "")));
							item.put("link", "");
							String createdAt = (String) briefing.getOrDefault("created_at", "");
							item.put("pubDate", createdAt);
							item.put("originallink", "");
							item.put("category", category);
							item.put("full_briefing", briefing.getOrDefault("full_briefing", ""));
							
							items.add(item);
						}
					}
				} else {
					// global-articles API 응답 형식에 맞게 데이터 변환
					java.util.List<Map<String, Object>> articles = null;
					
					if(responseData.containsKey("data") && responseData.get("data") instanceof java.util.List) {
						@SuppressWarnings("unchecked")
						java.util.List<Map<String, Object>> data = (java.util.List<Map<String, Object>>) responseData.get("data");
						articles = data;
					} else if(responseData.containsKey("articles") && responseData.get("articles") instanceof java.util.List) {
						@SuppressWarnings("unchecked")
						java.util.List<Map<String, Object>> articlesList = (java.util.List<Map<String, Object>>) responseData.get("articles");
						articles = articlesList;
					}
					
					if(articles != null) {
						for(Map<String, Object> article : articles) {
							Map<String, Object> item = new HashMap<>();
							item.put("title", article.getOrDefault("title", article.getOrDefault("headline", "")));
							item.put("description", article.getOrDefault("description", 
									article.getOrDefault("summary", 
									article.getOrDefault("content", ""))));
							item.put("link", article.getOrDefault("url", 
									article.getOrDefault("link", "")));
							item.put("pubDate", article.getOrDefault("publishedAt", 
									article.getOrDefault("date", "")));
							item.put("originallink", article.getOrDefault("url", 
									article.getOrDefault("link", "")));
							items.add(item);
						}
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

