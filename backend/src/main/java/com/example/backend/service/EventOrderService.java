package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.example.backend.dao.EventOrderDAO;
import com.example.backend.dto.EventOrderDTO;
import com.example.backend.entity.EventOrder;

@Service
public class EventOrderService {
	@Autowired
	EventOrderDAO dao;
	
	// 공동구매 주문 등록
	public int write(EventOrderDTO dto) {
		return dao.write(dto);
	}
	
	// 상품별 주문 목록 조회
	public List<EventOrder> getOrderListByProduct(Long productSeq) {
		return dao.getOrderListByProduct(productSeq);
	}
	
	// 회원별 주문 목록 조회
	public List<EventOrder> getOrderListByMember(String memberId) {
		return dao.getOrderListByMember(memberId);
	}
	
	// 주문 상태별 조회
	public List<EventOrder> getOrderListByStatus(String orderStatus) {
		return dao.getOrderListByStatus(orderStatus);
	}
	
	// 상품별 주문 목록 조회 (페이징)
	public Page<EventOrder> getOrderListByProduct(Long productSeq, int page, int size) {
		return dao.getOrderListByProduct(productSeq, page, size);
	}
	
	// 회원별 주문 목록 조회 (페이징)
	public Page<EventOrder> getOrderListByMember(String memberId, int page, int size) {
		return dao.getOrderListByMember(memberId, page, size);
	}
	
	// 주문 상세 조회
	public EventOrder getOrder(Long orderSeq) {
		return dao.getOrder(orderSeq);
	}
	
	// 주문 수정
	public int modify(EventOrderDTO dto) {
		return dao.modify(dto);
	}
	
	// 주문 삭제
	public int delete(Long orderSeq) {
		return dao.delete(orderSeq);
	}
	
	// 주문 상태 업데이트
	public int updateStatus(Long orderSeq, String orderStatus) {
		return dao.updateStatus(orderSeq, orderStatus);
	}
	
	// 상품별 주문 수 조회
	public long getOrderCountByProduct(Long productSeq) {
		return dao.getOrderCountByProduct(productSeq);
	}
	
	// 회원별 주문 수 조회
	public long getOrderCountByMember(String memberId) {
		return dao.getOrderCountByMember(memberId);
	}
}

