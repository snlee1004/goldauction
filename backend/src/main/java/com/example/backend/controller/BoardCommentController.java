package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.BoardCommentDTO;
import com.example.backend.entity.BoardComment;
import com.example.backend.service.BoardCommentService;
import com.example.backend.service.ProfanityFilterService;
import com.example.backend.service.BoardNotificationService;
import com.example.backend.service.BoardPostService;
import com.example.backend.service.ManagerService;
import com.example.backend.service.MemberService;

@RestController
public class BoardCommentController {
	@Autowired
	BoardCommentService service;
	
	@Autowired
	ProfanityFilterService profanityFilterService;
	
	@Autowired
	BoardNotificationService notificationService;
	
	@Autowired
	BoardPostService boardPostService;
	
	@Autowired
	ManagerService managerService;
	
	@Autowired
	MemberService memberService;
	
	// 댓글 작성
	@PostMapping("/board/comment/write")
	public Map<String, Object> writeComment(@RequestBody BoardCommentDTO dto) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			// 관리자 ID가 MEMBER1 테이블에 있는지 확인 (관리자가 댓글 작성하는 경우)
			String memberId = dto.getMemberId();
			com.example.backend.entity.Manager manager = managerService.getManager(memberId);
			
			if(manager != null) {
				// 관리자인 경우 MEMBER1에 있는지 확인
				com.example.backend.entity.Member member = memberService.getMember(memberId);
				if(member == null) {
					// 관리자 ID가 MEMBER1에 없으면 자동으로 생성
					com.example.backend.dto.MemberDTO memberDTO = new com.example.backend.dto.MemberDTO();
					memberDTO.setId(memberId);
					memberDTO.setName(manager.getManagerName() != null ? manager.getManagerName() : "관리자");
					memberDTO.setNickname(manager.getManagerName() != null ? manager.getManagerName() : "관리자");
					memberDTO.setPwd("NOPASSWORD");
					
					// 이메일 파싱
					if(manager.getManagerEmail() != null && manager.getManagerEmail().contains("@")) {
						String[] emailParts = manager.getManagerEmail().split("@", 2);
						memberDTO.setEmail1(emailParts[0]);
						memberDTO.setEmail2(emailParts.length > 1 ? emailParts[1] : "");
					} else {
						memberDTO.setEmail1("");
						memberDTO.setEmail2("");
					}
					
					// 전화번호 파싱
					if(manager.getManagerTel() != null) {
						String tel = manager.getManagerTel().replaceAll("-", "");
						if(tel.length() >= 11) {
							memberDTO.setTel1(tel.substring(0, 3));
							memberDTO.setTel2(tel.substring(3, 7));
							memberDTO.setTel3(tel.substring(7));
						} else if(tel.length() >= 10) {
							memberDTO.setTel1(tel.substring(0, 3));
							memberDTO.setTel2(tel.substring(3, 6));
							memberDTO.setTel3(tel.substring(6));
						} else {
							memberDTO.setTel1("");
							memberDTO.setTel2("");
							memberDTO.setTel3("");
						}
					} else {
						memberDTO.setTel1("");
						memberDTO.setTel2("");
						memberDTO.setTel3("");
					}
					
					memberDTO.setLogtime(new java.util.Date());
					memberDTO.setIsSuspended("N");
					
					int createResult = memberService.write(memberDTO);
					if(createResult == 0) {
						// 이미 존재하는 경우 다시 확인
						member = memberService.getMember(memberId);
						if(member == null) {
							map.put("rt", "FAIL");
							map.put("msg", "댓글 작성에 실패했습니다. 관리자 계정 생성에 실패했습니다.");
							return map;
						}
					}
				}
			}
			
			// 비속어 검열
			String content = dto.getCommentContent();
			Map<String, Object> contentCheck = profanityFilterService.checkAndFilter(content);
			
			if((Boolean)contentCheck.get("blocked")) {
				map.put("rt", "FAIL");
				map.put("msg", "댓글에 사용할 수 없는 단어가 포함되어 있습니다.");
				return map;
			}
			if((Boolean)contentCheck.get("containsProfanity")) {
				dto.setCommentContent((String)contentCheck.get("filteredText"));
			}
			
			com.example.backend.entity.BoardComment createdComment = service.writeAndReturn(dto);
			
			if(createdComment != null) {
			// 게시글 작성자에게 알림 생성
			com.example.backend.entity.BoardPost post = boardPostService.getPost(dto.getPostSeq());
			if(post != null && !post.getMemberId().equals(dto.getMemberId())) {
				notificationService.createCommentNotification(
					dto.getPostSeq(),
					createdComment.getCommentSeq(),
					post.getMemberId(),
					dto.getMemberId()
				);
			}
			
			map.put("rt", "OK");
			map.put("msg", "댓글이 작성되었습니다.");
			map.put("comment", createdComment);
			if((Boolean)contentCheck.get("containsProfanity")) {
				map.put("msg", "댓글이 작성되었습니다. (일부 단어가 필터링되었습니다.)");
			}
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "댓글 작성에 실패했습니다.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "댓글 작성 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 게시글별 댓글 목록 조회
	@GetMapping("/board/comment/list")
	public Map<String, Object> getCommentList(@RequestParam("postSeq") Long postSeq) {
		List<BoardComment> list = service.getCommentList(postSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 댓글 수정
	@PostMapping("/board/comment/modify")
	public Map<String, Object> modifyComment(@RequestBody BoardCommentDTO dto) {
		// 비속어 검열
		String content = dto.getCommentContent();
		Map<String, Object> contentCheck = profanityFilterService.checkAndFilter(content);
		
		if((Boolean)contentCheck.get("blocked")) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "댓글에 사용할 수 없는 단어가 포함되어 있습니다.");
			return map;
		}
		if((Boolean)contentCheck.get("containsProfanity")) {
			dto.setCommentContent((String)contentCheck.get("filteredText"));
		}
		
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "댓글이 수정되었습니다.");
			if((Boolean)contentCheck.get("containsProfanity")) {
				map.put("msg", "댓글이 수정되었습니다. (일부 단어가 필터링되었습니다.)");
			}
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "댓글 수정에 실패했습니다.");
		}
		return map;
	}
	
	// 댓글 삭제
	@PostMapping("/board/comment/delete")
	public Map<String, Object> deleteComment(@RequestBody Map<String, Long> params) {
		Long commentSeq = params.get("commentSeq");
		int result = service.delete(commentSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "댓글이 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "댓글 삭제에 실패했습니다.");
		}
		return map;
	}
	
	// 게시글별 댓글 수 조회
	@GetMapping("/board/comment/count")
	public Map<String, Object> getCommentCount(@RequestParam("postSeq") Long postSeq) {
		long count = service.getCommentCount(postSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("count", count);
		return map;
	}
}

