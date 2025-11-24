package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.repository.BoardPostRepository;
import com.example.backend.repository.BoardCommentRepository;
import com.example.backend.repository.EventProductRepository;
import com.example.backend.repository.EventOrderRepository;

@RestController
public class BoardStatisticsController {
	@Autowired
	BoardPostRepository boardPostRepository;
	
	@Autowired
	BoardCommentRepository boardCommentRepository;
	
	@Autowired
	EventProductRepository eventProductRepository;
	
	@Autowired
	EventOrderRepository eventOrderRepository;
	
	// 게시판별 통계 조회
	@GetMapping("/board/statistics/board")
	public Map<String, Object> getBoardStatistics(@RequestParam("boardSeq") Long boardSeq) {
		Map<String, Object> stats = new HashMap<String, Object>();
		
		try {
			// 게시글 통계
			long totalPosts = boardPostRepository.countByBoardSeqAndIsDeleted(boardSeq, "N");
			stats.put("totalPosts", totalPosts);
			
			// 댓글 통계 (게시판의 모든 게시글의 댓글 수)
			long totalComments = boardCommentRepository.findAll().stream()
				.filter(c -> {
					com.example.backend.entity.BoardPost post = boardPostRepository.findById(c.getPostSeq()).orElse(null);
					return post != null && boardSeq.equals(post.getBoardSeq()) && !"Y".equals(c.getIsDeleted());
				})
				.count();
			stats.put("totalComments", totalComments);
			
			// 공구이벤트인 경우 상품/주문 통계
			long totalProducts = eventProductRepository.findAll().stream()
				.filter(p -> boardSeq.equals(p.getBoardSeq()) && !"Y".equals(p.getIsDeleted()))
				.count();
			stats.put("totalProducts", totalProducts);
			
			long totalOrders = eventOrderRepository.findAll().stream()
				.filter(o -> {
					com.example.backend.entity.EventProduct product = eventProductRepository.findById(o.getProductSeq()).orElse(null);
					return product != null && boardSeq.equals(product.getBoardSeq());
				})
				.count();
			stats.put("totalOrders", totalOrders);
			
			// 일별 게시글 작성 통계 (최근 7일)
			Map<String, Long> dailyPosts = new HashMap<String, Long>();
			java.util.Calendar cal = java.util.Calendar.getInstance();
			for(int i = 6; i >= 0; i--) {
				cal.set(java.util.Calendar.DAY_OF_YEAR, cal.get(java.util.Calendar.DAY_OF_YEAR) - i);
				cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
				cal.set(java.util.Calendar.MINUTE, 0);
				cal.set(java.util.Calendar.SECOND, 0);
				java.util.Date dayStart = cal.getTime();
				
				cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
				cal.set(java.util.Calendar.MINUTE, 59);
				cal.set(java.util.Calendar.SECOND, 59);
				java.util.Date dayEnd = cal.getTime();
				
				long count = boardPostRepository.findAll().stream()
					.filter(p -> boardSeq.equals(p.getBoardSeq()) && 
								!"Y".equals(p.getIsDeleted()) &&
								p.getCreatedDate() != null &&
								!p.getCreatedDate().before(dayStart) &&
								!p.getCreatedDate().after(dayEnd))
					.count();
				
				java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
				dailyPosts.put(sdf.format(dayStart), count);
			}
			stats.put("dailyPosts", dailyPosts);
			
			stats.put("rt", "OK");
		} catch(Exception e) {
			e.printStackTrace();
			stats.put("rt", "FAIL");
			stats.put("msg", "통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return stats;
	}
	
	// 회원별 통계 조회
	@GetMapping("/board/statistics/member")
	public Map<String, Object> getMemberStatistics(@RequestParam("memberId") String memberId) {
		Map<String, Object> stats = new HashMap<String, Object>();
		
		try {
			// 작성한 게시글 수
			long totalPosts = boardPostRepository.findAll().stream()
				.filter(p -> memberId.equals(p.getMemberId()) && !"Y".equals(p.getIsDeleted()))
				.count();
			stats.put("totalPosts", totalPosts);
			
			// 작성한 댓글 수
			long totalComments = boardCommentRepository.findAll().stream()
				.filter(c -> memberId.equals(c.getMemberId()) && !"Y".equals(c.getIsDeleted()))
				.count();
			stats.put("totalComments", totalComments);
			
			// 주문 수 (공구이벤트)
			long totalOrders = eventOrderRepository.findAll().stream()
				.filter(o -> memberId.equals(o.getMemberId()))
				.count();
			stats.put("totalOrders", totalOrders);
			
			// 총 주문 금액
			long totalOrderAmount = eventOrderRepository.findAll().stream()
				.filter(o -> memberId.equals(o.getMemberId()) && !"취소".equals(o.getOrderStatus()))
				.mapToLong(o -> o.getOrderPrice() != null ? o.getOrderPrice() : 0L)
				.sum();
			stats.put("totalOrderAmount", totalOrderAmount);
			
			stats.put("rt", "OK");
		} catch(Exception e) {
			e.printStackTrace();
			stats.put("rt", "FAIL");
			stats.put("msg", "통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return stats;
	}
	
	// 전체 통계 조회
	@GetMapping("/board/statistics/overall")
	public Map<String, Object> getOverallStatistics() {
		Map<String, Object> stats = new HashMap<String, Object>();
		
		try {
			// 전체 게시글 수
			long totalPosts = boardPostRepository.count();
			stats.put("totalPosts", totalPosts);
			
			// 전체 댓글 수
			long totalComments = boardCommentRepository.count();
			stats.put("totalComments", totalComments);
			
			// 전체 상품 수
			long totalProducts = eventProductRepository.count();
			stats.put("totalProducts", totalProducts);
			
			// 전체 주문 수
			long totalOrders = eventOrderRepository.count();
			stats.put("totalOrders", totalOrders);
			
			// 총 주문 금액
			long totalOrderAmount = eventOrderRepository.findAll().stream()
				.filter(o -> !"취소".equals(o.getOrderStatus()))
				.mapToLong(o -> o.getOrderPrice() != null ? o.getOrderPrice() : 0L)
				.sum();
			stats.put("totalOrderAmount", totalOrderAmount);
			
			stats.put("rt", "OK");
		} catch(Exception e) {
			e.printStackTrace();
			stats.put("rt", "FAIL");
			stats.put("msg", "통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return stats;
	}
}

