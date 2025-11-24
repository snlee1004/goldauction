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
@Table(name = "BOARD_NOTICE_SETTING1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardNoticeSetting {
	@Id
	@Column(name = "BOARD_SEQ")
	private Long boardSeq;  // 게시판 번호 (PK, FK -> BOARD1.BOARD_SEQ)
	
	@Column(name = "NOTICE_DISPLAY_COUNT")
	private Integer noticeDisplayCount;  // 상단 노출 공지사항 개수
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPDATED_DATE")
	private Date updatedDate;  // 수정일
}

