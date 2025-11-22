package com.example.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String>{
	// 로그인 처리 : 아이디와 비밀번호로 조회
	Member findByIdAndPwd(String id, String pwd);
	
	// 전체 회원 목록 조회 (페이징)
	Page<Member> findAll(Pageable pageable);
	
	// 회원 검색 (이름, 아이디, 닉네임)
	@Query("SELECT m FROM Member m WHERE m.name LIKE %:keyword% OR m.id LIKE %:keyword% OR m.nickname LIKE %:keyword%")
	Page<Member> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
