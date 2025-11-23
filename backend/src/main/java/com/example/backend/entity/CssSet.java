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
@Table(name = "CSS_SET1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "CSS_SET1_SEQ_GEN", sequenceName = "SEQ_CSS_SET1", allocationSize = 1)
public class CssSet {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "CSS_SET1_SEQ_GEN")
	@Column(name = "SET_SEQ")
	private Integer setSeq;  // 스타일셋 번호 (PK, 시퀀스)
	
	@Column(name = "SET_NAME")
	private String setName;  // 스타일셋 이름 (예: default_set, GA_CSS_set1, cssset_1)
	
	@Column(name = "SET_DESCRIPTION")
	private String setDescription;  // 스타일셋 설명
	
	@Column(name = "IS_ACTIVE")
	private String isActive;  // 활성화 여부 (Y: 활성, N: 비활성)
	
	@Temporal(TemporalType.DATE)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일시
	
	@Temporal(TemporalType.DATE)
	@Column(name = "MODIFIED_DATE")
	private Date modifiedDate;  // 수정일시
}

