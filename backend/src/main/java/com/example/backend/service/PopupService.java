package com.example.backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.PopupDAO;
import com.example.backend.dto.PopupDTO;
import com.example.backend.entity.Popup;

@Service
public class PopupService {
	@Autowired
	PopupDAO dao;
	
	public Popup save(PopupDTO dto) {
		if(dto.getLogtime() == null) {
			dto.setLogtime(new Date());
		}
		return dao.save(dto);
	}
	
	public List<Popup> getAllPopups() {
		return dao.getAllPopups();
	}
	
	public Popup getPopup(int popupSeq) {
		return dao.getPopup(popupSeq);
	}
	
	public List<Popup> getVisiblePopups() {
		return dao.getVisiblePopups();
	}
	
	public int deletePopup(int popupSeq) {
		return dao.deletePopup(popupSeq);
	}
	
	public int updateVisibility(int popupSeq, String isVisible) {
		return dao.updateVisibility(popupSeq, isVisible);
	}
}

