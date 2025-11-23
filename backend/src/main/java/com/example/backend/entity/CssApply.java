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
@Table(name = "CSS_APPLY1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "CSS_APPLY1_SEQ_GEN", sequenceName = "SEQ_CSS_APPLY1", allocationSize = 1)
public class CssApply {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "CSS_APPLY1_SEQ_GEN")
	@Column(name = "APPLY_SEQ")
	private Integer applySeq;  // 적용 설정 번호 (PK, 시퀀스)
	
	@Column(name = "SET_SEQ")
	private Integer setSeq;  // 적용할 스타일셋 번호 (FK)
	
	@Column(name = "APPLY_SCOPE")
	private String applyScope;  // 적용 범위 (FULL: 전체, MEMBER: 회원만, IMAGEBOARD: 이미지보드만, HEADER_FOOTER: 헤더/푸터만, IMAGEBOARD_MEMBER: 게시판/회원만)
	
	@Column(name = "IS_ACTIVE")
	private String isActive;  // 활성화 여부 (Y: 활성, N: 비활성)
	
	@Temporal(TemporalType.DATE)
	@Column(name = "APPLIED_DATE")
	private Date appliedDate;  // 적용일시
}

