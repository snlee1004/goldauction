package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.example.backend.dao.EventProductDAO;
import com.example.backend.dto.EventProductDTO;
import com.example.backend.entity.EventProduct;

@Service
public class EventProductService {
	@Autowired
	EventProductDAO dao;
	
	// 공구이벤트 상품 등록
	public int write(EventProductDTO dto) {
		return dao.write(dto);
	}
	
	// 게시판별 상품 목록 조회 (페이징)
	public Page<EventProduct> getProductList(Long boardSeq, int page, int size) {
		return dao.getProductList(boardSeq, page, size);
	}
	
	// 게시판별 진행중인 상품 목록 조회
	public List<EventProduct> getActiveProductList(Long boardSeq) {
		return dao.getActiveProductList(boardSeq);
	}
	
	// 게시판별 상품 목록 조회 (전체)
	public List<EventProduct> getAllProductList(Long boardSeq) {
		return dao.getAllProductList(boardSeq);
	}
	
	// 이벤트 상태별 조회
	public List<EventProduct> getProductListByStatus(Long boardSeq, String eventStatus) {
		return dao.getProductListByStatus(boardSeq, eventStatus);
	}
	
	// 상품 상세 조회
	public EventProduct getProduct(Long productSeq) {
		return dao.getProduct(productSeq);
	}
	
	// 상품 수정
	public int modify(EventProductDTO dto) {
		return dao.modify(dto);
	}
	
	// 상품 삭제
	public int delete(Long productSeq) {
		return dao.delete(productSeq);
	}
	
	// 재고 차감
	public int decreaseStock(Long productSeq, Integer quantity) {
		return dao.decreaseStock(productSeq, quantity);
	}
	
	// 재고 복구
	public int restoreStock(Long productSeq, Integer quantity) {
		return dao.restoreStock(productSeq, quantity);
	}
	
	// 이벤트 상태 자동 업데이트
	public int autoUpdateStatus(Long boardSeq) {
		return dao.autoUpdateStatus(boardSeq);
	}
	
	// 게시판별 상품 수 조회
	public long getTotalCount(Long boardSeq) {
		return dao.getTotalCount(boardSeq);
	}
}

