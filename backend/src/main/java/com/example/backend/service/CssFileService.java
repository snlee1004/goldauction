package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.CssFileDAO;
import com.example.backend.dto.CssFileDTO;
import com.example.backend.entity.CssFile;

@Service
public class CssFileService {
	@Autowired
	CssFileDAO dao;
	
	// 스타일셋 내 CSS 파일 목록 조회
	public List<CssFile> getCssFileList(Integer setSeq) {
		return dao.getCssFileList(setSeq);
	}
	
	// CSS 파일 상세 조회
	public CssFile getCssFile(Integer fileSeq) {
		return dao.getCssFile(fileSeq);
	}
	
	// 타입별 CSS 파일 조회
	public CssFile getCssFileByType(Integer setSeq, String fileType) {
		return dao.getCssFileByType(setSeq, fileType);
	}
	
	// CSS 파일 저장/수정
	public int saveCssFile(CssFileDTO dto) {
		return dao.saveCssFile(dto);
	}
	
	// CSS 파일 삭제
	public int deleteCssFile(Integer fileSeq) {
		return dao.deleteCssFile(fileSeq);
	}
}

