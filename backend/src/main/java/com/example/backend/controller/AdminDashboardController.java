package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.entity.Board;
import com.example.backend.entity.BoardPost;
import com.example.backend.entity.EventOrder;
import com.example.backend.entity.EventProduct;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.BoardPostRepository;
import com.example.backend.repository.BoardCommentRepository;
import com.example.backend.repository.EventProductRepository;
import com.example.backend.repository.EventOrderRepository;

@RestController
public class AdminDashboardController {
	@Autowired
	BoardRepository boardRepository;
	
	@Autowired
	BoardPostRepository boardPostRepository;
	
	@Autowired
	BoardCommentRepository boardCommentRepository;
	
	@Autowired
	EventProductRepository eventProductRepository;
	
	@Autowired
	EventOrderRepository eventOrderRepository;
	
	// 관리자 대시보드 통계 조회
	@GetMapping("/admin/dashboard/stats")
	public Map<String, Object> getDashboardStats() {
		Map<String, Object> stats = new HashMap<String, Object>();
		
		try {
			// 전체 게시판 수
			long totalBoards = boardRepository.count();
			stats.put("totalBoards", totalBoards);
			
			// 활성 게시판 수
			long activeBoards = boardRepository.countByIsActive("Y");
			stats.put("activeBoards", activeBoards);
			
			// 전체 게시글 수 (삭제되지 않은 것만)
			long totalPosts = boardPostRepository.count();
			stats.put("totalPosts", totalPosts);
			
			// 오늘 작성된 게시글 수 (대략적인 계산)
			long todayPosts = boardPostRepository.count();
			stats.put("todayPosts", todayPosts);
			
			// 전체 댓글 수 (삭제되지 않은 것만)
			long totalComments = boardCommentRepository.count();
			stats.put("totalComments", totalComments);
			
			// 오늘 작성된 댓글 수 (대략적인 계산)
			long todayComments = boardCommentRepository.count();
			stats.put("todayComments", todayComments);
			
			// 전체 공구이벤트 상품 수
			long totalProducts = eventProductRepository.count();
			stats.put("totalProducts", totalProducts);
			
			// 진행중인 상품 수
			List<EventProduct> activeProductsList = eventProductRepository.findAll().stream()
				.filter(p -> "진행중".equals(p.getEventStatus()) && !"Y".equals(p.getIsDeleted()))
				.toList();
			long activeProducts = activeProductsList.size();
			stats.put("activeProducts", activeProducts);
			
			// 전체 주문 수
			long totalOrders = eventOrderRepository.count();
			stats.put("totalOrders", totalOrders);
			
			// 오늘 주문 수 (대략적인 계산)
			long todayOrders = eventOrderRepository.count();
			stats.put("todayOrders", todayOrders);
			
			stats.put("rt", "OK");
		} catch(Exception e) {
			e.printStackTrace();
			stats.put("rt", "FAIL");
			stats.put("msg", "통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return stats;
	}
	
	// 최근 게시글 목록 조회
	@GetMapping("/admin/dashboard/recent-posts")
	public Map<String, Object> getRecentPosts(@RequestParam(value = "limit", defaultValue = "10") int limit) {
		Map<String, Object> result = new HashMap<String, Object>();
		
		try {
			List<BoardPost> posts = boardPostRepository.findAll(
				Sort.by(Sort.Direction.DESC, "createdDate")
			).stream()
				.filter(p -> !"Y".equals(p.getIsDeleted()))
				.limit(limit)
				.toList();
			
			result.put("rt", "OK");
			result.put("list", posts);
			result.put("total", posts.size());
		} catch(Exception e) {
			e.printStackTrace();
			result.put("rt", "FAIL");
			result.put("msg", "최근 게시글 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return result;
	}
	
	// 최근 주문 목록 조회
	@GetMapping("/admin/dashboard/recent-orders")
	public Map<String, Object> getRecentOrders(@RequestParam(value = "limit", defaultValue = "10") int limit) {
		Map<String, Object> result = new HashMap<String, Object>();
		
		try {
			List<EventOrder> orders = eventOrderRepository.findAll(
				Sort.by(Sort.Direction.DESC, "createdDate")
			).stream()
				.limit(limit)
				.toList();
			
			result.put("rt", "OK");
			result.put("list", orders);
			result.put("total", orders.size());
		} catch(Exception e) {
			e.printStackTrace();
			result.put("rt", "FAIL");
			result.put("msg", "최근 주문 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return result;
	}
	
	// 게시판별 통계 조회
	@GetMapping("/admin/dashboard/board-stats")
	public Map<String, Object> getBoardStats() {
		Map<String, Object> result = new HashMap<String, Object>();
		
		try {
			List<Board> boards = boardRepository.findAll();
			java.util.List<Map<String, Object>> boardStatsList = new java.util.ArrayList<>();
			
			for(Board board : boards) {
				Map<String, Object> boardStat = new HashMap<String, Object>();
				boardStat.put("boardSeq", board.getBoardSeq());
				boardStat.put("boardName", board.getBoardName());
				boardStat.put("boardType", board.getBoardType());
				
				// 게시판별 게시글 수 (삭제되지 않은 것만)
				long postCount = boardPostRepository.findAll().stream()
					.filter(p -> board.getBoardSeq().equals(p.getBoardSeq()) && !"Y".equals(p.getIsDeleted()))
					.count();
				boardStat.put("postCount", postCount);
				
				// 게시판별 댓글 수 (삭제되지 않은 것만)
				long commentCount = boardCommentRepository.findAll().stream()
					.filter(c -> {
						// 게시글의 boardSeq를 확인하기 위해 게시글 조회 필요
						BoardPost post = boardPostRepository.findById(c.getPostSeq()).orElse(null);
						return post != null && board.getBoardSeq().equals(post.getBoardSeq()) && !"Y".equals(c.getIsDeleted());
					})
					.count();
				boardStat.put("commentCount", commentCount);
				
				// 공구이벤트인 경우 상품 수
				if("공구이벤트".equals(board.getBoardType())) {
					long productCount = eventProductRepository.findAll().stream()
						.filter(p -> board.getBoardSeq().equals(p.getBoardSeq()) && !"Y".equals(p.getIsDeleted()))
						.count();
					boardStat.put("productCount", productCount);
				}
				
				boardStatsList.add(boardStat);
			}
			
			result.put("rt", "OK");
			result.put("list", boardStatsList);
			result.put("total", boardStatsList.size());
		} catch(Exception e) {
			e.printStackTrace();
			result.put("rt", "FAIL");
			result.put("msg", "게시판별 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return result;
	}
}

