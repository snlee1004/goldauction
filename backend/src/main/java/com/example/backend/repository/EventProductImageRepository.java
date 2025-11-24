package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.EventProductImage;

@Repository
public interface EventProductImageRepository extends JpaRepository<EventProductImage, Long> {
	// 상품 번호로 이미지 목록 조회 (순서대로)
	List<EventProductImage> findByProductSeqOrderByImageOrderAsc(Long productSeq);
	
	// 상품 번호로 이미지 삭제
	void deleteByProductSeq(Long productSeq);
}

