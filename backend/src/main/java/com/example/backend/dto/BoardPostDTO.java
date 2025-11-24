package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.BoardPost;

import lombok.Data;

@Data
public class BoardPostDTO {
	private Long postSeq;  // 게시글 번호
	private Long boardSeq;  // 게시판 번호
	private String memberId;  // 작성자 ID
	private String postTitle;  // 제목
	private String postContent;  // 내용
	private String isNotice;  // 공지사항 여부
	private Integer noticeOrder;  // 공지사항 순서
	private Integer viewCount;  // 조회수
	private Integer likeCount;  // 좋아요 수
	private String isHidden;  // 숨김 여부
	private String isDeleted;  // 삭제 여부
	private Date createdDate;  // 작성일
	private Date updatedDate;  // 수정일
	
	public BoardPost toEntity() {
		return new BoardPost(postSeq, boardSeq, memberId, postTitle, postContent,
							isNotice, noticeOrder, viewCount, likeCount, isHidden,
							isDeleted, createdDate, updatedDate);
	}
}

