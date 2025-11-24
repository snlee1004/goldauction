package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.ProfanityFilter;

public interface ProfanityFilterRepository extends JpaRepository<ProfanityFilter, Long> {
	// 활성화된 비속어 목록 조회
	List<ProfanityFilter> findByIsActiveOrderByProfanityWordAsc(String isActive);
	
	// 비속어 검색
	@Query("SELECT f FROM ProfanityFilter f WHERE UPPER(f.profanityWord) LIKE UPPER(CONCAT('%', :keyword, '%')) AND f.isActive = :isActive ORDER BY f.profanityWord ASC")
	List<ProfanityFilter> findByKeyword(@Param("keyword") String keyword, @Param("isActive") String isActive);
	
	// 활성화된 비속어 수 조회
	long countByIsActive(String isActive);
}

