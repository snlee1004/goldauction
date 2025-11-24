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
@Table(name = "BOARD_NOTIFICATION1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "BOARD_NOTIFICATION_SEQ_GENERATOR", sequenceName = "SEQ_BOARD_NOTIFICATION1", allocationSize = 1)
public class BoardNotification {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "BOARD_NOTIFICATION_SEQ_GENERATOR")
	@Column(name = "NOTIFICATION_SEQ")
	private Long notificationSeq;  // 알림 번호 (PK, 시퀀스)
	
	@Column(name = "MEMBER_ID", nullable = false, length = 50)
	private String memberId;  // 회원 ID (FK -> MEMBER1.ID)
	
	@Column(name = "NOTIFICATION_TYPE", nullable = false, length = 20)
	private String notificationType;  // 알림 타입 (게시글댓글/게시글좋아요/댓글댓글 등)
	
	@Column(name = "RELATED_POST_SEQ")
	private Long relatedPostSeq;  // 관련 게시글 번호 (FK -> BOARD_POST1.POST_SEQ)
	
	@Column(name = "RELATED_COMMENT_SEQ")
	private Long relatedCommentSeq;  // 관련 댓글 번호 (FK -> BOARD_COMMENT1.COMMENT_SEQ)
	
	@Column(name = "NOTIFICATION_CONTENT", length = 500)
	private String notificationContent;  // 알림 내용
	
	@Column(name = "IS_READ", length = 1)
	private String isRead;  // 읽음 여부 (Y: 읽음, N: 안읽음)
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일
}

