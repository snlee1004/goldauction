package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.ProfanityFilter;

import lombok.Data;

@Data
public class ProfanityFilterDTO {
	private Long filterSeq;  // 필터 번호
	private String profanityWord;  // 비속어
	private String replacementWord;  // 대체어
	private String isActive;  // 활성화 여부
	private String filterType;  // 필터 타입
	private Date createdDate;  // 생성일
	private Date updatedDate;  // 수정일
	
	public ProfanityFilter toEntity() {
		return new ProfanityFilter(filterSeq, profanityWord, replacementWord,
								 isActive, filterType, createdDate, updatedDate);
	}
}

