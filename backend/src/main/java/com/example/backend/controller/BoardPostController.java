package com.example.backend.controller;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.BoardPostDTO;
import com.example.backend.entity.BoardPost;
import com.example.backend.service.BoardPostService;
import com.example.backend.service.ManagerService;
import com.example.backend.service.MemberService;
import com.example.backend.service.ProfanityFilterService;

@RestController
public class BoardPostController {
	@Autowired
	BoardPostService service;
	
	@Autowired
	ProfanityFilterService profanityFilterService;
	
	@Autowired
	ManagerService managerService;
	
	@Autowired
	MemberService memberService;
	
	// 게시글 작성
	@PostMapping("/board/post/write")
	public Map<String, Object> writePost(@RequestBody BoardPostDTO dto) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		// 공지사항 작성 권한 체크 (관리자만 가능)
		if("Y".equals(dto.getIsNotice())) {
			// 작성자가 관리자인지 확인
			String memberId = dto.getMemberId();
			com.example.backend.entity.Manager manager = managerService.getManager(memberId);
			
			if(manager == null) {
				// 관리자가 아니면 공지사항을 일반 게시글로 변경
				dto.setIsNotice("N");
				System.out.println("경고: 일반 회원(" + memberId + ")이 공지사항으로 작성 시도 -> 일반 게시글로 변경됨");
			}
		}
		
		// 비속어 검열
		String title = dto.getPostTitle();
		String content = dto.getPostContent();
		
		// 제목 비속어 검사
		Map<String, Object> titleCheck = profanityFilterService.checkAndFilter(title);
		if((Boolean)titleCheck.get("blocked")) {
			map.put("rt", "FAIL");
			map.put("msg", "제목에 사용할 수 없는 단어가 포함되어 있습니다.");
			return map;
		}
		if((Boolean)titleCheck.get("containsProfanity")) {
			dto.setPostTitle((String)titleCheck.get("filteredText"));
		}
		
		// 내용 비속어 검사
		Map<String, Object> contentCheck = profanityFilterService.checkAndFilter(content);
		if((Boolean)contentCheck.get("blocked")) {
			map.put("rt", "FAIL");
			map.put("msg", "내용에 사용할 수 없는 단어가 포함되어 있습니다.");
			return map;
		}
		if((Boolean)contentCheck.get("containsProfanity")) {
			dto.setPostContent((String)contentCheck.get("filteredText"));
		}
		
