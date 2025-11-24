package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.BoardNotificationDTO;
import com.example.backend.entity.BoardNotification;
import com.example.backend.repository.BoardNotificationRepository;

@Repository
public class BoardNotificationDAO {
	@Autowired
	BoardNotificationRepository boardNotificationRepository;
	
	// 알림 생성 => 1:생성성공, 0:생성실패
	public int create(BoardNotificationDTO dto) {
		try {
			// 기본값 설정
			if(dto.getIsRead() == null || dto.getIsRead().isEmpty()) {
				dto.setIsRead("N");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			BoardNotification notification = boardNotificationRepository.save(dto.toEntity());
			return notification != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 회원별 알림 목록 조회
	public List<BoardNotification> getNotificationList(String memberId) {
		return boardNotificationRepository.findByMemberIdOrderByCreatedDateDesc(memberId);
	}
	
	// 회원별 안읽은 알림 목록 조회
	public List<BoardNotification> getUnreadNotificationList(String memberId) {
		return boardNotificationRepository.findByMemberIdAndIsReadOrderByCreatedDateDesc(memberId, "N");
	}
	
	// 회원별 안읽은 알림 수 조회
	public long getUnreadCount(String memberId) {
		return boardNotificationRepository.countByMemberIdAndIsRead(memberId, "N");
	}
	
	// 알림 읽음 처리 => 1:성공, 0:실패
	public int markAsRead(Long notificationSeq) {
		try {
			BoardNotification notification = boardNotificationRepository.findById(notificationSeq).orElse(null);
			if(notification != null) {
				notification.setIsRead("Y");
				BoardNotification result = boardNotificationRepository.save(notification);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 회원의 모든 알림 읽음 처리 => 읽음 처리된 개수 반환
	public int markAllAsRead(String memberId) {
		try {
			List<BoardNotification> unreadNotifications = boardNotificationRepository.findByMemberIdAndIsReadOrderByCreatedDateDesc(memberId, "N");
			int count = 0;
			for(BoardNotification notification : unreadNotifications) {
				notification.setIsRead("Y");
				boardNotificationRepository.save(notification);
				count++;
			}
			return count;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 알림 삭제 => 1:삭제성공, 0:삭제실패
	public int delete(Long notificationSeq) {
		try {
			boardNotificationRepository.deleteById(notificationSeq);
			return 1;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
}

