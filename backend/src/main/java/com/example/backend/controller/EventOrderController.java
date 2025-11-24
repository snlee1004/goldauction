package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.EventOrderDTO;
import com.example.backend.entity.EventOrder;
import com.example.backend.service.EventOrderService;
import com.example.backend.service.EventProductService;

@RestController
public class EventOrderController {
	@Autowired
	EventOrderService orderService;
	
	@Autowired
	EventProductService productService;
	
	// 공동구매 주문 등록
	@PostMapping("/event/order/create")
	public Map<String, Object> createOrder(@RequestBody EventOrderDTO dto) {
		// 재고 확인
		com.example.backend.entity.EventProduct product = productService.getProduct(dto.getProductSeq());
		if(product == null || "Y".equals(product.getIsDeleted())) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "상품을 찾을 수 없습니다.");
			return map;
		}
		
		if(product.getStockQuantity() < dto.getOrderQuantity()) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "재고가 부족합니다. (현재 재고: " + product.getStockQuantity() + ")");
			return map;
		}
		
		// 주문 등록 및 재고 차감
		int orderResult = orderService.write(dto);
		if(orderResult == 1) {
			// 재고 차감
			int stockResult = productService.decreaseStock(dto.getProductSeq(), dto.getOrderQuantity());
			if(stockResult == 1) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("rt", "OK");
				map.put("msg", "주문이 완료되었습니다.");
				return map;
			} else {
				// 재고 차감 실패 시 주문 취소
				orderService.delete(orderService.getOrderListByProduct(dto.getProductSeq()).get(0).getOrderSeq());
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("rt", "FAIL");
				map.put("msg", "재고 차감에 실패했습니다.");
				return map;
			}
		} else {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "주문 등록에 실패했습니다.");
			return map;
		}
	}
	
	// 상품별 주문 목록 조회
	@GetMapping("/event/order/list/product")
	public Map<String, Object> getOrderListByProduct(
			@RequestParam("productSeq") Long productSeq,
			@RequestParam(value = "page", required = false) Integer page,
			@RequestParam(value = "size", required = false) Integer size) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		if(page != null && size != null) {
			// 페이징 조회
			Page<EventOrder> orderPage = orderService.getOrderListByProduct(productSeq, page, size);
			map.put("rt", "OK");
			map.put("list", orderPage.getContent());
			map.put("total", orderPage.getTotalElements());
			map.put("totalPages", orderPage.getTotalPages());
			map.put("currentPage", orderPage.getNumber());
		} else {
			// 전체 조회
			List<EventOrder> list = orderService.getOrderListByProduct(productSeq);
			map.put("rt", "OK");
			map.put("list", list);
			map.put("total", list.size());
		}
		
		return map;
	}
	
	// 회원별 주문 목록 조회
	@GetMapping("/event/order/list/member")
	public Map<String, Object> getOrderListByMember(
			@RequestParam("memberId") String memberId,
			@RequestParam(value = "page", required = false) Integer page,
			@RequestParam(value = "size", required = false) Integer size) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		if(page != null && size != null) {
			// 페이징 조회
			Page<EventOrder> orderPage = orderService.getOrderListByMember(memberId, page, size);
			map.put("rt", "OK");
			map.put("list", orderPage.getContent());
			map.put("total", orderPage.getTotalElements());
			map.put("totalPages", orderPage.getTotalPages());
			map.put("currentPage", orderPage.getNumber());
		} else {
			// 전체 조회
			List<EventOrder> list = orderService.getOrderListByMember(memberId);
			map.put("rt", "OK");
			map.put("list", list);
			map.put("total", list.size());
		}
		
		return map;
	}
	
	// 주문 상태별 조회
	@GetMapping("/event/order/list/status")
	public Map<String, Object> getOrderListByStatus(@RequestParam("orderStatus") String orderStatus) {
		List<EventOrder> list = orderService.getOrderListByStatus(orderStatus);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 주문 상세 조회
	@GetMapping("/event/order/detail")
	public Map<String, Object> getOrderDetail(@RequestParam("orderSeq") Long orderSeq) {
		EventOrder order = orderService.getOrder(orderSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(order != null) {
			map.put("rt", "OK");
			map.put("order", order);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "주문을 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 주문 수정
	@PostMapping("/event/order/modify")
	public Map<String, Object> modifyOrder(@RequestBody EventOrderDTO dto) {
		int result = orderService.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "주문이 수정되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "주문 수정에 실패했습니다.");
		}
		return map;
	}
	
	// 주문 삭제
	@PostMapping("/event/order/delete")
	public Map<String, Object> deleteOrder(@RequestBody Map<String, Long> params) {
		Long orderSeq = params.get("orderSeq");
		int result = orderService.delete(orderSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "주문이 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "주문 삭제에 실패했습니다.");
		}
		return map;
	}
	
	// 주문 상태 업데이트
	@PostMapping("/event/order/status")
	public Map<String, Object> updateOrderStatus(@RequestBody Map<String, Object> params) {
		Long orderSeq = Long.parseLong(params.get("orderSeq").toString());
		String orderStatus = params.get("orderStatus").toString();
		
		int result = orderService.updateStatus(orderSeq, orderStatus);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "주문 상태가 업데이트되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "주문 상태 업데이트에 실패했습니다.");
		}
		return map;
	}
	
	// 주문 취소 (재고 복구 포함)
	@PostMapping("/event/order/cancel")
	public Map<String, Object> cancelOrder(@RequestBody Map<String, Long> params) {
		Long orderSeq = params.get("orderSeq");
		EventOrder order = orderService.getOrder(orderSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(order == null) {
			map.put("rt", "FAIL");
			map.put("msg", "주문을 찾을 수 없습니다.");
			return map;
		}
		
		if("취소".equals(order.getOrderStatus())) {
			map.put("rt", "FAIL");
			map.put("msg", "이미 취소된 주문입니다.");
			return map;
		}
		
		// 주문 상태를 취소로 변경
		int statusResult = orderService.updateStatus(orderSeq, "취소");
		if(statusResult == 1) {
			// 재고 복구
			int stockResult = productService.restoreStock(order.getProductSeq(), order.getOrderQuantity());
			if(stockResult == 1) {
				map.put("rt", "OK");
				map.put("msg", "주문이 취소되었고 재고가 복구되었습니다.");
			} else {
				map.put("rt", "OK");
				map.put("msg", "주문이 취소되었습니다. (재고 복구 실패)");
			}
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "주문 취소에 실패했습니다.");
		}
		
		return map;
	}
	
	// 상품별 주문 수 조회
	@GetMapping("/event/order/count/product")
	public Map<String, Object> getOrderCountByProduct(@RequestParam("productSeq") Long productSeq) {
		long count = orderService.getOrderCountByProduct(productSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("count", count);
		return map;
	}
	
	// 회원별 주문 수 조회
	@GetMapping("/event/order/count/member")
	public Map<String, Object> getOrderCountByMember(@RequestParam("memberId") String memberId) {
		long count = orderService.getOrderCountByMember(memberId);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("count", count);
		return map;
	}
}

