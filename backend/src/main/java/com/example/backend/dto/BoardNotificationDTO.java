package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.BoardNotification;

import lombok.Data;

@Data
public class BoardNotificationDTO {
	private Long notificationSeq;  // 알림 번호
	private String memberId;  // 회원 ID
	private String notificationType;  // 알림 타입
	private Long relatedPostSeq;  // 관련 게시글 번호
	private Long relatedCommentSeq;  // 관련 댓글 번호
	private String notificationContent;  // 알림 내용
	private String isRead;  // 읽음 여부
	private Date createdDate;  // 생성일
	
	public BoardNotification toEntity() {
		return new BoardNotification(notificationSeq, memberId, notificationType,
									relatedPostSeq, relatedCommentSeq, notificationContent,
									isRead, createdDate);
	}
}

