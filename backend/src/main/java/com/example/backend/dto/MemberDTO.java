package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.Member;

import lombok.Data;

@Data // getter, setter, toString이 자동으로 생성된다.
public class MemberDTO {
	private String name;
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
	private Date logtime;
	
	public Member toEntity() {
		return new Member(name, id, nickname, pwd, gender, email1, email2, 
						  tel1, tel2, tel3, addr, logtime);
	}
}
