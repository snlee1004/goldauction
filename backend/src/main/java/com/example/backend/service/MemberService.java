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
	
	public String login(String id, String pwd) {
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
}
