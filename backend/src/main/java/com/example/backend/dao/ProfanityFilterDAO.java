package com.example.backend.dao;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.ProfanityFilterDTO;
import com.example.backend.entity.ProfanityFilter;
import com.example.backend.repository.ProfanityFilterRepository;

@Repository
public class ProfanityFilterDAO {
	@Autowired
	ProfanityFilterRepository profanityFilterRepository;
	
	// 비속어 필터 등록 => 1:등록성공, 0:등록실패
	public int write(ProfanityFilterDTO dto) {
		try {
			// 기본값 설정
			if(dto.getIsActive() == null || dto.getIsActive().isEmpty()) {
				dto.setIsActive("Y");
			}
			if(dto.getFilterType() == null || dto.getFilterType().isEmpty()) {
				dto.setFilterType("마스킹");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			ProfanityFilter filter = profanityFilterRepository.save(dto.toEntity());
			return filter != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 활성화된 비속어 목록 조회
	public List<ProfanityFilter> getActiveFilterList() {
		return profanityFilterRepository.findByIsActiveOrderByProfanityWordAsc("Y");
	}
	
	// 전체 비속어 목록 조회
	public List<ProfanityFilter> getAllFilterList() {
		return profanityFilterRepository.findAll();
	}
	
	// 비속어 검색
	public List<ProfanityFilter> searchFilters(String keyword) {
		return profanityFilterRepository.findByKeyword(keyword, "Y");
	}
	
	// 비속어 상세 조회
	public ProfanityFilter getFilter(Long filterSeq) {
		return profanityFilterRepository.findById(filterSeq).orElse(null);
	}
	
	// 비속어 수정 => 1:수정성공, 0:수정실패
	public int modify(ProfanityFilterDTO dto) {
		try {
			ProfanityFilter filter = profanityFilterRepository.findById(dto.getFilterSeq()).orElse(null);
			if(filter != null) {
				// 생성일은 유지
				dto.setCreatedDate(filter.getCreatedDate());
				// 수정일 설정
				dto.setUpdatedDate(new Date());
				// 기본값 설정
				if(dto.getIsActive() == null || dto.getIsActive().isEmpty()) {
					dto.setIsActive(filter.getIsActive());
				}
				if(dto.getFilterType() == null || dto.getFilterType().isEmpty()) {
					dto.setFilterType(filter.getFilterType());
				}
				
				ProfanityFilter result = profanityFilterRepository.save(dto.toEntity());
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 비속어 삭제 => 1:삭제성공, 0:삭제실패
	public int delete(Long filterSeq) {
		try {
			profanityFilterRepository.deleteById(filterSeq);
			return 1;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 비속어 활성화/비활성화 => 1:성공, 0:실패
	public int toggleActive(Long filterSeq, String isActive) {
		try {
			ProfanityFilter filter = profanityFilterRepository.findById(filterSeq).orElse(null);
			if(filter != null) {
				filter.setIsActive(isActive);
				filter.setUpdatedDate(new Date());
				ProfanityFilter result = profanityFilterRepository.save(filter);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 텍스트에 비속어 포함 여부 확인
	public boolean containsProfanity(String text) {
		if(text == null || text.isEmpty()) {
			return false;
		}
		
		List<ProfanityFilter> activeFilters = profanityFilterRepository.findByIsActiveOrderByProfanityWordAsc("Y");
		String upperText = text.toUpperCase();
		
		for(ProfanityFilter filter : activeFilters) {
			if(upperText.contains(filter.getProfanityWord().toUpperCase())) {
				return true;
			}
		}
		return false;
	}
	
	// 텍스트에서 비속어 필터링 (마스킹 또는 대체)
	public String filterProfanity(String text) {
		if(text == null || text.isEmpty()) {
			return text;
		}
		
		List<ProfanityFilter> activeFilters = profanityFilterRepository.findByIsActiveOrderByProfanityWordAsc("Y");
		String result = text;
		
		for(ProfanityFilter filter : activeFilters) {
			String profanity = filter.getProfanityWord();
			String replacement = filter.getReplacementWord();
			
			if("작성불가".equals(filter.getFilterType())) {
				// 작성불가 타입은 그대로 두고, 검사만 수행
				continue;
			}
			
			// 마스킹 처리
			if(replacement == null || replacement.isEmpty()) {
				// 대체어가 없으면 별표로 마스킹
				String mask = "*".repeat(profanity.length());
				result = result.replaceAll("(?i)" + profanity, mask);
			} else {
				// 대체어로 교체
				result = result.replaceAll("(?i)" + profanity, replacement);
			}
		}
		
		return result;
	}
	
	// 텍스트에서 비속어 검사 및 필터링 결과 반환
	public Map<String, Object> checkAndFilter(String text) {
		Map<String, Object> result = new HashMap<>();
		result.put("containsProfanity", false);
		result.put("filteredText", text);
		result.put("blocked", false);
		
		if(text == null || text.isEmpty()) {
			return result;
		}
		
		List<ProfanityFilter> activeFilters = profanityFilterRepository.findByIsActiveOrderByProfanityWordAsc("Y");
		String upperText = text.toUpperCase();
		boolean containsProfanity = false;
		boolean blocked = false;
		String filteredText = text;
		
		for(ProfanityFilter filter : activeFilters) {
			String profanity = filter.getProfanityWord();
			if(upperText.contains(profanity.toUpperCase())) {
				containsProfanity = true;
				
				if("작성불가".equals(filter.getFilterType())) {
					blocked = true;
					break;
				}
				
				// 마스킹 처리
				String replacement = filter.getReplacementWord();
				if(replacement == null || replacement.isEmpty()) {
					String mask = "*".repeat(profanity.length());
					filteredText = filteredText.replaceAll("(?i)" + profanity, mask);
				} else {
					filteredText = filteredText.replaceAll("(?i)" + profanity, replacement);
				}
			}
		}
		
		result.put("containsProfanity", containsProfanity);
		result.put("filteredText", filteredText);
		result.put("blocked", blocked);
		
		return result;
	}
}

