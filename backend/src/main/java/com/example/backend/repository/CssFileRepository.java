package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.CssFile;

@Repository
public interface CssFileRepository extends JpaRepository<CssFile, Integer> {
	// 스타일셋 번호로 CSS 파일 목록 조회
	List<CssFile> findBySetSeq(Integer setSeq);
	
	// 스타일셋 번호와 파일 타입으로 CSS 파일 조회
	CssFile findBySetSeqAndFileType(Integer setSeq, String fileType);
	
	// 스타일셋 번호로 CSS 파일 삭제
	void deleteBySetSeq(Integer setSeq);
}

