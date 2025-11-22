package com.example.backend.dao;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.PopupDTO;
import com.example.backend.entity.Popup;
import com.example.backend.repository.PopupRepository;

@Repository
public class PopupDAO {
	@Autowired
	PopupRepository popupRepository;
	
	// 팝업 저장
	public Popup save(PopupDTO dto) {
		try {
			System.out.println("PopupDAO.save 호출 - popupSeq: " + dto.getPopupSeq() + ", title: " + dto.getPopupTitle());
			Popup entity = dto.toEntity();
			System.out.println("엔티티 생성 완료 - popupSeq: " + entity.getPopupSeq());
			Popup result = popupRepository.save(entity);
			System.out.println("DB 저장 완료 - popupSeq: " + result.getPopupSeq());
			return result;
		} catch(Exception e) {
			System.err.println("PopupDAO.save 오류: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}
	
	// 팝업 목록 조회
	public List<Popup> getAllPopups() {
		return popupRepository.findAll();
	}
	
	// 팝업 조회
	public Popup getPopup(int popupSeq) {
		return popupRepository.findById(popupSeq).orElse(null);
	}
	
	// 노출 중인 팝업 조회 (날짜 비교 포함)
	public List<Popup> getVisiblePopups() {
		// 현재 날짜 (시간 제거)
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		Date today = cal.getTime();
		
		// 노출 여부가 'Y'인 팝업 조회
		List<Popup> visiblePopups = popupRepository.findByIsVisibleOrderByPopupSeq("Y");
		
		// 날짜 범위 확인하여 필터링
		return visiblePopups.stream()
			.filter(popup -> {
				// 시작일이 없거나 오늘 이전/같은 경우
				boolean startOk = popup.getStartDate() == null || 
								  popup.getStartDate().compareTo(today) <= 0;
				// 종료일이 없거나 오늘 이후/같은 경우
				boolean endOk = popup.getEndDate() == null || 
								popup.getEndDate().compareTo(today) >= 0;
				return startOk && endOk;
			})
			.collect(Collectors.toList());
	}
	
	// 팝업 삭제
	public int deletePopup(int popupSeq) {
		try {
			popupRepository.deleteById(popupSeq);
			return 1;
		} catch(Exception e) {
			return 0;
		}
	}
	
	// 팝업 노출 상태 변경
	public int updateVisibility(int popupSeq, String isVisible) {
		Popup popup = popupRepository.findById(popupSeq).orElse(null);
		if(popup != null) {
			popup.setIsVisible(isVisible);
			Popup result = popupRepository.save(popup);
			return result != null ? 1 : 0;
		}
		return 0;
	}
}

