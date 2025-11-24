package com.example.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.ProfanityFilterDAO;
import com.example.backend.dto.ProfanityFilterDTO;
import com.example.backend.entity.ProfanityFilter;

@Service
public class ProfanityFilterService {
	@Autowired
	ProfanityFilterDAO dao;
	
	// 비속어 필터 등록
	public int write(ProfanityFilterDTO dto) {
		return dao.write(dto);
	}
	
	// 활성화된 비속어 목록 조회
	public List<ProfanityFilter> getActiveFilterList() {
		return dao.getActiveFilterList();
	}
	
	// 전체 비속어 목록 조회
	public List<ProfanityFilter> getAllFilterList() {
		return dao.getAllFilterList();
	}
	
	// 비속어 검색
	public List<ProfanityFilter> searchFilters(String keyword) {
		return dao.searchFilters(keyword);
	}
	
	// 비속어 상세 조회
	public ProfanityFilter getFilter(Long filterSeq) {
		return dao.getFilter(filterSeq);
	}
	
	// 비속어 수정
	public int modify(ProfanityFilterDTO dto) {
		return dao.modify(dto);
	}
	
	// 비속어 삭제
	public int delete(Long filterSeq) {
		return dao.delete(filterSeq);
	}
	
	// 비속어 활성화/비활성화
	public int toggleActive(Long filterSeq, String isActive) {
		return dao.toggleActive(filterSeq, isActive);
	}
	
	// 텍스트에 비속어 포함 여부 확인
	public boolean containsProfanity(String text) {
		return dao.containsProfanity(text);
	}
	
	// 텍스트에서 비속어 필터링
	public String filterProfanity(String text) {
		return dao.filterProfanity(text);
	}
	
	// 텍스트에서 비속어 검사 및 필터링 결과 반환
	public Map<String, Object> checkAndFilter(String text) {
		return dao.checkAndFilter(text);
	}
}

