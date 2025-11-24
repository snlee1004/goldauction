package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.BoardNotificationDAO;
import com.example.backend.dto.BoardNotificationDTO;
import com.example.backend.entity.BoardNotification;

@Service
public class BoardNotificationService {
	@Autowired
	BoardNotificationDAO dao;
	
	// 알림 생성
	public int create(BoardNotificationDTO dto) {
		return dao.create(dto);
	}
	
	// 회원별 알림 목록 조회
	public List<BoardNotification> getNotificationList(String memberId) {
		return dao.getNotificationList(memberId);
	}
	
	// 회원별 안읽은 알림 목록 조회
	public List<BoardNotification> getUnreadNotificationList(String memberId) {
		return dao.getUnreadNotificationList(memberId);
	}
	
	// 회원별 안읽은 알림 수 조회
	public long getUnreadCount(String memberId) {
		return dao.getUnreadCount(memberId);
	}
	
	// 알림 읽음 처리
	public int markAsRead(Long notificationSeq) {
		return dao.markAsRead(notificationSeq);
	}
	
	// 회원의 모든 알림 읽음 처리
	public int markAllAsRead(String memberId) {
		return dao.markAllAsRead(memberId);
	}
	
	// 알림 삭제
	public int delete(Long notificationSeq) {
		return dao.delete(notificationSeq);
	}
	
	// 댓글 작성 시 알림 생성
	public void createCommentNotification(Long postSeq, Long commentSeq, String postWriterId, String commentWriterId) {
		// 자신의 게시글에 자신이 댓글을 달면 알림 생성하지 않음
		if(postWriterId.equals(commentWriterId)) {
			return;
		}
		
		BoardNotificationDTO dto = new BoardNotificationDTO();
		dto.setMemberId(postWriterId);
		dto.setNotificationType("게시글댓글");
		dto.setRelatedPostSeq(postSeq);
		dto.setRelatedCommentSeq(commentSeq);
		dto.setNotificationContent("새로운 댓글이 작성되었습니다.");
		
		dao.create(dto);
	}
}

