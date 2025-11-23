package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.CssSetDTO;
import com.example.backend.entity.CssSet;
import com.example.backend.repository.CssSetRepository;

@Repository
public class CssSetDAO {
	@Autowired
	CssSetRepository cssSetRepository;
	
	// 스타일셋 목록 조회 (생성일시 내림차순 정렬)
	public List<CssSet> getCssSetList() {
		// 복제된 항목이 원본 바로 다음에 나타나도록 정렬
		// SET_SEQ 기준 내림차순 (최신 것이 위에)
		return cssSetRepository.findAll().stream()
			.sorted((a, b) -> {
				// SET_SEQ 기준 내림차순
				return Integer.compare(b.getSetSeq(), a.getSetSeq());
			})
			.collect(java.util.stream.Collectors.toList());
	}
	
	// 스타일셋 상세 조회
	public CssSet getCssSet(Integer setSeq) {
		return cssSetRepository.findById(setSeq).orElse(null);
	}
	
	// 스타일셋 저장/수정
	public int saveCssSet(CssSetDTO dto) {
		try {
			CssSet entity;
			if(dto.getSetSeq() != null) {
				// 수정
				entity = cssSetRepository.findById(dto.getSetSeq()).orElse(null);
				if(entity != null) {
					entity.setSetName(dto.getSetName());
					entity.setSetDescription(dto.getSetDescription());
					entity.setIsActive(dto.getIsActive());
					entity.setModifiedDate(new Date());
				} else {
					return 0;
				}
			} else {
				// 신규 생성
				entity = dto.toEntity();
				entity.setCreatedDate(new Date());
				entity.setModifiedDate(new Date());
				if(entity.getIsActive() == null) {
					entity.setIsActive("N");
				}
			}
			CssSet result = cssSetRepository.save(entity);
			return result != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 스타일셋 삭제
	public int deleteCssSet(Integer setSeq) {
		try {
			// 먼저 존재하는지 확인
			if(!cssSetRepository.existsById(setSeq)) {
				return 0;
			}
			// 삭제 실행
			cssSetRepository.deleteById(setSeq);
			// 삭제 확인
			if(!cssSetRepository.existsById(setSeq)) {
				return 1;
			} else {
				return 0;
			}
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 활성화된 스타일셋 조회
	public CssSet getActiveCssSet() {
		List<CssSet> activeSets = cssSetRepository.findActiveSets();
		return activeSets.isEmpty() ? null : activeSets.get(0);
	}
	
	// 스타일셋 이름 중복 확인
	public boolean isExistSetName(String setName) {
		return cssSetRepository.existsBySetName(setName);
	}
}

