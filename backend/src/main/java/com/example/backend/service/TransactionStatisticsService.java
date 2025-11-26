package com.example.backend.service;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.TransactionStatisticsDAO;

@Service
public class TransactionStatisticsService {
	@Autowired
	TransactionStatisticsDAO dao;
	
	// 기간에 따른 시작일과 종료일 계산
	private String[] calculateDateRange(String period) {
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 23);
		cal.set(Calendar.MINUTE, 59);
		cal.set(Calendar.SECOND, 59);
		cal.set(Calendar.MILLISECOND, 999);
		Date endDate = cal.getTime();
		
		Calendar startCal = Calendar.getInstance();
		startCal.set(Calendar.HOUR_OF_DAY, 0);
		startCal.set(Calendar.MINUTE, 0);
		startCal.set(Calendar.SECOND, 0);
		startCal.set(Calendar.MILLISECOND, 0);
		
		switch(period) {
			case "1day":
				// 1일: 오늘
				break;
			case "1week":
				// 1주: 7일 전
				startCal.add(Calendar.DAY_OF_MONTH, -7);
				break;
			case "1month":
				// 1개월: 30일 전
				startCal.add(Calendar.MONTH, -1);
				break;
			case "1year":
				// 1년: 365일 전
				startCal.add(Calendar.YEAR, -1);
				break;
			default:
				// 기본값: 1개월
				startCal.add(Calendar.MONTH, -1);
		}
		
		Date startDate = startCal.getTime();
		
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		
		return new String[] {
			dateFormat.format(startDate),
			dateFormat.format(endDate),
			datetimeFormat.format(startDate),
			datetimeFormat.format(endDate)
		};
	}
	
	// 총 거래 횟수 조회 (상태별 구분)
	public List<Map<String, Object>> getTransactionCountByStatus(String period) {
		String[] dateRange = calculateDateRange(period);
		return dao.getTransactionCountByStatus(dateRange[0], dateRange[1]);
	}
	
	// 총 거래 횟수 조회 (전체 합계)
	public Long getTotalTransactionCount(String period) {
		String[] dateRange = calculateDateRange(period);
		return dao.getTotalTransactionCount(dateRange[0], dateRange[1]);
	}
	
	// 총 거래 금액 조회
	public Long getTotalTransactionAmount(String period) {
		String[] dateRange = calculateDateRange(period);
		return dao.getTotalTransactionAmount(dateRange[0], dateRange[1]);
	}
	
	// 시간대별 거래 현황 조회
	public List<Map<String, Object>> getHourlyTransactionStats(String period) {
		String[] dateRange = calculateDateRange(period);
		return dao.getHourlyTransactionStats(dateRange[2], dateRange[3]);
	}
	
	// 카테고리별 거래 통계 조회
	public List<Map<String, Object>> getCategoryTransactionStats(String period) {
		String[] dateRange = calculateDateRange(period);
		return dao.getCategoryTransactionStats(dateRange[0], dateRange[1]);
	}
	
	// 거래방식별 통계 조회
	public List<Map<String, Object>> getTransactionMethodStats() {
		return dao.getTransactionMethodStats();
	}
}

