package com.example.backend.entity;

import java.util.Date;

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
	private String name;
	@Id
	private String id;
	private String nickname;  // 닉네임 필드 추가
	private String pwd;
	private String gender;
	private String email1;
	private String email2;
	private String tel1;
	private String tel2;
	private String tel3;
	private String addr;
	@Temporal(TemporalType.DATE)  // 년월일 저장 설정
	private Date logtime;
}
