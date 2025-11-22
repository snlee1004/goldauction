package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
			// 비밀번호가 null이거나 비어있으면 기존 비밀번호 유지
			if(dto.getPwd() == null || dto.getPwd().trim().isEmpty()) {
				dto.setPwd(member.getPwd());
			}
			// 계정 정지 정보 유지 (수정 시 변경되지 않으면)
			if(dto.getIsSuspended() == null) {
				dto.setIsSuspended(member.getIsSuspended());
				dto.setSuspendStartDate(member.getSuspendStartDate());
				dto.setSuspendEndDate(member.getSuspendEndDate());
				dto.setSuspendReason(member.getSuspendReason());
			}
			// 수정내용 저장
			Member member_result = memberRepository.save(dto.toEntity());
			// 결과값
			if(member_result != null) result = 1;
		}
		return result;
	}
	
	// 전체 회원 목록 조회 (페이징)
	public List<Member> getAllMembers(int startNum, int endNum) {
		int pageSize = endNum - startNum + 1;
		int pageNum = (startNum - 1) / pageSize;
		Pageable pageable = PageRequest.of(pageNum, pageSize);
		Page<Member> page = memberRepository.findAll(pageable);
		return page.getContent();
	}
	
	// 회원 검색 (이름, 아이디, 닉네임)
	public List<Member> searchMembers(String keyword, int startNum, int endNum) {
		int pageSize = endNum - startNum + 1;
		int pageNum = (startNum - 1) / pageSize;
		Pageable pageable = PageRequest.of(pageNum, pageSize);
		Page<Member> page = memberRepository.findByKeyword(keyword, pageable);
		return page.getContent();
	}
	
	// 전체 회원 수 조회
	public long getTotalCount() {
		return memberRepository.count();
	}
	
	// 검색된 회원 수 조회
	public long getSearchCount(String keyword) {
		Pageable pageable = PageRequest.of(0, 1);
		Page<Member> page = memberRepository.findByKeyword(keyword, pageable);
		return page.getTotalElements();
	}
	
	// 회원 삭제
	public int deleteMember(String id) {
		try {
			memberRepository.deleteById(id);
			return 1;
		} catch(Exception e) {
			return 0;
		}
	}
	
	// 계정 정지 설정
	public int suspendMember(String id, Date startDate, Date endDate, String reason) {
		Member member = memberRepository.findById(id).orElse(null);
		if(member != null) {
			member.setIsSuspended("Y");
			member.setSuspendStartDate(startDate);
			member.setSuspendEndDate(endDate);
			member.setSuspendReason(reason);
			Member result = memberRepository.save(member);
			return result != null ? 1 : 0;
		}
		return 0;
	}
	
	// 계정 정지 해제
	public int unsuspendMember(String id) {
		Member member = memberRepository.findById(id).orElse(null);
		if(member != null) {
			member.setIsSuspended("N");
			member.setSuspendStartDate(null);
			member.setSuspendEndDate(null);
			member.setSuspendReason(null);
			Member result = memberRepository.save(member);
			return result != null ? 1 : 0;
		}
		return 0;
	}
}










