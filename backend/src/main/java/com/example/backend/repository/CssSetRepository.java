package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.CssSet;

@Repository
public interface CssSetRepository extends JpaRepository<CssSet, Integer> {
	// 스타일셋 이름으로 조회
	CssSet findBySetName(String setName);
	
	// 활성화된 스타일셋 조회
	@Query(value = "SELECT * FROM CSS_SET1 WHERE IS_ACTIVE = 'Y'", nativeQuery = true)
	List<CssSet> findActiveSets();
	
	// 스타일셋 이름 존재 여부 확인
	boolean existsBySetName(String setName);
}

