package com.example.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.EventProduct;

public interface EventProductRepository extends JpaRepository<EventProduct, Long> {
	// 게시판별 상품 목록 조회 (삭제되지 않은 것만)
	@Query("SELECT p FROM EventProduct p WHERE p.boardSeq = :boardSeq AND p.isDeleted = 'N' ORDER BY p.createdDate DESC")
	Page<EventProduct> findByBoardSeqAndNotDeleted(@Param("boardSeq") Long boardSeq, Pageable pageable);
	
	// 게시판별 진행중인 상품 목록 조회
	@Query("SELECT p FROM EventProduct p WHERE p.boardSeq = :boardSeq AND p.eventStatus = '진행중' AND p.isDeleted = 'N' ORDER BY p.createdDate DESC")
	List<EventProduct> findActiveProductsByBoardSeq(@Param("boardSeq") Long boardSeq);
	
	// 게시판별 상품 목록 조회 (전체)
	List<EventProduct> findByBoardSeqAndIsDeletedOrderByCreatedDateDesc(Long boardSeq, String isDeleted);
	
	// 이벤트 상태별 조회
	List<EventProduct> findByBoardSeqAndEventStatusAndIsDeletedOrderByCreatedDateDesc(Long boardSeq, String eventStatus, String isDeleted);
	
	// 게시판별 상품 수 조회
	long countByBoardSeqAndIsDeleted(Long boardSeq, String isDeleted);
	
	// 상태별 상품 조회 (boardSeq가 null이면 전체)
	@Query("SELECT p FROM EventProduct p WHERE (:boardSeq IS NULL OR p.boardSeq = :boardSeq) AND p.eventStatus = :eventStatus AND p.isDeleted = 'N' ORDER BY p.createdDate DESC")
	List<EventProduct> findAllByStatus(@Param("boardSeq") Long boardSeq, @Param("eventStatus") String eventStatus);
}

