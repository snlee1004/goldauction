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
@Table(name = "BOARD1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "BOARD_SEQ_GENERATOR", sequenceName = "SEQ_BOARD1", allocationSize = 1)
public class Board {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "BOARD_SEQ_GENERATOR")
	@Column(name = "BOARD_SEQ")
	private Long boardSeq;  // 게시판 번호 (PK, 시퀀스)
	
	@Column(name = "BOARD_NAME", nullable = false, length = 200)
	private String boardName;  // 게시판명
	
	@Column(name = "BOARD_DESCRIPTION", length = 500)
	private String boardDescription;  // 게시판 설명
	
	@Column(name = "BOARD_TYPE", nullable = false, length = 20)
	private String boardType;  // 게시판 타입 (일반/공구이벤트)
	
	@Column(name = "BOARD_CATEGORY", length = 50)
	private String boardCategory;  // 게시판 카테고리 (선택사항)
	
	@Column(name = "IS_ACTIVE", length = 1)
	private String isActive;  // 활성화 여부 (Y: 활성, N: 비활성)
	
	@Column(name = "DISPLAY_ORDER")
	private Integer displayOrder;  // 표시 순서
	
	@Column(name = "NOTICE_DISPLAY_COUNT")
	private Integer noticeDisplayCount;  // 상단 노출 공지사항 개수 (기본값: 5)
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPDATED_DATE")
	private Date updatedDate;  // 수정일
}

