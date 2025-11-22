package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.MemberDAO;
import com.example.backend.dto.MemberDTO;
import com.example.backend.entity.Member;


@Service
public class MemberService {
	@Autowired
	MemberDAO dao;
	
	public Member login(String id, String pwd) {
		return dao.login(id, pwd);
	}
	public int write(MemberDTO dto) {
		return dao.write(dto);
	}
	public boolean isExistId(String id) {
		return dao.isExistId(id);
	}
	public Member getMember(String id) {
		return dao.getMember(id);
	}
	public int modify(MemberDTO dto) {
		return dao.modify(dto);
	}
	
	public java.util.List<Member> getAllMembers(int startNum, int endNum) {
		return dao.getAllMembers(startNum, endNum);
	}
	
	public java.util.List<Member> searchMembers(String keyword, int startNum, int endNum) {
		return dao.searchMembers(keyword, startNum, endNum);
	}
	
	public long getTotalCount() {
		return dao.getTotalCount();
	}
	
	public long getSearchCount(String keyword) {
		return dao.getSearchCount(keyword);
	}
	
	public int deleteMember(String id) {
		return dao.deleteMember(id);
	}
	
	public int suspendMember(String id, java.util.Date startDate, java.util.Date endDate, String reason) {
		return dao.suspendMember(id, startDate, endDate, reason);
	}
	
	public int unsuspendMember(String id) {
		return dao.unsuspendMember(id);
	}
}
