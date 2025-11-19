package com.example.backend.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.MemberDTO;
import com.example.backend.entity.Member;
import com.example.backend.service.MemberService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class MemberController {
	@Autowired
	MemberService service;
	
	@PostMapping("/member/login")
	public Map<String, Object> login(@RequestBody Map<String, String> params) {
		String id = params.get("id");
		String pwd = params.get("pwd");
		
		Member member = service.login(id, pwd);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(member != null) {
			map.put("rt", "OK");
			map.put("name", member.getName());
			map.put("nickname", member.getNickname());
			map.put("id", id);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "아이디 또는 비밀번호가 일치하지 않습니다.");
		}
		return map;
	}
	
	@PostMapping("/member/write")
	public Map<String, Object> write(@RequestBody MemberDTO dto) {
		System.out.println("dto = " + dto);
		
		dto.setLogtime(new Date());
		int result = service.write(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "이미 존재하는 아이디입니다.");
		}
		return map;
	}
	
	@GetMapping("/member/checkId")
	public Map<String, Object> checkId(@RequestParam("id") String id) {
		boolean isExist = service.isExistId(id);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("id", id);
		map.put("isExist", isExist);
		return map;
	}
	
	@GetMapping("/member/getMember")
	public Map<String, Object> getMember(@RequestParam("id") String id) {
		Member member = service.getMember(id);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(member != null) {
			map.put("rt", "OK");
			map.put("member", member);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "회원정보를 찾을 수 없습니다.");
		}
		return map;
	}
	
	@PostMapping("/member/modify")
	public Map<String, Object> modify(@RequestBody MemberDTO dto) {
		System.out.println("dto = " + dto);
		
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "회원정보 수정에 실패했습니다.");
		}
		return map;
	}
	
	@GetMapping("/member/logout")
	public Map<String, Object> logout() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		return map;
	}
}

