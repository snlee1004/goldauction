package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.Board;

import lombok.Data;

@Data
public class BoardDTO {
	private Long boardSeq;  // 게시판 번호
	private String boardName;  // 게시판명
	private String boardDescription;  // 게시판 설명
	private String boardType;  // 게시판 타입 (일반/공구이벤트)
	private String boardCategory;  // 게시판 카테고리
	private String isActive;  // 활성화 여부 (Y: 활성, N: 비활성)
	private Integer displayOrder;  // 표시 순서
	private Integer noticeDisplayCount;  // 상단 노출 공지사항 개수
	private Date createdDate;  // 생성일
	private Date updatedDate;  // 수정일
	
	public Board toEntity() {
		return new Board(boardSeq, boardName, boardDescription, boardType, 
						boardCategory, isActive, displayOrder, noticeDisplayCount, 
						createdDate, updatedDate);
	}
}

