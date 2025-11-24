package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.BoardCommentDAO;
import com.example.backend.dto.BoardCommentDTO;
import com.example.backend.entity.BoardComment;

@Service
public class BoardCommentService {
	@Autowired
	BoardCommentDAO dao;
	
	// 댓글 작성
	public int write(BoardCommentDTO dto) {
		return dao.write(dto);
	}
	
	// 댓글 작성 및 반환
	public BoardComment writeAndReturn(BoardCommentDTO dto) {
		return dao.writeAndReturn(dto);
	}
	
	// 게시글별 댓글 목록 조회
	public List<BoardComment> getCommentList(Long postSeq) {
		return dao.getCommentList(postSeq);
	}
	
	// 댓글 상세 조회
	public BoardComment getComment(Long commentSeq) {
		return dao.getComment(commentSeq);
	}
	
	// 댓글 수정
	public int modify(BoardCommentDTO dto) {
		return dao.modify(dto);
	}
	
	// 댓글 삭제
	public int delete(Long commentSeq) {
		return dao.delete(commentSeq);
	}
	
	// 게시글별 댓글 수 조회
	public long getCommentCount(Long postSeq) {
		return dao.getCommentCount(postSeq);
	}
}

