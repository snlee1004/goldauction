package com.example.backend.dao;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.BoardNoticeSettingDTO;
import com.example.backend.entity.BoardNoticeSetting;
import com.example.backend.repository.BoardNoticeSettingRepository;

@Repository
public class BoardNoticeSettingDAO {
	@Autowired
	BoardNoticeSettingRepository boardNoticeSettingRepository;
	
	// 공지사항 설정 조회
	public BoardNoticeSetting getSetting(Long boardSeq) {
		return boardNoticeSettingRepository.findById(boardSeq).orElse(null);
	}
	
	// 공지사항 설정 저장/수정 => 1:성공, 0:실패
	public int save(BoardNoticeSettingDTO dto) {
		try {
			// 기본값 설정
			if(dto.getNoticeDisplayCount() == null) {
				dto.setNoticeDisplayCount(5);
			}
			if(dto.getUpdatedDate() == null) {
				dto.setUpdatedDate(new Date());
			}
			
			BoardNoticeSetting setting = boardNoticeSettingRepository.save(dto.toEntity());
			return setting != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
}

