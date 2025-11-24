package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.BoardPostDTO;
import com.example.backend.entity.BoardPost;
import com.example.backend.repository.BoardPostRepository;

@Repository
public class BoardPostDAO {
	@Autowired
	BoardPostRepository boardPostRepository;
	
	// 게시글 작성 => 1:작성성공, 0:작성실패
	public int write(BoardPostDTO dto) {
		try {
			// 기본값 설정
			if(dto.getIsNotice() == null || dto.getIsNotice().isEmpty()) {
				dto.setIsNotice("N");
			}
			if(dto.getNoticeOrder() == null) {
				dto.setNoticeOrder(0);
			}
			if(dto.getViewCount() == null) {
				dto.setViewCount(0);
			}
			if(dto.getLikeCount() == null) {
				dto.setLikeCount(0);
			}
			if(dto.getIsHidden() == null || dto.getIsHidden().isEmpty()) {
				dto.setIsHidden("N");
			}
			if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
				dto.setIsDeleted("N");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			// 공지사항인 경우 순서 설정
			if("Y".equals(dto.getIsNotice())) {
				Integer maxOrder = boardPostRepository.findMaxNoticeOrder(dto.getBoardSeq());
				dto.setNoticeOrder(maxOrder != null ? maxOrder + 1 : 1);
			}
			
			BoardPost post = boardPostRepository.save(dto.toEntity());
			return post != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판별 게시글 목록 조회 (페이징, 공지사항 상단 고정)
	public Page<BoardPost> getPostList(Long boardSeq, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return boardPostRepository.findByBoardSeqAndNotDeleted(boardSeq, pageable);
	}
	
	// 게시판별 게시글 목록 조회 (전체, 페이징 없음)
	public List<BoardPost> getAllPostList(Long boardSeq) {
		return boardPostRepository.findByBoardSeqAndIsDeletedOrderByCreatedDateDesc(boardSeq, "N");
	}
	
	// 게시판별 공지사항 목록 조회 (상단 노출용)
	public List<BoardPost> getNoticeList(Long boardSeq, int limit) {
		Pageable pageable = PageRequest.of(0, limit);
		return boardPostRepository.findNoticesByBoardSeq(boardSeq, pageable);
	}
	
	// 게시글 상세 조회
	public BoardPost getPost(Long postSeq) {
		return boardPostRepository.findById(postSeq).orElse(null);
	}
	
	// 게시글 수정 => 1:수정성공, 0:수정실패
	public int modify(BoardPostDTO dto) {
		try {
			BoardPost post = boardPostRepository.findById(dto.getPostSeq()).orElse(null);
			if(post != null) {
				// 생성일은 유지
				dto.setCreatedDate(post.getCreatedDate());
				// 수정일 설정
				dto.setUpdatedDate(new Date());
				// 기존 값 유지 (null인 경우)
				if(dto.getBoardSeq() == null) {
					dto.setBoardSeq(post.getBoardSeq());
				}
				if(dto.getMemberId() == null || dto.getMemberId().isEmpty()) {
					dto.setMemberId(post.getMemberId());
				}
				if(dto.getIsNotice() == null || dto.getIsNotice().isEmpty()) {
					dto.setIsNotice(post.getIsNotice());
				}
				if(dto.getNoticeOrder() == null) {
					dto.setNoticeOrder(post.getNoticeOrder());
				}
				if(dto.getViewCount() == null) {
					dto.setViewCount(post.getViewCount());
				}
				if(dto.getLikeCount() == null) {
					dto.setLikeCount(post.getLikeCount());
				}
				if(dto.getIsHidden() == null || dto.getIsHidden().isEmpty()) {
					dto.setIsHidden(post.getIsHidden());
				}
				if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
					dto.setIsDeleted(post.getIsDeleted());
				}
				
				BoardPost result = boardPostRepository.save(dto.toEntity());
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시글 삭제 (소프트 삭제) => 1:삭제성공, 0:삭제실패
	public int delete(Long postSeq) {
		try {
			BoardPost post = boardPostRepository.findById(postSeq).orElse(null);
			if(post != null) {
				post.setIsDeleted("Y");
				post.setUpdatedDate(new Date());
				BoardPost result = boardPostRepository.save(post);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 조회수 증가
	public int increaseViewCount(Long postSeq) {
		try {
			BoardPost post = boardPostRepository.findById(postSeq).orElse(null);
			if(post != null) {
				post.setViewCount(post.getViewCount() + 1);
				boardPostRepository.save(post);
				return 1;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시글 검색 (제목, 내용)
	public Page<BoardPost> searchPosts(Long boardSeq, String keyword, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return boardPostRepository.searchPosts(boardSeq, keyword, pageable);
	}
	
	// 고급 검색 (제목, 내용, 작성자, 날짜 범위)
	public Page<BoardPost> advancedSearch(Long boardSeq, String keyword, String memberId, Date startDate, Date endDate, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return boardPostRepository.advancedSearch(boardSeq, keyword, memberId, startDate, endDate, pageable);
	}
	
	// 게시판별 게시글 수 조회
	public long getTotalCount(Long boardSeq) {
		return boardPostRepository.countByBoardSeqAndIsDeleted(boardSeq, "N");
	}
}

