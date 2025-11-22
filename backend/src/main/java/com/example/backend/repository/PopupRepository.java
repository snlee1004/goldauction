package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Popup;

public interface PopupRepository extends JpaRepository<Popup, Integer> {
	// 노출 여부별 조회 (날짜 비교는 Service 레벨에서 처리)
	List<Popup> findByIsVisibleOrderByPopupSeq(String isVisible);
	
	// 팝업 타입별 조회
	List<Popup> findByPopupType(String popupType);
	
	// 노출 여부별 조회
	List<Popup> findByIsVisible(String isVisible);
}

