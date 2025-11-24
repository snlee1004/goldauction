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

import com.example.backend.dto.EventProductDTO;
import com.example.backend.entity.EventProduct;
import com.example.backend.service.EventProductService;

@RestController
public class EventProductController {
	@Autowired
	EventProductService service;
	
	// 공구이벤트 상품 등록
	@PostMapping("/event/product/create")
	public Map<String, Object> createProduct(@RequestBody EventProductDTO dto) {
		int result = service.write(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "상품이 등록되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품 등록에 실패했습니다.");
		}
		return map;
	}
	
	// 게시판별 상품 목록 조회 (페이징)
	@GetMapping("/event/product/list")
	public Map<String, Object> getProductList(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size) {
		
		Page<EventProduct> productPage = service.getProductList(boardSeq, page, size);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", productPage.getContent());
		map.put("total", productPage.getTotalElements());
		map.put("totalPages", productPage.getTotalPages());
		map.put("currentPage", productPage.getNumber());
		map.put("size", productPage.getSize());
		return map;
	}
	
	// 게시판별 진행중인 상품 목록 조회
	@GetMapping("/event/product/active")
	public Map<String, Object> getActiveProductList(@RequestParam("boardSeq") Long boardSeq) {
		List<EventProduct> list = service.getActiveProductList(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 게시판별 상품 목록 조회 (전체)
	@GetMapping("/event/product/list/all")
	public Map<String, Object> getAllProductList(@RequestParam("boardSeq") Long boardSeq) {
		List<EventProduct> list = service.getAllProductList(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 이벤트 상태별 조회
	@GetMapping("/event/product/list/status")
	public Map<String, Object> getProductListByStatus(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam("eventStatus") String eventStatus) {
		
		List<EventProduct> list = service.getProductListByStatus(boardSeq, eventStatus);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 상품 상세 조회
	@GetMapping("/event/product/detail")
	public Map<String, Object> getProductDetail(@RequestParam("productSeq") Long productSeq) {
		EventProduct product = service.getProduct(productSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(product != null && !"Y".equals(product.getIsDeleted())) {
			map.put("rt", "OK");
			map.put("product", product);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품을 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 상품 수정
	@PostMapping("/event/product/modify")
	public Map<String, Object> modifyProduct(@RequestBody EventProductDTO dto) {
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "상품이 수정되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품 수정에 실패했습니다.");
		}
		return map;
	}
	
	// 상품 삭제
	@PostMapping("/event/product/delete")
	public Map<String, Object> deleteProduct(@RequestBody Map<String, Long> params) {
		Long productSeq = params.get("productSeq");
		int result = service.delete(productSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "상품이 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품 삭제에 실패했습니다.");
		}
		return map;
	}
	
	// 재고 차감
	@PostMapping("/event/product/stock/decrease")
	public Map<String, Object> decreaseStock(@RequestBody Map<String, Object> params) {
		Long productSeq = Long.parseLong(params.get("productSeq").toString());
		Integer quantity = Integer.parseInt(params.get("quantity").toString());
		
		int result = service.decreaseStock(productSeq, quantity);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "재고가 차감되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "재고 차감에 실패했습니다. 재고를 확인해주세요.");
		}
		return map;
	}
	
	// 재고 복구
	@PostMapping("/event/product/stock/restore")
	public Map<String, Object> restoreStock(@RequestBody Map<String, Object> params) {
		Long productSeq = Long.parseLong(params.get("productSeq").toString());
		Integer quantity = Integer.parseInt(params.get("quantity").toString());
		
		int result = service.restoreStock(productSeq, quantity);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "재고가 복구되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "재고 복구에 실패했습니다.");
		}
		return map;
	}
	
	// 이벤트 상태 자동 업데이트
	@PostMapping("/event/product/status/auto-update")
	public Map<String, Object> autoUpdateStatus(@RequestBody(required = false) Map<String, Long> params) {
		Long boardSeq = params != null ? params.get("boardSeq") : null;
		int count = service.autoUpdateStatus(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("msg", count + "개의 상품 상태가 업데이트되었습니다.");
		map.put("count", count);
		return map;
	}
}

