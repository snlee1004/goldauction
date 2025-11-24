package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.BoardComment;

import lombok.Data;

@Data
public class BoardCommentDTO {
	private Long commentSeq;  // 댓글 번호
	private Long postSeq;  // 게시글 번호
	private String memberId;  // 작성자 ID
	private String commentContent;  // 댓글 내용
	private Long parentCommentSeq;  // 부모 댓글 번호
	private String isHidden;  // 숨김 여부
	private String isDeleted;  // 삭제 여부
	private Date createdDate;  // 작성일
	private Date updatedDate;  // 수정일
	
	public BoardComment toEntity() {
		return new BoardComment(commentSeq, postSeq, memberId, commentContent,
							  parentCommentSeq, isHidden, isDeleted, createdDate, updatedDate);
	}
}

