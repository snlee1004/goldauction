package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.CssApplyDAO;
import com.example.backend.dto.CssApplyDTO;
import com.example.backend.entity.CssApply;

@Service
public class CssApplyService {
	@Autowired
	CssApplyDAO dao;
	
	// 현재 적용 설정 조회
	public CssApply getCurrentApply() {
		return dao.getCurrentApply();
	}
	
	// 적용 설정 저장
	public int saveCssApply(CssApplyDTO dto) {
		return dao.saveCssApply(dto);
	}
	
	// 활성화된 CSS 조회 (프론트엔드 적용용)
	public CssApply getActiveApply() {
		return dao.getActiveApply();
	}
	
	// 적용 설정 비활성화 (적용 해제)
	public int unapplyCssApply() {
		return dao.unapplyCssApply();
	}
}

