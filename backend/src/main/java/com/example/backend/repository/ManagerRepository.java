package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Manager;

public interface ManagerRepository extends JpaRepository<Manager, String> {
	// 로그인 처리: 관리자 ID와 비밀번호로 조회
	Manager findByManagerIdAndManagerPwd(String managerId, String managerPwd);
}

