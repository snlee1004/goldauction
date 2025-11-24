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
@Table(name = "BOARD_COMMENT1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "BOARD_COMMENT_SEQ_GENERATOR", sequenceName = "SEQ_BOARD_COMMENT1", allocationSize = 1)
public class BoardComment {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "BOARD_COMMENT_SEQ_GENERATOR")
	@Column(name = "COMMENT_SEQ")
	private Long commentSeq;  // 댓글 번호 (PK, 시퀀스)
	
	@Column(name = "POST_SEQ", nullable = false)
	private Long postSeq;  // 게시글 번호 (FK -> BOARD_POST1.POST_SEQ)
	
	@Column(name = "MEMBER_ID", nullable = false, length = 50)
	private String memberId;  // 작성자 ID (FK -> MEMBER1.ID)
	
	@Column(name = "COMMENT_CONTENT", columnDefinition = "CLOB", nullable = false)
	private String commentContent;  // 댓글 내용
	
	@Column(name = "PARENT_COMMENT_SEQ")
	private Long parentCommentSeq;  // 부모 댓글 번호 (대댓글용, NULL: 일반 댓글)
	
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

