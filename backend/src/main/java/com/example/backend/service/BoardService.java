package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.BoardDAO;
import com.example.backend.dto.BoardDTO;
import com.example.backend.entity.Board;

@Service
public class BoardService {
	@Autowired
	BoardDAO dao;
	
	// 게시판 생성
	public int write(BoardDTO dto) {
		return dao.write(dto);
	}
	
	// 게시판 목록 조회
	public List<Board> getBoardList() {
		return dao.getBoardList();
	}
	
	// 게시판 목록 조회 (모든 게시판, 활성화 여부 무관)
	public List<Board> getAllBoardList() {
		return dao.getAllBoardList();
	}
	
	// 게시판 타입별 목록 조회
	public List<Board> getBoardListByType(String boardType) {
		return dao.getBoardListByType(boardType);
	}
	
	// 게시판 타입별 목록 조회 (모든 게시판, 활성화 여부 무관)
	public List<Board> getAllBoardListByType(String boardType) {
		return dao.getAllBoardListByType(boardType);
	}
	
	// 게시판 상세 조회
	public Board getBoard(Long boardSeq) {
		return dao.getBoard(boardSeq);
	}
	
	// 게시판 수정
	public int modify(BoardDTO dto) {
		return dao.modify(dto);
	}
	
	// 게시판 삭제 (비활성화)
	public int delete(Long boardSeq) {
		return dao.delete(boardSeq);
	}
	
	// 게시판 완전 삭제 (DB에서 영구 삭제)
	public int deletePermanent(Long boardSeq) {
		return dao.deletePermanent(boardSeq);
	}
	
	// 게시판 검색
	public List<Board> searchBoards(String keyword) {
		return dao.searchBoards(keyword);
	}
	
	// 활성화된 게시판 수 조회
	public long getTotalCount() {
		return dao.getTotalCount();
	}
}

