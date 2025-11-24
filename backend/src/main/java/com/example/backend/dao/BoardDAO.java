package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.BoardDTO;
import com.example.backend.entity.Board;
import com.example.backend.repository.BoardRepository;

@Repository
public class BoardDAO {
	@Autowired
	BoardRepository boardRepository;
	
	// 게시판 생성 => 1:생성성공, 0:생성실패
	public int write(BoardDTO dto) {
		try {
			// 기본값 설정
			if(dto.getIsActive() == null || dto.getIsActive().isEmpty()) {
				dto.setIsActive("Y");
			}
			if(dto.getDisplayOrder() == null) {
				dto.setDisplayOrder(0);
			}
			if(dto.getNoticeDisplayCount() == null) {
				dto.setNoticeDisplayCount(5);
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			Board board = boardRepository.save(dto.toEntity());
			return board != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판 목록 조회 (활성화된 게시판만)
	public List<Board> getBoardList() {
		return boardRepository.findByIsActiveOrderByDisplayOrderAscBoardSeqAsc("Y");
	}
	
	// 게시판 타입별 목록 조회
	public List<Board> getBoardListByType(String boardType) {
		return boardRepository.findByBoardTypeAndIsActiveOrderByDisplayOrderAscBoardSeqAsc(boardType, "Y");
	}
	
	// 게시판 상세 조회
	public Board getBoard(Long boardSeq) {
		return boardRepository.findById(boardSeq).orElse(null);
	}
	
	// 게시판 수정 => 1:수정성공, 0:수정실패
	public int modify(BoardDTO dto) {
		try {
			Board board = boardRepository.findById(dto.getBoardSeq()).orElse(null);
			if(board != null) {
				// 생성일은 유지
				dto.setCreatedDate(board.getCreatedDate());
				// 수정일 설정
				dto.setUpdatedDate(new Date());
				// 기본값 설정
				if(dto.getIsActive() == null || dto.getIsActive().isEmpty()) {
					dto.setIsActive(board.getIsActive());
				}
				if(dto.getDisplayOrder() == null) {
					dto.setDisplayOrder(board.getDisplayOrder());
				}
				if(dto.getNoticeDisplayCount() == null) {
					dto.setNoticeDisplayCount(board.getNoticeDisplayCount());
				}
				
				Board result = boardRepository.save(dto.toEntity());
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판 삭제 (비활성화) => 1:삭제성공, 0:삭제실패
	public int delete(Long boardSeq) {
		try {
			Board board = boardRepository.findById(boardSeq).orElse(null);
			if(board != null) {
				board.setIsActive("N");
				board.setUpdatedDate(new Date());
				Board result = boardRepository.save(board);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판 완전 삭제 (DB에서 영구 삭제, CASCADE로 관련 데이터 자동 삭제) => 1:삭제성공, 0:삭제실패
	public int deletePermanent(Long boardSeq) {
		try {
			// CASCADE 설정으로 인해 BOARD1 삭제 시 자동으로 삭제되는 테이블들:
			// - BOARD_POST1 (게시글)
			// - BOARD_COMMENT1 (댓글, 게시글 삭제 시 CASCADE)
			// - BOARD_POST_FILE1 (첨부파일, 게시글 삭제 시 CASCADE)
			// - EVENT_PRODUCT1 (공구이벤트 상품)
			// - EVENT_PRODUCT_IMAGE1 (상품 이미지, 상품 삭제 시 CASCADE)
			// - EVENT_PRODUCT_OPTION1 (상품 옵션, 상품 삭제 시 CASCADE)
			// - EVENT_ORDER1 (주문, 상품 삭제 시 CASCADE는 아니지만 상품이 없으면 의미 없음)
			// - BOARD_NOTICE_SETTING1 (공지사항 설정)
			// - BOARD_NOTIFICATION1 (알림, 게시글/댓글 삭제 시 CASCADE)
			
			boardRepository.deleteById(boardSeq);
			return 1;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판명으로 검색
	public List<Board> searchBoards(String keyword) {
		return boardRepository.findByBoardNameContainingAndIsActive(keyword, "Y");
	}
	
	// 활성화된 게시판 수 조회
	public long getTotalCount() {
		return boardRepository.countByIsActive("Y");
	}
}

