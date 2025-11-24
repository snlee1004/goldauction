package com.example.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {
	// 활성화된 게시판 목록 조회
	List<Board> findByIsActiveOrderByDisplayOrderAscBoardSeqAsc(String isActive);
	
	// 게시판 타입별 목록 조회
	List<Board> findByBoardTypeAndIsActiveOrderByDisplayOrderAscBoardSeqAsc(String boardType, String isActive);
	
	// 게시판 타입별 페이징 조회
	Page<Board> findByBoardTypeAndIsActive(String boardType, String isActive, Pageable pageable);
	
	// 게시판명으로 검색
	@Query("SELECT b FROM Board b WHERE b.boardName LIKE %:keyword% AND b.isActive = :isActive ORDER BY b.displayOrder ASC, b.boardSeq ASC")
	List<Board> findByBoardNameContainingAndIsActive(@Param("keyword") String keyword, @Param("isActive") String isActive);
	
	// 활성화된 게시판 수 조회
	long countByIsActive(String isActive);
	
	// 모든 게시판 목록 조회 (활성화 여부 무관)
	List<Board> findAllByOrderByDisplayOrderAscBoardSeqAsc();
	
	// 게시판 타입별 모든 게시판 목록 조회 (활성화 여부 무관)
	List<Board> findByBoardTypeOrderByDisplayOrderAscBoardSeqAsc(String boardType);
}

