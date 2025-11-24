package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.BoardComment;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {
	// 게시글별 댓글 목록 조회 (대댓글 포함, 삭제되지 않은 것만)
	@Query("SELECT c FROM BoardComment c WHERE c.postSeq = :postSeq AND c.isDeleted = 'N' AND c.isHidden = 'N' ORDER BY c.createdDate ASC")
	List<BoardComment> findByPostSeqAndNotDeleted(@Param("postSeq") Long postSeq);
	
	// 게시글별 댓글 수 조회 (삭제되지 않은 것만)
	@Query("SELECT COUNT(c) FROM BoardComment c WHERE c.postSeq = :postSeq AND c.isDeleted = 'N' AND c.isHidden = 'N'")
	long countByPostSeqAndNotDeleted(@Param("postSeq") Long postSeq);
	
	// 부모 댓글별 대댓글 목록 조회
	@Query("SELECT c FROM BoardComment c WHERE c.parentCommentSeq = :parentCommentSeq AND c.isDeleted = 'N' AND c.isHidden = 'N' ORDER BY c.createdDate ASC")
	List<BoardComment> findByParentCommentSeqAndNotDeleted(@Param("parentCommentSeq") Long parentCommentSeq);
}

