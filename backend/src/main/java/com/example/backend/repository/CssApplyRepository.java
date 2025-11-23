package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.entity.CssApply;

@Repository
public interface CssApplyRepository extends JpaRepository<CssApply, Integer> {
	// 활성화된 적용 설정 조회
	@Query(value = "SELECT * FROM CSS_APPLY1 WHERE IS_ACTIVE = 'Y' ORDER BY APPLIED_DATE DESC", nativeQuery = true)
	CssApply findActiveApply();
	
	// 스타일셋 번호로 적용 설정 목록 조회
	@Query(value = "SELECT * FROM CSS_APPLY1 WHERE SET_SEQ = ?1", nativeQuery = true)
	List<CssApply> findBySetSeq(Integer setSeq);
	
	// 스타일셋 번호로 적용 설정 삭제
	@Modifying
	@Transactional
	@Query(value = "DELETE FROM CSS_APPLY1 WHERE SET_SEQ = ?1", nativeQuery = true)
	void deleteBySetSeq(Integer setSeq);
}

