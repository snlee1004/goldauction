package com.example.backend.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.MemberDTO;
import com.example.backend.entity.Member;
import com.example.backend.service.MemberService;

@RestController
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
			// 계정 정지 여부 확인
			if("Y".equals(member.getIsSuspended())) {
				// 정지 종료일 확인
				Date today = new Date();
				Date endDate = member.getSuspendEndDate();
				
				if(endDate != null && endDate.after(today)) {
					// 아직 정지 기간 중
					map.put("rt", "SUSPENDED");
					map.put("msg", "계정이 정지되었습니다.");
					map.put("suspendEndDate", member.getSuspendEndDate());
					map.put("suspendReason", member.getSuspendReason());
					return map;
				} else if(endDate != null && endDate.before(today)) {
					// 정지 기간이 만료됨 - 자동 해제
					service.unsuspendMember(id);
					member = service.getMember(id);  // 업데이트된 정보 다시 조회
				}
			}
			
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
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			System.out.println("회원정보 조회 시작 - id: " + id);
			Member member = service.getMember(id);
			
			if(member != null) {
				map.put("rt", "OK");
				map.put("member", member);
				System.out.println("회원정보 조회 완료 - name: " + member.getName());
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "회원정보를 찾을 수 없습니다.");
				System.out.println("회원정보를 찾을 수 없음 - id: " + id);
			}
		} catch(Exception e) {
			System.err.println("회원정보 조회 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "회원정보 조회 중 오류가 발생했습니다: " + e.getMessage());
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
	
	// 관리자용: 회원 목록 조회 (페이징)
	@GetMapping("/membercontrol/list")
	public Map<String, Object> memberList(
			@RequestParam(value="pg", defaultValue="1") int pg,
			@RequestParam(value="keyword", required=false) String keyword) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			int pageSize = 10;  // 한 페이지에 표시할 회원 수
			int startNum = (pg - 1) * pageSize + 1;
			int endNum = pg * pageSize;
			
			List<Member> memberList;
			long totalCount;
			
			if(keyword != null && !keyword.trim().isEmpty()) {
				// 검색
				memberList = service.searchMembers(keyword, startNum, endNum);
				totalCount = service.getSearchCount(keyword);
			} else {
				// 전체 목록
				memberList = service.getAllMembers(startNum, endNum);
				totalCount = service.getTotalCount();
			}
			
			// 회원 정보를 Map으로 변환
			List<Map<String, Object>> items = new ArrayList<>();
			for(Member member : memberList) {
				Map<String, Object> item = new HashMap<>();
				item.put("id", member.getId());
				item.put("name", member.getName());
				item.put("nickname", member.getNickname());
				item.put("gender", member.getGender());
				item.put("email1", member.getEmail1());
				item.put("email2", member.getEmail2());
				item.put("tel1", member.getTel1());
				item.put("tel2", member.getTel2());
				item.put("tel3", member.getTel3());
				item.put("addr", member.getAddr());
				item.put("logtime", member.getLogtime());
				item.put("isSuspended", member.getIsSuspended());
				item.put("suspendStartDate", member.getSuspendStartDate());
				item.put("suspendEndDate", member.getSuspendEndDate());
				item.put("suspendReason", member.getSuspendReason());
				items.add(item);
			}
			
			map.put("rt", "OK");
			map.put("items", items);
			map.put("total", totalCount);
			map.put("pg", pg);
		} catch(Exception e) {
			System.err.println("회원 목록 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "회원 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 관리자용: 회원 삭제
	@PostMapping("/membercontrol/delete")
	public Map<String, Object> deleteMember(@RequestBody Map<String, String> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String id = params.get("id");
			int result = service.deleteMember(id);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "회원이 삭제되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "회원 삭제에 실패했습니다.");
			}
		} catch(Exception e) {
			System.err.println("회원 삭제 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "회원 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 관리자용: 계정 정지 설정
	@PostMapping("/membercontrol/suspend")
	public Map<String, Object> suspendMember(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String id = params.get("id").toString();
			int suspendDays = Integer.parseInt(params.get("suspendDays").toString());
			String reason = params.get("reason") != null ? params.get("reason").toString() : "";
			
			// 정지 시작일 (오늘)
			Date startDate = new Date();
			
			// 정지 종료일 계산
			Calendar cal = Calendar.getInstance();
			cal.setTime(startDate);
			cal.add(Calendar.DAY_OF_MONTH, suspendDays);
			Date endDate = cal.getTime();
			
			int result = service.suspendMember(id, startDate, endDate, reason);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "계정이 정지되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "계정 정지에 실패했습니다.");
			}
		} catch(Exception e) {
			System.err.println("계정 정지 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "계정 정지 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 관리자용: 계정 정지 해제
	@PostMapping("/membercontrol/unsuspend")
	public Map<String, Object> unsuspendMember(@RequestBody Map<String, String> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String id = params.get("id");
			int result = service.unsuspendMember(id);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "계정 정지가 해제되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "계정 정지 해제에 실패했습니다.");
			}
		} catch(Exception e) {
			System.err.println("계정 정지 해제 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "계정 정지 해제 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 관리자용: 회원 정보 수정
	@PostMapping("/membercontrol/modify")
	public Map<String, Object> modifyMember(@RequestBody MemberDTO dto) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			int result = service.modify(dto);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "회원 정보가 수정되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "회원 정보 수정에 실패했습니다.");
			}
		} catch(Exception e) {
			System.err.println("회원 정보 수정 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "회원 정보 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
}

