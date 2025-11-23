package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.CssFileDTO;
import com.example.backend.entity.CssFile;
import com.example.backend.repository.CssFileRepository;

@Repository
public class CssFileDAO {
	@Autowired
	CssFileRepository cssFileRepository;
	
	// 스타일셋 내 CSS 파일 목록 조회
	public List<CssFile> getCssFileList(Integer setSeq) {
		return cssFileRepository.findBySetSeq(setSeq);
	}
	
	// CSS 파일 상세 조회
	public CssFile getCssFile(Integer fileSeq) {
		return cssFileRepository.findById(fileSeq).orElse(null);
	}
	
	// 타입별 CSS 파일 조회
	public CssFile getCssFileByType(Integer setSeq, String fileType) {
		return cssFileRepository.findBySetSeqAndFileType(setSeq, fileType);
	}
	
	// CSS 파일 저장/수정
	public int saveCssFile(CssFileDTO dto) {
		try {
			CssFile entity;
			// 기존 파일 확인 (스타일셋 번호와 파일 타입으로)
			CssFile existing = cssFileRepository.findBySetSeqAndFileType(dto.getSetSeq(), dto.getFileType());
			
			if(existing != null) {
				// 수정
				entity = existing;
				entity.setFileName(dto.getFileName());
				entity.setCssContent(dto.getCssContent());
				entity.setModifiedDate(new Date());
			} else {
				// 신규 생성
				entity = dto.toEntity();
				entity.setCreatedDate(new Date());
				entity.setModifiedDate(new Date());
			}
			CssFile result = cssFileRepository.save(entity);
			return result != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// CSS 파일 삭제
	public int deleteCssFile(Integer fileSeq) {
		try {
			cssFileRepository.deleteById(fileSeq);
			return 1;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 스타일셋의 모든 CSS 파일 삭제
	public void deleteCssFilesBySetSeq(Integer setSeq) {
		cssFileRepository.deleteBySetSeq(setSeq);
	}
}

