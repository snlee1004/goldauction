package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.ManagerDAO;
import com.example.backend.dto.ManagerDTO;
import com.example.backend.entity.Manager;

@Service
public class ManagerService {
	@Autowired
	ManagerDAO dao;
	
	public Manager login(String managerId, String managerPwd) {
		return dao.login(managerId, managerPwd);
	}
	
	public Manager getManager(String managerId) {
		return dao.getManager(managerId);
	}
	
	public int modify(ManagerDTO dto) {
		return dao.modify(dto);
	}
}

