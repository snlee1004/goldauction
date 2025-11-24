package com.example.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.BoardPost;

public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {
	// 게시판별 게시글 목록 조회 (삭제되지 않은 것만, 공지사항 우선)
	@Query("SELECT p FROM BoardPost p WHERE p.boardSeq = :boardSeq AND (p.isDeleted IS NULL OR p.isDeleted = 'N') AND (p.isHidden IS NULL OR p.isHidden = 'N') ORDER BY CASE WHEN p.isNotice IS NULL THEN 'N' ELSE p.isNotice END DESC, CASE WHEN p.noticeOrder IS NULL THEN 0 ELSE p.noticeOrder END ASC, p.createdDate DESC")
	Page<BoardPost> findByBoardSeqAndNotDeleted(@Param("boardSeq") Long boardSeq, Pageable pageable);
	
	// 게시판별 공지사항 목록 조회 (상단 노출용)
	@Query("SELECT p FROM BoardPost p WHERE p.boardSeq = :boardSeq AND p.isNotice = 'Y' AND (p.isDeleted IS NULL OR p.isDeleted = 'N') AND (p.isHidden IS NULL OR p.isHidden = 'N') ORDER BY CASE WHEN p.noticeOrder IS NULL THEN 0 ELSE p.noticeOrder END ASC")
	List<BoardPost> findNoticesByBoardSeq(@Param("boardSeq") Long boardSeq, Pageable pageable);
	
	// 게시판별 일반 게시글 목록 조회 (페이징)
	@Query("SELECT p FROM BoardPost p WHERE p.boardSeq = :boardSeq AND (p.isNotice IS NULL OR p.isNotice = 'N') AND (p.isDeleted IS NULL OR p.isDeleted = 'N') AND (p.isHidden IS NULL OR p.isHidden = 'N') ORDER BY p.createdDate DESC")
	Page<BoardPost> findPostsByBoardSeq(@Param("boardSeq") Long boardSeq, Pageable pageable);
	
	// 게시글 검색 (제목, 내용)
	@Query("SELECT p FROM BoardPost p WHERE p.boardSeq = :boardSeq AND (p.postTitle LIKE CONCAT('%', CONCAT(:keyword, '%')) OR p.postContent LIKE CONCAT('%', CONCAT(:keyword, '%'))) AND (p.isDeleted IS NULL OR p.isDeleted = 'N') AND (p.isHidden IS NULL OR p.isHidden = 'N') ORDER BY p.createdDate DESC")
	Page<BoardPost> searchPosts(@Param("boardSeq") Long boardSeq, @Param("keyword") String keyword, Pageable pageable);
	
	// 작성자별 게시글 목록 조회
	@Query("SELECT p FROM BoardPost p WHERE p.memberId = :memberId AND p.isDeleted = 'N' ORDER BY p.createdDate DESC")
	Page<BoardPost> findByMemberId(@Param("memberId") String memberId, Pageable pageable);
	
	// 게시판별 게시글 수 조회 (삭제되지 않은 것만)
	long countByBoardSeqAndIsDeleted(Long boardSeq, String isDeleted);
	
	// 게시판별 게시글 목록 조회 (전체, 페이징 없음)
	@Query("SELECT p FROM BoardPost p WHERE p.boardSeq = :boardSeq AND p.isDeleted = :isDeleted ORDER BY p.createdDate DESC")
	List<BoardPost> findByBoardSeqAndIsDeletedOrderByCreatedDateDesc(@Param("boardSeq") Long boardSeq, @Param("isDeleted") String isDeleted);
	
	// 게시판별 공지사항 최대 순서 조회
	@Query("SELECT COALESCE(MAX(p.noticeOrder), 0) FROM BoardPost p WHERE p.boardSeq = :boardSeq AND p.isNotice = 'Y'")
	Integer findMaxNoticeOrder(@Param("boardSeq") Long boardSeq);
	
	// 고급 검색 (제목, 내용, 작성자, 날짜 범위)
	@Query("SELECT p FROM BoardPost p WHERE p.boardSeq = :boardSeq AND (p.isDeleted IS NULL OR p.isDeleted = 'N') AND (p.isHidden IS NULL OR p.isHidden = 'N') " +
		   "AND (:keyword IS NULL OR :keyword = '' OR p.postTitle LIKE CONCAT('%', CONCAT(:keyword, '%')) OR p.postContent LIKE CONCAT('%', CONCAT(:keyword, '%'))) " +
		   "AND (:memberId IS NULL OR :memberId = '' OR p.memberId = :memberId) " +
		   "AND (:startDate IS NULL OR p.createdDate >= :startDate) " +
		   "AND (:endDate IS NULL OR p.createdDate <= :endDate) " +
		   "ORDER BY CASE WHEN p.isNotice IS NULL THEN 'N' ELSE p.isNotice END DESC, CASE WHEN p.noticeOrder IS NULL THEN 0 ELSE p.noticeOrder END ASC, p.createdDate DESC")
	Page<BoardPost> advancedSearch(@Param("boardSeq") Long boardSeq,
									@Param("keyword") String keyword,
									@Param("memberId") String memberId,
									@Param("startDate") java.util.Date startDate,
									@Param("endDate") java.util.Date endDate,
									Pageable pageable);
}

