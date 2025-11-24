package com.example.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.EventOrder;

public interface EventOrderRepository extends JpaRepository<EventOrder, Long> {
	// 상품별 주문 목록 조회
	List<EventOrder> findByProductSeqOrderByCreatedDateDesc(Long productSeq);
	
	// 회원별 주문 목록 조회
	List<EventOrder> findByMemberIdOrderByCreatedDateDesc(String memberId);
	
	// 주문 상태별 조회
	List<EventOrder> findByOrderStatusOrderByCreatedDateDesc(String orderStatus);
	
	// 상품별 주문 목록 조회 (페이징)
	Page<EventOrder> findByProductSeq(Long productSeq, Pageable pageable);
	
	// 회원별 주문 목록 조회 (페이징)
	Page<EventOrder> findByMemberId(String memberId, Pageable pageable);
	
	// 상품별 주문 수 조회 (취소 제외)
	@Query("SELECT COUNT(o) FROM EventOrder o WHERE o.productSeq = :productSeq AND o.orderStatus != '취소'")
	long countByProductSeqAndNotCanceled(@Param("productSeq") Long productSeq);
	
	// 회원별 주문 수 조회 (취소 제외)
	@Query("SELECT COUNT(o) FROM EventOrder o WHERE o.memberId = :memberId AND o.orderStatus != '취소'")
	long countByMemberIdAndNotCanceled(@Param("memberId") String memberId);
}

