package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.service.TransactionStatisticsService;

@RestController
@RequestMapping("/statistics/transaction")
public class TransactionStatisticsController {
	@Autowired
	TransactionStatisticsService service;
	
	// 총 거래 횟수 조회 (상태별 구분)
	@GetMapping("/count")
	public Map<String, Object> getTransactionCount(
			@RequestParam(value = "period", defaultValue = "1month") String period) {
		Map<String, Object> map = new HashMap<>();
		
		try {
			List<Map<String, Object>> statusList = service.getTransactionCountByStatus(period);
			Long totalCount = service.getTotalTransactionCount(period);
			
			map.put("rt", "OK");
			map.put("period", period);
			map.put("statusList", statusList);
			map.put("totalCount", totalCount);
		} catch(Exception e) {
			System.out.println("총 거래 횟수 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "총 거래 횟수 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
	
	// 총 거래 금액 조회
	@GetMapping("/amount")
	public Map<String, Object> getTransactionAmount(
			@RequestParam(value = "period", defaultValue = "1month") String period) {
		Map<String, Object> map = new HashMap<>();
		
		try {
			Long totalAmount = service.getTotalTransactionAmount(period);
			
			map.put("rt", "OK");
			map.put("period", period);
			map.put("totalAmount", totalAmount);
		} catch(Exception e) {
			System.out.println("총 거래 금액 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "총 거래 금액 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
	
	// 시간대별 거래 현황 조회
	@GetMapping("/hourly")
	public Map<String, Object> getHourlyTransactionStats(
			@RequestParam(value = "period", defaultValue = "1month") String period) {
		Map<String, Object> map = new HashMap<>();
		
		try {
			List<Map<String, Object>> hourlyList = service.getHourlyTransactionStats(period);
			
			map.put("rt", "OK");
			map.put("period", period);
			map.put("hourlyList", hourlyList);
		} catch(Exception e) {
			System.out.println("시간대별 거래 현황 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "시간대별 거래 현황 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
	
	// 카테고리별 거래 통계 조회
	@GetMapping("/category")
	public Map<String, Object> getCategoryTransactionStats(
			@RequestParam(value = "period", defaultValue = "1month") String period) {
		Map<String, Object> map = new HashMap<>();
		
		try {
			List<Map<String, Object>> categoryList = service.getCategoryTransactionStats(period);
			
			map.put("rt", "OK");
			map.put("period", period);
			map.put("categoryList", categoryList);
		} catch(Exception e) {
			System.out.println("카테고리별 거래 통계 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "카테고리별 거래 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
	
	// 거래방식별 통계 조회
	@GetMapping("/method")
	public Map<String, Object> getTransactionMethodStats() {
		Map<String, Object> map = new HashMap<>();
		
		try {
			List<Map<String, Object>> methodList = service.getTransactionMethodStats();
			
			map.put("rt", "OK");
			map.put("methodList", methodList);
		} catch(Exception e) {
			System.out.println("거래방식별 통계 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "거래방식별 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
}

