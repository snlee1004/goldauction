package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.Manager;

import lombok.Data;

@Data
public class ManagerDTO {
	private String managerId;
	private String managerName;
	private String managerPwd;
	private String managerEmail;
	private String managerTel;
	private String managerRole;
	private Date logtime;
	private Date lastLogin;
	
	public Manager toEntity() {
		return new Manager(managerId, managerName, managerPwd, managerEmail, 
						  managerTel, managerRole, logtime, lastLogin);
	}
}

