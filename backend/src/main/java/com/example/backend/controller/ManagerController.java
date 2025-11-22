package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ManagerDTO;
import com.example.backend.entity.Manager;
import com.example.backend.service.ManagerService;

@RestController
public class ManagerController {
	@Autowired
	ManagerService service;
	
	// 관리자 로그인
	@PostMapping("/manager/login")
	public Map<String, Object> login(@RequestBody Map<String, String> params) {
		String managerId = params.get("managerId");
		String managerPwd = params.get("managerPwd");
		
		Manager manager = service.login(managerId, managerPwd);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(manager != null) {
			map.put("rt", "OK");
			map.put("managerId", manager.getManagerId());
			map.put("managerName", manager.getManagerName());
			map.put("managerRole", manager.getManagerRole());
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "아이디 또는 비밀번호가 일치하지 않습니다.");
		}
		return map;
	}
	
	// 관리자 정보 조회
	@GetMapping("/manager/getManager")
	public Map<String, Object> getManager(@RequestParam("managerId") String managerId) {
		Manager manager = service.getManager(managerId);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(manager != null) {
			map.put("rt", "OK");
			map.put("manager", manager);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "관리자 정보를 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 관리자 정보 수정
	@PostMapping("/manager/modify")
	public Map<String, Object> modify(@RequestBody ManagerDTO dto) {
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "관리자 정보가 수정되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "관리자 정보 수정에 실패했습니다.");
		}
		return map;
	}
}

