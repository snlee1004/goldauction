package com.example.backend.dao;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.springframework.stereotype.Repository;

@Repository
public class TransactionStatisticsDAO {
	@PersistenceContext
	private EntityManager entityManager;
	
	// 총 거래 횟수 조회 (상태별 구분)
	public List<Map<String, Object>> getTransactionCountByStatus(String startDate, String endDate) {
		String sql = "SELECT STATUS, COUNT(*) as count " +
				     "FROM IMAGEBOARD1 " +
				     "WHERE STATUS IN ('판매완료', '종료') " +
				     "AND AUCTION_END_DATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD') " +
				     "GROUP BY STATUS";
		
		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("startDate", startDate);
		query.setParameter("endDate", endDate);
		
		@SuppressWarnings("unchecked")
		List<Object[]> results = query.getResultList();
		List<Map<String, Object>> list = new ArrayList<>();
		
		for(Object[] row : results) {
			Map<String, Object> map = new HashMap<>();
			map.put("status", row[0]);  // STATUS
			map.put("count", ((Number) row[1]).longValue());  // COUNT
			list.add(map);
		}
		
		return list;
	}
	
	// 총 거래 횟수 조회 (전체 합계)
	public Long getTotalTransactionCount(String startDate, String endDate) {
		String sql = "SELECT COUNT(*) " +
				     "FROM IMAGEBOARD1 " +
				     "WHERE STATUS IN ('판매완료', '종료') " +
				     "AND AUCTION_END_DATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')";
		
		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("startDate", startDate);
		query.setParameter("endDate", endDate);
		
		Object result = query.getSingleResult();
		return result != null ? ((Number) result).longValue() : 0L;
	}
	
	// 총 거래 금액 조회
	public Long getTotalTransactionAmount(String startDate, String endDate) {
		String sql = "SELECT NVL(SUM(maxBidAmount), 0) " +
				     "FROM ( " +
				     "    SELECT i.SEQ, MAX(b.BID_AMOUNT) as maxBidAmount " +
				     "    FROM IMAGEBOARD1 i " +
				     "    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ " +
				     "    WHERE i.STATUS IN ('판매완료', '종료') " +
				     "    AND b.STATUS = '유효' " +
				     "    AND i.AUCTION_END_DATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD') " +
				     "    GROUP BY i.SEQ " +
				     "    HAVING COUNT(b.BID_SEQ) > 0 " +
				     ")";
		
		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("startDate", startDate);
		query.setParameter("endDate", endDate);
		
		Object result = query.getSingleResult();
		return result != null ? ((Number) result).longValue() : 0L;
	}
	
	// 시간대별 거래 현황 조회
	public List<Map<String, Object>> getHourlyTransactionStats(String startDate, String endDate) {
		// Oracle에서 TO_CHAR를 사용하여 시간 추출 (TIMESTAMP 타입 지원)
		String sql = "SELECT " +
				     "    TO_NUMBER(TO_CHAR(maxBidTime, 'HH24')) as hour, " +
				     "    COUNT(*) as count, " +
				     "    NVL(SUM(maxBidAmount), 0) as amount " +
				     "FROM ( " +
				     "    SELECT " +
				     "        i.SEQ, " +
				     "        MAX(b.BID_AMOUNT) as maxBidAmount, " +
				     "        MAX(b.BID_TIME) as maxBidTime " +
				     "    FROM IMAGEBOARD1 i " +
				     "    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ " +
				     "    WHERE i.STATUS IN ('판매완료', '종료') " +
				     "    AND b.STATUS = '유효' " +
				     "    AND b.BID_TIME >= TO_DATE(:startDate, 'YYYY-MM-DD HH24:MI:SS') " +
				     "    AND b.BID_TIME <= TO_DATE(:endDate, 'YYYY-MM-DD HH24:MI:SS') " +
				     "    GROUP BY i.SEQ " +
				     "    HAVING COUNT(b.BID_SEQ) > 0 " +
				     ") " +
				     "GROUP BY TO_NUMBER(TO_CHAR(maxBidTime, 'HH24')) " +
				     "ORDER BY hour";
		
		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("startDate", startDate);
		query.setParameter("endDate", endDate);
		
		@SuppressWarnings("unchecked")
		List<Object[]> results = query.getResultList();
		List<Map<String, Object>> list = new ArrayList<>();
		
		for(Object[] row : results) {
			Map<String, Object> map = new HashMap<>();
			// Oracle NUMBER 타입을 int로 변환
			Object hourObj = row[0];
			int hour;
			if(hourObj instanceof Number) {
				hour = ((Number) hourObj).intValue();
			} else {
				hour = Integer.parseInt(hourObj.toString());
			}
			map.put("hour", hour);  // HOUR
			map.put("count", ((Number) row[1]).longValue());  // COUNT
			map.put("amount", ((Number) row[2]).longValue());  // AMOUNT
			list.add(map);
		}
		
		return list;
	}
	
