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
@Table(name = "MEMBER1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Member {
	@Column(name = "NAME")
	private String name;
	@Id
	@Column(name = "ID")
	private String id;
	@Column(name = "NICKNAME")
	private String nickname;  // 닉네임 필드 추가
	@Column(name = "PWD")
	private String pwd;
	@Column(name = "GENDER")
	private String gender;
	@Column(name = "EMAIL1")
	private String email1;
	@Column(name = "EMAIL2")
	private String email2;
	@Column(name = "TEL1")
	private String tel1;
	@Column(name = "TEL2")
	private String tel2;
	@Column(name = "TEL3")
	private String tel3;
	@Column(name = "ADDR")
	private String addr;
	@Temporal(TemporalType.DATE)  // 년월일 저장 설정
	@Column(name = "LOGTIME")
	private Date logtime;
	
	@Column(name = "IS_SUSPENDED")
	private String isSuspended;  // 계정 정지 여부 (Y: 정지, N: 정상)
	
	@Temporal(TemporalType.DATE)
	@Column(name = "SUSPEND_START_DATE")
	private Date suspendStartDate;  // 정지 시작일
	
	@Temporal(TemporalType.DATE)
	@Column(name = "SUSPEND_END_DATE")
	private Date suspendEndDate;  // 정지 종료일
	
	@Column(name = "SUSPEND_REASON")
	private String suspendReason;  // 정지 사유
}
