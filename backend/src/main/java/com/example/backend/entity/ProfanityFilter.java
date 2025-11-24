package com.example.backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PROFANITY_FILTER1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "PROFANITY_FILTER_SEQ_GENERATOR", sequenceName = "SEQ_PROFANITY_FILTER1", allocationSize = 1)
public class ProfanityFilter {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "PROFANITY_FILTER_SEQ_GENERATOR")
	@Column(name = "FILTER_SEQ")
	private Long filterSeq;  // 필터 번호 (PK, 시퀀스)
	
	@Column(name = "PROFANITY_WORD", nullable = false, length = 100)
	private String profanityWord;  // 비속어
	
	@Column(name = "REPLACEMENT_WORD", length = 100)
	private String replacementWord;  // 대체어 (선택사항, NULL: 작성 불가)
	
	@Column(name = "IS_ACTIVE", length = 1)
	private String isActive;  // 활성화 여부 (Y: 활성, N: 비활성)
	
	@Column(name = "FILTER_TYPE", length = 20)
	private String filterType;  // 필터 타입 (마스킹/작성불가)
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPDATED_DATE")
	private Date updatedDate;  // 수정일
}

