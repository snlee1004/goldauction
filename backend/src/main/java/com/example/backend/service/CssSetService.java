package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dao.CssSetDAO;
import com.example.backend.dao.CssFileDAO;
import com.example.backend.dao.CssApplyDAO;
import com.example.backend.dto.CssSetDTO;
import com.example.backend.entity.CssSet;

@Service
public class CssSetService {
	@Autowired
	CssSetDAO dao;
	
	@Autowired
	CssFileDAO cssFileDAO;
	
	@Autowired
	CssApplyDAO cssApplyDAO;
	
	// 스타일셋 목록 조회
	public List<CssSet> getCssSetList() {
		return dao.getCssSetList();
	}
	
	// 스타일셋 상세 조회
	public CssSet getCssSet(Integer setSeq) {
		return dao.getCssSet(setSeq);
	}
	
	// 스타일셋 저장/수정
	public int saveCssSet(CssSetDTO dto) {
		return dao.saveCssSet(dto);
	}
	
	// 스타일셋 삭제 (관련 CSS 파일과 적용 정보도 함께 삭제)
	@Transactional
	public int deleteCssSet(Integer setSeq) {
		try {
			// 1. 먼저 CSS_APPLY1에서 해당 setSeq를 참조하는 레코드 삭제
			// (활성화된 적용 설정이 있으면 비활성화)
			com.example.backend.entity.CssApply activeApply = cssApplyDAO.getActiveApply();
			if(activeApply != null && activeApply.getSetSeq().equals(setSeq)) {
				cssApplyDAO.unapplyCssApply();
			}
			
			// CSS_APPLY1에서 해당 setSeq를 참조하는 모든 레코드 삭제
			cssApplyDAO.deleteBySetSeq(setSeq);
			
			// 2. CSS_FILE1에서 해당 setSeq를 참조하는 모든 레코드 삭제
			cssFileDAO.deleteCssFilesBySetSeq(setSeq);
			
			// 3. CSS_SET1에서 해당 setSeq 삭제
			return dao.deleteCssSet(setSeq);
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 활성화된 스타일셋 조회
	public CssSet getActiveCssSet() {
		return dao.getActiveCssSet();
	}
	
	// 스타일셋 이름 중복 확인
	public boolean isExistSetName(String setName) {
		return dao.isExistSetName(setName);
	}
}

