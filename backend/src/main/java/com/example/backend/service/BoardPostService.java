package com.example.backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.example.backend.dao.BoardPostDAO;
import com.example.backend.dto.BoardPostDTO;
import com.example.backend.entity.BoardPost;

@Service
public class BoardPostService {
	@Autowired
	BoardPostDAO dao;
	
	// 게시글 작성
	public int write(BoardPostDTO dto) {
		return dao.write(dto);
	}
	
	// 게시판별 게시글 목록 조회 (페이징)
	public Page<BoardPost> getPostList(Long boardSeq, int page, int size) {
		return dao.getPostList(boardSeq, page, size);
	}
	
	// 게시판별 게시글 목록 조회 (전체, 페이징 없음)
	public List<BoardPost> getAllPostList(Long boardSeq) {
		return dao.getAllPostList(boardSeq);
	}
	
	// 게시판별 공지사항 목록 조회
	public List<BoardPost> getNoticeList(Long boardSeq, int limit) {
		return dao.getNoticeList(boardSeq, limit);
	}
	
	// 게시글 상세 조회
	public BoardPost getPost(Long postSeq) {
		return dao.getPost(postSeq);
	}
	
	// 게시글 수정
	public int modify(BoardPostDTO dto) {
		return dao.modify(dto);
	}
	
	// 게시글 삭제
	public int delete(Long postSeq) {
		return dao.delete(postSeq);
	}
	
	// 조회수 증가
	public int increaseViewCount(Long postSeq) {
		return dao.increaseViewCount(postSeq);
	}
	
	// 게시글 검색
	public Page<BoardPost> searchPosts(Long boardSeq, String keyword, int page, int size) {
		return dao.searchPosts(boardSeq, keyword, page, size);
	}
	
	// 고급 검색 (제목, 내용, 작성자, 날짜 범위)
	public Page<BoardPost> advancedSearch(Long boardSeq, String keyword, String memberId, Date startDate, Date endDate, int page, int size) {
		return dao.advancedSearch(boardSeq, keyword, memberId, startDate, endDate, page, size);
	}
	
	// 게시판별 게시글 수 조회
	public long getTotalCount(Long boardSeq) {
		return dao.getTotalCount(boardSeq);
	}
}

