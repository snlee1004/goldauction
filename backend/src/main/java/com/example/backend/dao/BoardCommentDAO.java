package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.BoardCommentDTO;
import com.example.backend.entity.BoardComment;
import com.example.backend.repository.BoardCommentRepository;

@Repository
public class BoardCommentDAO {
	@Autowired
	BoardCommentRepository boardCommentRepository;
	
	// 댓글 작성 => 1:작성성공, 0:작성실패
	public int write(BoardCommentDTO dto) {
		try {
			// 기본값 설정
			if(dto.getIsHidden() == null || dto.getIsHidden().isEmpty()) {
				dto.setIsHidden("N");
			}
			if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
				dto.setIsDeleted("N");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			BoardComment comment = boardCommentRepository.save(dto.toEntity());
			return comment != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 댓글 작성 및 반환
	public BoardComment writeAndReturn(BoardCommentDTO dto) {
		try {
			// 기본값 설정
			if(dto.getIsHidden() == null || dto.getIsHidden().isEmpty()) {
				dto.setIsHidden("N");
			}
			if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
				dto.setIsDeleted("N");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			return boardCommentRepository.save(dto.toEntity());
		} catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	// 게시글별 댓글 목록 조회
	public List<BoardComment> getCommentList(Long postSeq) {
		return boardCommentRepository.findByPostSeqAndNotDeleted(postSeq);
	}
	
	// 댓글 상세 조회
	public BoardComment getComment(Long commentSeq) {
		return boardCommentRepository.findById(commentSeq).orElse(null);
	}
	
	// 댓글 수정 => 1:수정성공, 0:수정실패
	public int modify(BoardCommentDTO dto) {
		try {
			BoardComment comment = boardCommentRepository.findById(dto.getCommentSeq()).orElse(null);
			if(comment != null) {
				// 생성일은 유지
				dto.setCreatedDate(comment.getCreatedDate());
				// 수정일 설정
				dto.setUpdatedDate(new Date());
				// 기존 값 유지 (null인 경우)
				if(dto.getPostSeq() == null) {
					dto.setPostSeq(comment.getPostSeq());
				}
				if(dto.getMemberId() == null || dto.getMemberId().isEmpty()) {
					dto.setMemberId(comment.getMemberId());
				}
				if(dto.getParentCommentSeq() == null) {
					dto.setParentCommentSeq(comment.getParentCommentSeq());
				}
				if(dto.getIsHidden() == null || dto.getIsHidden().isEmpty()) {
					dto.setIsHidden(comment.getIsHidden());
				}
				if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
					dto.setIsDeleted(comment.getIsDeleted());
				}
				
				BoardComment result = boardCommentRepository.save(dto.toEntity());
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 댓글 삭제 (소프트 삭제) => 1:삭제성공, 0:삭제실패
	public int delete(Long commentSeq) {
		try {
			BoardComment comment = boardCommentRepository.findById(commentSeq).orElse(null);
			if(comment != null) {
				comment.setIsDeleted("Y");
				comment.setUpdatedDate(new Date());
				BoardComment result = boardCommentRepository.save(comment);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시글별 댓글 수 조회
	public long getCommentCount(Long postSeq) {
		return boardCommentRepository.countByPostSeqAndNotDeleted(postSeq);
	}
}

