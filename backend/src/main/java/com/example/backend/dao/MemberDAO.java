package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.MemberDTO;
import com.example.backend.entity.Member;
import com.example.backend.repository.MemberRepository;


@Repository
public class MemberDAO {
	@Autowired
	MemberRepository memberRepository;
	
	// 로그인 처리 => 로그인 성공 : Member 엔티티 리턴, 로그인 실패 : null 리턴
	public Member login(String id, String pwd) {
		Member member = memberRepository.findByIdAndPwd(id, pwd);
		return member;
	}
	// 회원정보 저장 => 1:저장성공, 0:저장실패
	public int write(MemberDTO dto) {
		// 기존 데이터 확인
		boolean is_member = memberRepository.existsById(dto.getId());
		int result = 0;
		if(!is_member) {  // 아이디가 존재하지 않으면, 저장
			Member member = memberRepository.save(dto.toEntity());
			if(member != null) result = 1;
		}
		return result;
	}
	// 아이디 확인 : findById() => entity, existById() => boolean
	// => 존재하면 true 리턴, 존재하지 않으면 false 리턴
	public boolean isExistId(String id) {
		return memberRepository.existsById(id);
	}
	// 1명 회원정보 읽어오기
	public Member getMember(String id) {
		return memberRepository.findById(id).orElse(null);
	}
	// 1명 회원정보 수정하기 => 1:수정성공, 0:수정실패
	public int modify(MemberDTO dto) {
		// 기존 데이터 가져오기
		Member member = memberRepository.findById(dto.getId()).orElse(null);
		int result = 0;
		if(member != null) {
			// 회원가입일 데이터 저장
			dto.setLogtime(member.getLogtime());
			// 수정내용 저장
			Member member_result = memberRepository.save(dto.toEntity());
			// 결과값
			if(member_result != null) result = 1;
		}
		return result;
	}
}










