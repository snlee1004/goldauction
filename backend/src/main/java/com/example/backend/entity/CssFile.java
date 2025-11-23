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
@Table(name = "CSS_FILE1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "CSS_FILE1_SEQ_GEN", sequenceName = "SEQ_CSS_FILE1", allocationSize = 1)
public class CssFile {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "CSS_FILE1_SEQ_GEN")
	@Column(name = "FILE_SEQ")
	private Integer fileSeq;  // CSS 파일 번호 (PK, 시퀀스)
	
	@Column(name = "SET_SEQ")
	private Integer setSeq;  // 스타일셋 번호 (FK)
	
	@Column(name = "FILE_NAME")
	private String fileName;  // CSS 파일명 (imageboard, member, header, footer)
	
	@Column(name = "CSS_CONTENT", columnDefinition = "CLOB")
	private String cssContent;  // CSS 코드 내용
	
	@Column(name = "FILE_TYPE")
	private String fileType;  // 파일 타입 (imageboard, member, header, footer)
	
	@Temporal(TemporalType.DATE)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일시
	
	@Temporal(TemporalType.DATE)
	@Column(name = "MODIFIED_DATE")
	private Date modifiedDate;  // 수정일시
}

