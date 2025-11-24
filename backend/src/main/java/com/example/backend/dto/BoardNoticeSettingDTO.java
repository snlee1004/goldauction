package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.BoardNoticeSetting;

import lombok.Data;

@Data
public class BoardNoticeSettingDTO {
	private Long boardSeq;  // 게시판 번호
	private Integer noticeDisplayCount;  // 상단 노출 공지사항 개수
	private Date updatedDate;  // 수정일
	
	public BoardNoticeSetting toEntity() {
		return new BoardNoticeSetting(boardSeq, noticeDisplayCount, updatedDate);
	}
}

