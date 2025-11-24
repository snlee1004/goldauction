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
@Table(name = "BOARD_POST1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "BOARD_POST_SEQ_GENERATOR", sequenceName = "SEQ_BOARD_POST1", allocationSize = 1)
public class BoardPost {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "BOARD_POST_SEQ_GENERATOR")
	@Column(name = "POST_SEQ")
	private Long postSeq;  // 게시글 번호 (PK, 시퀀스)
	
	@Column(name = "BOARD_SEQ", nullable = false)
	private Long boardSeq;  // 게시판 번호 (FK -> BOARD1.BOARD_SEQ)
	
	@Column(name = "MEMBER_ID", nullable = false, length = 50)
	private String memberId;  // 작성자 ID (FK -> MEMBER1.ID)
	
	@Column(name = "POST_TITLE", nullable = false, length = 200)
	private String postTitle;  // 제목
	
	@Column(name = "POST_CONTENT", columnDefinition = "CLOB")
	private String postContent;  // 내용
	
	@Column(name = "IS_NOTICE", length = 1)
	private String isNotice;  // 공지사항 여부 (Y: 공지사항, N: 일반)
	
	@Column(name = "NOTICE_ORDER")
	private Integer noticeOrder;  // 공지사항 순서 (0: 일반 게시글)
	
	@Column(name = "VIEW_COUNT")
	private Integer viewCount;  // 조회수
	
	@Column(name = "LIKE_COUNT")
	private Integer likeCount;  // 좋아요 수
	
	@Column(name = "IS_HIDDEN", length = 1)
	private String isHidden;  // 숨김 여부 (Y: 숨김, N: 표시)
	
	@Column(name = "IS_DELETED", length = 1)
	private String isDeleted;  // 삭제 여부 (Y: 삭제, N: 정상)
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 작성일
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPDATED_DATE")
	private Date updatedDate;  // 수정일
}

