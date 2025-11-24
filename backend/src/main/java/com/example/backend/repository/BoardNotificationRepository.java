package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.BoardNotification;

public interface BoardNotificationRepository extends JpaRepository<BoardNotification, Long> {
	// 회원별 알림 목록 조회 (최신순)
	List<BoardNotification> findByMemberIdOrderByCreatedDateDesc(String memberId);
	
	// 회원별 안읽은 알림 목록 조회
	List<BoardNotification> findByMemberIdAndIsReadOrderByCreatedDateDesc(String memberId, String isRead);
	
	// 회원별 안읽은 알림 수 조회
	long countByMemberIdAndIsRead(String memberId, String isRead);
}

