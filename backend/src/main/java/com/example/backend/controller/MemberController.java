package com.example.backend.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.backend.dto.MemberDTO;
import com.example.backend.entity.Member;
import com.example.backend.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class MemberController {
	@Autowired
	MemberService service;
	
	// http://localhost:8080/index
	@GetMapping("/index")
	public String index() {
		// 1. 데이터 처리
		// 2. 데이터 공유
		// 3. view 파일명 리턴
		return "/main/index";  // /main/index.html
	}
	
	// http://localhost:8080/member/loginForm
	@GetMapping("/member/loginForm")
	public String loginForm() {
		// 1. 데이터 처리
		// 2. 데이터 공유
		// 3. view 파일명 리턴
		return "/member/loginForm";  // /member/loginForm.html
	}
	
	// http://localhost:8080/member/login
	@PostMapping("/member/login")
	public String login(HttpServletRequest request, 
						HttpSession session) {
		// 1. 데이터 처리
		String id = request.getParameter("id");
		String pwd = request.getParameter("pwd");
		// db 작업
		String name = service.login(id, pwd);
		
		// 2. 데이터 공유
		// 3. view 파일명 리턴
		if(name != null) { // 로그인 성공
			// 세션에 공유데이터 저장하기
			session.setAttribute("memName", name);
			session.setAttribute("memId", id);
			return "/member/loginOK";	 // /member/loginOK.html		
		} else {		   // 로그인 실패
			return "/member/loginFail";  // /member/loginFail.html
		}		
	}
	
	// http://localhost:8080/member/logout
	@GetMapping("/member/logout")
	public String logout(HttpSession session) {
		// 1. 데이터 처리
		// 세션 삭제
		session.removeAttribute("memName");
		session.removeAttribute("memId");
		// 2. 데이터 공유
		// 3. view 파일명 리턴
		return "/member/logout";  // /member/logout.html
	}
	
	// http://localhost:8080/member/writeForm
	@GetMapping("/member/writeForm")
	public String writeForm() {
		// 1. 데이터 처리
		// 2. 데이터 공유
		// 3. view 파일명 리턴
		return "/member/writeForm";  // /member/writeForm.html
	}
	
	// http://localhost:8080/member/write
	@PostMapping("/member/write")
	public String write(MemberDTO dto, Model model) {
		// 1. 데이터 처리
		System.out.println("dto = " + dto);		
		dto.setLogtime(new Date());
		// db 저장
		int result = service.write(dto);
		
		// 2. 데이터 공유
		model.addAttribute("result", result);
		// 3. view 파일명 리턴
		return "/member/write";  // /member/write.html
	}
	
	// http://localhost:8080/member/checkId
	@GetMapping("/member/checkId")
	public String checkId(HttpServletRequest request, Model model) {
		// 1. 데이터 처리
		String id = request.getParameter("id");
		// db 작업
		boolean isExist = service.isExistId(id);
		// 2. 데이터 공유
		model.addAttribute("id", id);
		model.addAttribute("isExist", isExist);
		// 3. view 파일명 리턴
		return "/member/checkId";  // /member/checkId.html
	}
	
	// http://localhost:8080/member/modifyForm
	@GetMapping("/member/modifyForm")
	public String modifyForm(Model model, HttpSession session) {
		// 1. 데이터 처리
		String id = (String) session.getAttribute("memId");
		// db
		Member member = service.getMember(id);
		// 2. 데이터 공유
		model.addAttribute("member", member);
		// 3. view 파일명 리턴
		return "/member/modifyForm";  // /member/modifyForm.html
	}
	
	// http://localhost:8080/member/modify
	@PostMapping("/member/modify")
	public String modify(MemberDTO dto, Model model) {
		// 1. 데이터 처리		
		System.out.println("dto = " + dto);		
		// db
		int result = service.modify(dto);
		
		// 2. 데이터 공유
		model.addAttribute("result", result);
		// 3. view 파일명 리턴
		return "/member/modify";  // /member/modify.html
	}
}
// 1. 데이터 처리
// 2. 데이터 공유
// 3. view 파일명 리턴