		int result = service.write(dto);
		
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "게시글이 작성되었습니다.");
			if((Boolean)titleCheck.get("containsProfanity") || (Boolean)contentCheck.get("containsProfanity")) {
				map.put("msg", "게시글이 작성되었습니다. (일부 단어가 필터링되었습니다.)");
			}
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시글 작성에 실패했습니다.");
		}
		return map;
	}
	
	// 게시판별 게시글 목록 조회 (페이징)
	@GetMapping("/board/post/list")
	public Map<String, Object> getPostList(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			System.out.println("게시글 목록 조회 요청 - boardSeq: " + boardSeq + ", page: " + page + ", size: " + size);
			
			Page<BoardPost> postPage = service.getPostList(boardSeq, page, size);
			
			map.put("rt", "OK");
			map.put("list", postPage.getContent());
			map.put("total", postPage.getTotalElements());
			map.put("totalPages", postPage.getTotalPages());
			map.put("currentPage", postPage.getNumber());
			map.put("size", postPage.getSize());
			
			System.out.println("게시글 목록 조회 성공 - 총 개수: " + postPage.getTotalElements());
		} catch(Exception e) {
			e.printStackTrace();
			System.err.println("게시글 목록 조회 오류: " + e.getMessage());
			map.put("rt", "FAIL");
			map.put("msg", "게시글 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage());
			map.put("list", new java.util.ArrayList<BoardPost>());
			map.put("total", 0);
			map.put("totalPages", 0);
			map.put("currentPage", 0);
			map.put("size", 0);
		}
		
		return map;
	}
	
	// 게시판별 게시글 목록 조회 (전체, 페이징 없음)
	@GetMapping("/board/post/list/all")
	public Map<String, Object> getAllPostList(@RequestParam("boardSeq") Long boardSeq) {
		List<BoardPost> list = service.getAllPostList(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 게시판별 공지사항 목록 조회
	@GetMapping("/board/post/notice")
	public Map<String, Object> getNoticeList(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam(value = "limit", defaultValue = "5") int limit) {
		
		List<BoardPost> notices = service.getNoticeList(boardSeq, limit);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", notices);
		map.put("total", notices.size());
		return map;
	}
	
	// 공지사항 작성 (관리자만)
	@PostMapping("/board/post/notice/write")
	public Map<String, Object> writeNotice(@RequestBody BoardPostDTO dto) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			// 관리자 권한 체크
			String memberId = dto.getMemberId();
			com.example.backend.entity.Manager manager = managerService.getManager(memberId);
			
			if(manager == null) {
				map.put("rt", "FAIL");
				map.put("msg", "공지사항 작성은 관리자만 가능합니다.");
				return map;
			}
			
			// 관리자 ID가 MEMBER1 테이블에 있는지 확인
			com.example.backend.entity.Member member = memberService.getMember(memberId);
			if(member == null) {
				// 관리자 ID가 MEMBER1에 없으면 자동으로 생성
				com.example.backend.dto.MemberDTO memberDTO = new com.example.backend.dto.MemberDTO();
				memberDTO.setId(memberId);
				memberDTO.setName(manager.getManagerName() != null ? manager.getManagerName() : "관리자");
				memberDTO.setNickname(manager.getManagerName() != null ? manager.getManagerName() : "관리자");
				memberDTO.setPwd("NOPASSWORD"); // 관리자는 MEMBER1에서 비밀번호를 사용하지 않음 (NOT NULL 제약조건 때문에 값 필요)
				
				// 이메일 파싱
				if(manager.getManagerEmail() != null && manager.getManagerEmail().contains("@")) {
					String[] emailParts = manager.getManagerEmail().split("@", 2);
					memberDTO.setEmail1(emailParts[0]);
					memberDTO.setEmail2(emailParts.length > 1 ? emailParts[1] : "");
				} else {
					memberDTO.setEmail1("");
					memberDTO.setEmail2("");
				}
				
				// 전화번호 파싱 (010-1234-5678 형식 가정)
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
					// 이미 존재하는 경우 (다른 스레드에서 생성했을 수 있음)
					member = memberService.getMember(memberId);
					if(member == null) {
						map.put("rt", "FAIL");
						map.put("msg", "공지사항 작성에 실패했습니다. 관리자 계정 생성에 실패했습니다.");
						return map;
					}
				}
			}
			
			// 공지사항으로 설정
			dto.setIsNotice("Y");
			
			// 비속어 검열
			String title = dto.getPostTitle();
			String content = dto.getPostContent();
			
			// 제목 비속어 검사
			Map<String, Object> titleCheck = profanityFilterService.checkAndFilter(title);
			if((Boolean)titleCheck.get("blocked")) {
				map.put("rt", "FAIL");
				map.put("msg", "제목에 사용할 수 없는 단어가 포함되어 있습니다.");
				return map;
			}
			if((Boolean)titleCheck.get("containsProfanity")) {
				dto.setPostTitle((String)titleCheck.get("filteredText"));
			}
			
			// 내용 비속어 검사
			Map<String, Object> contentCheck = profanityFilterService.checkAndFilter(content);
			if((Boolean)contentCheck.get("blocked")) {
				map.put("rt", "FAIL");
				map.put("msg", "내용에 사용할 수 없는 단어가 포함되어 있습니다.");
				return map;
			}
			if((Boolean)contentCheck.get("containsProfanity")) {
				dto.setPostContent((String)contentCheck.get("filteredText"));
			}
			
			int result = service.write(dto);
			
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "공지사항이 작성되었습니다.");
				if((Boolean)titleCheck.get("containsProfanity") || (Boolean)contentCheck.get("containsProfanity")) {
					map.put("msg", "공지사항이 작성되었습니다. (일부 단어가 필터링되었습니다.)");
				}
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "공지사항 작성에 실패했습니다. 관리자 계정이 MEMBER1 테이블에 등록되어 있는지 확인해주세요.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "공지사항 작성 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 게시글을 공지사항으로 전환 (관리자만 가능)
	@PostMapping("/board/post/toNotice")
	public Map<String, Object> convertToNotice(@RequestBody Map<String, Object> params) {
		Long postSeq = ((Number) params.get("postSeq")).longValue();
		String memberId = (String) params.get("memberId"); // 요청한 사용자 ID
		
		BoardPost post = service.getPost(postSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(post != null) {
			// 관리자 권한 체크
			com.example.backend.entity.Manager manager = managerService.getManager(memberId);
			if(manager == null) {
				map.put("rt", "FAIL");
				map.put("msg", "공지사항 전환은 관리자만 가능합니다.");
				return map;
			}
			
			BoardPostDTO dto = new BoardPostDTO();
			dto.setPostSeq(post.getPostSeq());
			dto.setBoardSeq(post.getBoardSeq());
			dto.setMemberId(post.getMemberId());
			dto.setPostTitle(post.getPostTitle());
			dto.setPostContent(post.getPostContent());
			dto.setIsNotice("Y");
			dto.setViewCount(post.getViewCount());
			dto.setLikeCount(post.getLikeCount());
			dto.setIsHidden(post.getIsHidden());
			dto.setIsDeleted(post.getIsDeleted());
			dto.setCreatedDate(post.getCreatedDate());
			
			int result = service.modify(dto);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "공지사항으로 전환되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "공지사항 전환에 실패했습니다.");
			}
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시글을 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 게시글 상세 조회
	@GetMapping("/board/post/detail")
	public Map<String, Object> getPostDetail(@RequestParam("postSeq") Long postSeq) {
		BoardPost post = service.getPost(postSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(post != null && !"Y".equals(post.getIsDeleted())) {
			// 조회수 증가
			service.increaseViewCount(postSeq);
			// 증가된 조회수 반영
			post = service.getPost(postSeq);
			
			map.put("rt", "OK");
			map.put("post", post);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시글을 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 게시글 수정
	@PostMapping("/board/post/modify")
	public Map<String, Object> modifyPost(@RequestBody BoardPostDTO dto) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			// 공지사항 수정 권한 체크 (관리자만 가능)
			if("Y".equals(dto.getIsNotice())) {
				// 기존 게시글 정보 조회
				BoardPost existingPost = service.getPost(dto.getPostSeq());
				if(existingPost != null) {
					String memberId = existingPost.getMemberId();
					com.example.backend.entity.Manager manager = managerService.getManager(memberId);
					
					if(manager == null) {
						// 관리자가 아니면 공지사항을 일반 게시글로 유지
						dto.setIsNotice(existingPost.getIsNotice());
						System.out.println("경고: 일반 회원(" + memberId + ")이 공지사항 수정 시도 -> 기존 상태 유지");
					}
				}
			}
			
			// 비속어 검열
			String title = dto.getPostTitle();
			String content = dto.getPostContent();
			
			// 제목 비속어 검사
			Map<String, Object> titleCheck = profanityFilterService.checkAndFilter(title);
			if((Boolean)titleCheck.get("blocked")) {
				map.put("rt", "FAIL");
				map.put("msg", "제목에 사용할 수 없는 단어가 포함되어 있습니다.");
				return map;
			}
			if((Boolean)titleCheck.get("containsProfanity")) {
				dto.setPostTitle((String)titleCheck.get("filteredText"));
			}
			
			// 내용 비속어 검사
			Map<String, Object> contentCheck = profanityFilterService.checkAndFilter(content);
			if((Boolean)contentCheck.get("blocked")) {
				map.put("rt", "FAIL");
				map.put("msg", "내용에 사용할 수 없는 단어가 포함되어 있습니다.");
				return map;
			}
			if((Boolean)contentCheck.get("containsProfanity")) {
				dto.setPostContent((String)contentCheck.get("filteredText"));
			}
			
			int result = service.modify(dto);
			
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "게시글이 수정되었습니다.");
				if((Boolean)titleCheck.get("containsProfanity") || (Boolean)contentCheck.get("containsProfanity")) {
					map.put("msg", "게시글이 수정되었습니다. (일부 단어가 필터링되었습니다.)");
				}
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "게시글 수정에 실패했습니다.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "게시글 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 게시글 삭제
	@PostMapping("/board/post/delete")
	public Map<String, Object> deletePost(@RequestBody Map<String, Long> params) {
		Long postSeq = params.get("postSeq");
		int result = service.delete(postSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "게시글이 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시글 삭제에 실패했습니다.");
		}
		return map;
	}
	
	// 게시글 검색
	@GetMapping("/board/post/search")
	public Map<String, Object> searchPosts(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam("keyword") String keyword,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size) {
		
		Page<BoardPost> postPage = service.searchPosts(boardSeq, keyword, page, size);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", postPage.getContent());
		map.put("total", postPage.getTotalElements());
		map.put("totalPages", postPage.getTotalPages());
		map.put("currentPage", postPage.getNumber());
		return map;
	}
	
	// 고급 검색 (제목, 내용, 작성자, 날짜 범위)
	@GetMapping("/board/post/advanced-search")
	public Map<String, Object> advancedSearch(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "memberId", required = false) String memberId,
			@RequestParam(value = "startDate", required = false) String startDate,
			@RequestParam(value = "endDate", required = false) String endDate,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size) {
		
		Date start = null;
		Date end = null;
		
		try {
			if(startDate != null && !startDate.isEmpty()) {
				start = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(startDate);
			}
			if(endDate != null && !endDate.isEmpty()) {
				// 종료일은 하루 끝까지 포함
				java.util.Calendar cal = java.util.Calendar.getInstance();
				cal.setTime(new java.text.SimpleDateFormat("yyyy-MM-dd").parse(endDate));
				cal.set(Calendar.HOUR_OF_DAY, 23);
				cal.set(Calendar.MINUTE, 59);
				cal.set(Calendar.SECOND, 59);
				end = cal.getTime();
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		Page<BoardPost> postPage = service.advancedSearch(boardSeq, keyword, memberId, start, end, page, size);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", postPage.getContent());
		map.put("total", postPage.getTotalElements());
		map.put("totalPages", postPage.getTotalPages());
		map.put("currentPage", postPage.getNumber());
		return map;
	}
}

