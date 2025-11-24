package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.BoardNoticeSettingDAO;
import com.example.backend.dto.BoardNoticeSettingDTO;
import com.example.backend.entity.BoardNoticeSetting;

@Service
public class BoardNoticeSettingService {
	@Autowired
	BoardNoticeSettingDAO dao;
	
	// 공지사항 설정 조회
	public BoardNoticeSetting getSetting(Long boardSeq) {
		return dao.getSetting(boardSeq);
	}
	
	// 공지사항 설정 저장/수정
	public int save(BoardNoticeSettingDTO dto) {
		return dao.save(dto);
	}
}

