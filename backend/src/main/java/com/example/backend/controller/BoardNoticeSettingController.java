package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.BoardNoticeSettingDTO;
import com.example.backend.entity.BoardNoticeSetting;
import com.example.backend.service.BoardNoticeSettingService;

@RestController
public class BoardNoticeSettingController {
	@Autowired
	BoardNoticeSettingService service;
	
	// 공지사항 설정 조회
	@GetMapping("/board/notice/setting")
	public Map<String, Object> getSetting(@RequestParam("boardSeq") Long boardSeq) {
		BoardNoticeSetting setting = service.getSetting(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(setting != null) {
			map.put("rt", "OK");
			map.put("setting", setting);
		} else {
			// 기본값 반환
			map.put("rt", "OK");
			map.put("setting", new BoardNoticeSetting(boardSeq, 5, null));
		}
		return map;
	}
	
	// 공지사항 설정 저장/수정
	@PostMapping("/board/notice/setting")
	public Map<String, Object> saveSetting(@RequestBody BoardNoticeSettingDTO dto) {
		int result = service.save(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "공지사항 설정이 저장되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "공지사항 설정 저장에 실패했습니다.");
		}
		return map;
	}
}

