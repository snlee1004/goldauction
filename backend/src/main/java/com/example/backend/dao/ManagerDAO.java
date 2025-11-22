package com.example.backend.dao;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.ManagerDTO;
import com.example.backend.entity.Manager;
import com.example.backend.repository.ManagerRepository;

@Repository
public class ManagerDAO {
	@Autowired
	ManagerRepository managerRepository;
	
	// 로그인 처리 => 로그인 성공: Manager 엔티티 리턴, 로그인 실패: null 리턴
	public Manager login(String managerId, String managerPwd) {
		Manager manager = managerRepository.findByManagerIdAndManagerPwd(managerId, managerPwd);
		if(manager != null) {
			// 마지막 로그인 시간 업데이트
			manager.setLastLogin(new Date());
			managerRepository.save(manager);
		}
		return manager;
	}
	
	// 관리자 정보 조회
	public Manager getManager(String managerId) {
		return managerRepository.findById(managerId).orElse(null);
	}
	
	// 관리자 정보 수정
	public int modify(ManagerDTO dto) {
		Manager manager = managerRepository.findById(dto.getManagerId()).orElse(null);
		int result = 0;
		if(manager != null) {
			// 등록일시 유지
			dto.setLogtime(manager.getLogtime());
			// 마지막 로그인 시간 유지
			dto.setLastLogin(manager.getLastLogin());
			Manager managerResult = managerRepository.save(dto.toEntity());
			if(managerResult != null) result = 1;
		}
		return result;
	}
}