	// 카테고리별 거래 통계 조회
	public List<Map<String, Object>> getCategoryTransactionStats(String startDate, String endDate) {
		String sql = "SELECT " +
				     "    CATEGORY, " +
				     "    COUNT(*) as count, " +
				     "    NVL(SUM(maxBidAmount), 0) as amount " +
				     "FROM ( " +
				     "    SELECT " +
				     "        i.SEQ, " +
				     "        i.CATEGORY, " +
				     "        MAX(b.BID_AMOUNT) as maxBidAmount " +
				     "    FROM IMAGEBOARD1 i " +
				     "    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ " +
				     "    WHERE i.STATUS IN ('판매완료', '종료') " +
				     "    AND b.STATUS = '유효' " +
				     "    AND i.AUCTION_END_DATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD') " +
				     "    GROUP BY i.SEQ, i.CATEGORY " +
				     "    HAVING COUNT(b.BID_SEQ) > 0 " +
				     ") " +
				     "GROUP BY CATEGORY " +
				     "ORDER BY count DESC";
		
		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("startDate", startDate);
		query.setParameter("endDate", endDate);
		
		@SuppressWarnings("unchecked")
		List<Object[]> results = query.getResultList();
		List<Map<String, Object>> list = new ArrayList<>();
		
		long totalCount = 0;
		for(Object[] row : results) {
			totalCount += ((Number) row[1]).longValue();
		}
		
		for(Object[] row : results) {
			Map<String, Object> map = new HashMap<>();
			map.put("category", row[0] != null ? row[0].toString() : "미분류");  // CATEGORY
			long count = ((Number) row[1]).longValue();
			map.put("count", count);  // COUNT
			map.put("amount", ((Number) row[2]).longValue());  // AMOUNT
			// 비율 계산
			double percentage = totalCount > 0 ? (count * 100.0 / totalCount) : 0.0;
			map.put("percentage", Math.round(percentage * 100.0) / 100.0);  // 소수점 2자리
			list.add(map);
		}
		
		return list;
	}
	
	// 거래방식별 통계 조회
	public List<Map<String, Object>> getTransactionMethodStats() {
		String sql = "SELECT " +
				     "    TRANSACTION_METHOD, " +
				     "    COUNT(*) as count, " +
				     "    NVL(SUM(maxBidAmount), 0) as amount " +
				     "FROM ( " +
				     "    SELECT " +
				     "        i.SEQ, " +
				     "        i.TRANSACTION_METHOD, " +
				     "        MAX(b.BID_AMOUNT) as maxBidAmount " +
				     "    FROM IMAGEBOARD1 i " +
				     "    INNER JOIN BID1 b ON i.SEQ = b.IMAGEBOARD_SEQ " +
				     "    WHERE i.STATUS IN ('판매완료', '종료') " +
				     "    AND b.STATUS = '유효' " +
				     "    GROUP BY i.SEQ, i.TRANSACTION_METHOD " +
				     "    HAVING COUNT(b.BID_SEQ) > 0 " +
				     ") " +
				     "GROUP BY TRANSACTION_METHOD " +
				     "ORDER BY count DESC";
		
		Query query = entityManager.createNativeQuery(sql);
		
		@SuppressWarnings("unchecked")
		List<Object[]> results = query.getResultList();
		List<Map<String, Object>> list = new ArrayList<>();
		
		long totalCount = 0;
		for(Object[] row : results) {
			totalCount += ((Number) row[1]).longValue();
		}
		
		for(Object[] row : results) {
			Map<String, Object> map = new HashMap<>();
			map.put("method", row[0] != null ? row[0].toString() : "미지정");  // TRANSACTION_METHOD
			long count = ((Number) row[1]).longValue();
			map.put("count", count);  // COUNT
			map.put("amount", ((Number) row[2]).longValue());  // AMOUNT
			// 비율 계산
			double percentage = totalCount > 0 ? (count * 100.0 / totalCount) : 0.0;
			map.put("percentage", Math.round(percentage * 100.0) / 100.0);  // 소수점 2자리
			list.add(map);
		}
		
		return list;
	}
}

