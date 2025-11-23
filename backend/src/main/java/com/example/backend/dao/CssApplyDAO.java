package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.CssApplyDTO;
import com.example.backend.entity.CssApply;
import com.example.backend.repository.CssApplyRepository;

@Repository
public class CssApplyDAO {
	@Autowired
	CssApplyRepository cssApplyRepository;
	
	// 현재 적용 설정 조회
	public CssApply getCurrentApply() {
		return cssApplyRepository.findActiveApply();
	}
	
	// 적용 설정 저장
	public int saveCssApply(CssApplyDTO dto) {
		try {
			// 기존 활성화된 설정을 비활성화
			CssApply existing = cssApplyRepository.findActiveApply();
			if(existing != null) {
				existing.setIsActive("N");
				cssApplyRepository.save(existing);
			}
			
			// 새로운 설정 저장
			CssApply entity = dto.toEntity();
			entity.setIsActive("Y");
			entity.setAppliedDate(new Date());
			CssApply result = cssApplyRepository.save(entity);
			return result != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 활성화된 CSS 조회 (프론트엔드 적용용)
	public CssApply getActiveApply() {
		return cssApplyRepository.findActiveApply();
	}
	
	// 적용 설정 비활성화 (적용 해제)
	public int unapplyCssApply() {
		try {
			// 현재 활성화된 적용 설정 조회
			CssApply existing = cssApplyRepository.findActiveApply();
			if(existing != null) {
				existing.setIsActive("N");
				CssApply result = cssApplyRepository.save(existing);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 스타일셋 번호로 적용 설정 목록 조회
	public List<CssApply> findBySetSeq(Integer setSeq) {
		return cssApplyRepository.findBySetSeq(setSeq);
	}
	
	// 적용 설정 삭제
	public void deleteCssApply(Integer applySeq) {
		cssApplyRepository.deleteById(applySeq);
	}
	
	// 스타일셋 번호로 적용 설정 삭제
	public void deleteBySetSeq(Integer setSeq) {
		cssApplyRepository.deleteBySetSeq(setSeq);
	}
}

