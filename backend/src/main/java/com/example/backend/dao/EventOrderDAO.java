package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.EventOrderDTO;
import com.example.backend.entity.EventOrder;
import com.example.backend.repository.EventOrderRepository;

@Repository
public class EventOrderDAO {
	@Autowired
	EventOrderRepository eventOrderRepository;
	
	// 공동구매 주문 등록 => 1:등록성공, 0:등록실패
	public int write(EventOrderDTO dto) {
		try {
			// 기본값 설정
			if(dto.getOrderQuantity() == null) {
				dto.setOrderQuantity(1);
			}
			if(dto.getOrderPrice() == null) {
				dto.setOrderPrice(0L);
			}
			if(dto.getOrderStatus() == null || dto.getOrderStatus().isEmpty()) {
				dto.setOrderStatus("주문완료");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			EventOrder order = eventOrderRepository.save(dto.toEntity());
			return order != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 상품별 주문 목록 조회
	public List<EventOrder> getOrderListByProduct(Long productSeq) {
		return eventOrderRepository.findByProductSeqOrderByCreatedDateDesc(productSeq);
	}
	
	// 회원별 주문 목록 조회
	public List<EventOrder> getOrderListByMember(String memberId) {
		return eventOrderRepository.findByMemberIdOrderByCreatedDateDesc(memberId);
	}
	
	// 주문 상태별 조회
	public List<EventOrder> getOrderListByStatus(String orderStatus) {
		return eventOrderRepository.findByOrderStatusOrderByCreatedDateDesc(orderStatus);
	}
	
	// 상품별 주문 목록 조회 (페이징)
	public Page<EventOrder> getOrderListByProduct(Long productSeq, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return eventOrderRepository.findByProductSeq(productSeq, pageable);
	}
	
	// 회원별 주문 목록 조회 (페이징)
	public Page<EventOrder> getOrderListByMember(String memberId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return eventOrderRepository.findByMemberId(memberId, pageable);
	}
	
	// 주문 상세 조회
	public EventOrder getOrder(Long orderSeq) {
		return eventOrderRepository.findById(orderSeq).orElse(null);
	}
	
	// 주문 수정 => 1:수정성공, 0:수정실패
	public int modify(EventOrderDTO dto) {
		try {
			EventOrder order = eventOrderRepository.findById(dto.getOrderSeq()).orElse(null);
			if(order != null) {
				// 주문일은 유지
				dto.setCreatedDate(order.getCreatedDate());
				// 수정일 설정
				dto.setUpdatedDate(new Date());
				// 기존 값 유지 (null인 경우)
				if(dto.getProductSeq() == null) {
					dto.setProductSeq(order.getProductSeq());
				}
				if(dto.getMemberId() == null || dto.getMemberId().isEmpty()) {
					dto.setMemberId(order.getMemberId());
				}
				if(dto.getOrderQuantity() == null) {
					dto.setOrderQuantity(order.getOrderQuantity());
				}
				if(dto.getOrderPrice() == null) {
					dto.setOrderPrice(order.getOrderPrice());
				}
				if(dto.getOrderStatus() == null || dto.getOrderStatus().isEmpty()) {
					dto.setOrderStatus(order.getOrderStatus());
				}
				
				EventOrder result = eventOrderRepository.save(dto.toEntity());
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 주문 삭제 => 1:삭제성공, 0:삭제실패
	public int delete(Long orderSeq) {
		try {
			eventOrderRepository.deleteById(orderSeq);
			return 1;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 주문 상태 업데이트 => 1:성공, 0:실패
	public int updateStatus(Long orderSeq, String orderStatus) {
		try {
			EventOrder order = eventOrderRepository.findById(orderSeq).orElse(null);
			if(order != null) {
				order.setOrderStatus(orderStatus);
				order.setUpdatedDate(new Date());
				EventOrder result = eventOrderRepository.save(order);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 상품별 주문 수 조회 (취소 제외)
	public long getOrderCountByProduct(Long productSeq) {
		return eventOrderRepository.countByProductSeqAndNotCanceled(productSeq);
	}
	
	// 회원별 주문 수 조회 (취소 제외)
	public long getOrderCountByMember(String memberId) {
		return eventOrderRepository.countByMemberIdAndNotCanceled(memberId);
	}
}

