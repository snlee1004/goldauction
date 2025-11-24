package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ProfanityFilterDTO;
import com.example.backend.entity.ProfanityFilter;
import com.example.backend.service.ProfanityFilterService;

@RestController
public class ProfanityFilterController {
	@Autowired
	ProfanityFilterService service;
	
	// 비속어 필터 등록
	@PostMapping("/profanity/create")
	public Map<String, Object> createFilter(@RequestBody ProfanityFilterDTO dto) {
		int result = service.write(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "비속어 필터가 등록되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "비속어 필터 등록에 실패했습니다.");
		}
		return map;
	}
	
	// 활성화된 비속어 목록 조회
	@GetMapping("/profanity/list/active")
	public Map<String, Object> getActiveFilterList() {
		List<ProfanityFilter> list = service.getActiveFilterList();
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 전체 비속어 목록 조회
	@GetMapping("/profanity/list")
	public Map<String, Object> getAllFilterList() {
		List<ProfanityFilter> list = service.getAllFilterList();
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 비속어 검색
	@GetMapping("/profanity/search")
	public Map<String, Object> searchFilters(@RequestParam("keyword") String keyword) {
		List<ProfanityFilter> list = service.searchFilters(keyword);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 비속어 상세 조회
	@GetMapping("/profanity/detail")
	public Map<String, Object> getFilterDetail(@RequestParam("filterSeq") Long filterSeq) {
		ProfanityFilter filter = service.getFilter(filterSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(filter != null) {
			map.put("rt", "OK");
			map.put("filter", filter);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "비속어 필터를 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 비속어 수정
	@PostMapping("/profanity/modify")
	public Map<String, Object> modifyFilter(@RequestBody ProfanityFilterDTO dto) {
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "비속어 필터가 수정되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "비속어 필터 수정에 실패했습니다.");
		}
		return map;
	}
	
	// 비속어 삭제
	@PostMapping("/profanity/delete")
	public Map<String, Object> deleteFilter(@RequestBody Map<String, Long> params) {
		Long filterSeq = params.get("filterSeq");
		int result = service.delete(filterSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "비속어 필터가 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "비속어 필터 삭제에 실패했습니다.");
		}
		return map;
	}
	
	// 비속어 활성화/비활성화
	@PostMapping("/profanity/toggle")
	public Map<String, Object> toggleActive(@RequestBody Map<String, Object> params) {
		Long filterSeq = Long.parseLong(params.get("filterSeq").toString());
		String isActive = params.get("isActive").toString();
		int result = service.toggleActive(filterSeq, isActive);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "비속어 필터 상태가 변경되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "비속어 필터 상태 변경에 실패했습니다.");
		}
		return map;
	}
	
	// 텍스트 비속어 검사
	@PostMapping("/profanity/check")
	public Map<String, Object> checkProfanity(@RequestBody Map<String, String> params) {
		String text = params.get("text");
		Map<String, Object> result = service.checkAndFilter(text);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.putAll(result);
		return map;
	}
}

