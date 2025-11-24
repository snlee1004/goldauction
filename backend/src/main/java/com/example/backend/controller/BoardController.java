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

import com.example.backend.dto.BoardDTO;
import com.example.backend.entity.Board;
import com.example.backend.service.BoardService;

@RestController
public class BoardController {
	@Autowired
	BoardService service;
	
	// 게시판 생성
	@PostMapping("/board/create")
	public Map<String, Object> createBoard(@RequestBody BoardDTO dto) {
		int result = service.write(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "게시판이 생성되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시판 생성에 실패했습니다.");
		}
		return map;
	}
	
	// 게시판 목록 조회
	@GetMapping("/board/list")
	public Map<String, Object> getBoardList(@RequestParam(value = "boardType", required = false) String boardType) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			List<Board> list;
			
			if(boardType != null && !boardType.isEmpty()) {
				// 타입별 조회
				list = service.getBoardListByType(boardType);
			} else {
				// 전체 조회
				list = service.getBoardList();
			}
			
			map.put("rt", "OK");
			map.put("list", list);
			map.put("total", list.size());
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "게시판 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("list", new java.util.ArrayList<Board>());
			map.put("total", 0);
		}
		
		return map;
	}
	
	// 게시판 상세 조회
	@GetMapping("/board/detail")
	public Map<String, Object> getBoardDetail(@RequestParam("boardSeq") Long boardSeq) {
		Board board = service.getBoard(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(board != null) {
			map.put("rt", "OK");
			map.put("board", board);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시판을 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 게시판 수정
	@PostMapping("/board/modify")
	public Map<String, Object> modifyBoard(@RequestBody BoardDTO dto) {
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "게시판이 수정되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시판 수정에 실패했습니다.");
		}
		return map;
	}
	
	// 게시판 삭제 (비활성화)
	@PostMapping("/board/delete")
	public Map<String, Object> deleteBoard(@RequestBody Map<String, Long> params) {
		Long boardSeq = params.get("boardSeq");
		int result = service.delete(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "게시판이 비활성화되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "게시판 비활성화에 실패했습니다.");
		}
		return map;
	}
	
	// 게시판 완전 삭제 (DB에서 영구 삭제, CASCADE로 관련 데이터 자동 삭제)
	@PostMapping("/board/delete-permanent")
	public Map<String, Object> deleteBoardPermanent(@RequestBody Map<String, Long> params) {
		Long boardSeq = params.get("boardSeq");
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			int result = service.deletePermanent(boardSeq);
			
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "게시판과 관련된 모든 데이터가 완전히 삭제되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "게시판 삭제에 실패했습니다.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "게시판 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
	
	// 게시판 검색
	@GetMapping("/board/search")
	public Map<String, Object> searchBoards(@RequestParam("keyword") String keyword) {
		List<Board> list = service.searchBoards(keyword);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
}

