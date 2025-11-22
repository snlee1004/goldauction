package com.example.backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MANAGER1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Manager {
	@Id
	@Column(name = "MANAGER_ID")
	private String managerId;  // 관리자 ID (PK)
	
	@Column(name = "MANAGER_NAME")
	private String managerName;  // 관리자 이름
	
	@Column(name = "MANAGER_PWD")
	private String managerPwd;  // 비밀번호
	
	@Column(name = "MANAGER_EMAIL")
	private String managerEmail;  // 이메일
	
	@Column(name = "MANAGER_TEL")
	private String managerTel;  // 전화번호
	
	@Column(name = "MANAGER_ROLE")
	private String managerRole;  // 권한 (관리자, 슈퍼관리자)
	
	@Temporal(TemporalType.DATE)
	@Column(name = "LOGTIME")
	private Date logtime;  // 등록일시
	
	@Temporal(TemporalType.DATE)
	@Column(name = "LAST_LOGIN")
	private Date lastLogin;  // 마지막 로그인 시간
}

