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

import com.example.backend.dto.BoardNotificationDTO;
import com.example.backend.entity.BoardNotification;
import com.example.backend.service.BoardNotificationService;

@RestController
public class BoardNotificationController {
	@Autowired
	BoardNotificationService service;
	
	// 알림 생성
	@PostMapping("/board/notification/create")
	public Map<String, Object> createNotification(@RequestBody BoardNotificationDTO dto) {
		int result = service.create(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "알림이 생성되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "알림 생성에 실패했습니다.");
		}
		return map;
	}
	
	// 회원별 알림 목록 조회
	@GetMapping("/board/notification/list")
	public Map<String, Object> getNotificationList(@RequestParam("memberId") String memberId) {
		List<BoardNotification> list = service.getNotificationList(memberId);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 회원별 안읽은 알림 목록 조회
	@GetMapping("/board/notification/unread")
	public Map<String, Object> getUnreadNotificationList(@RequestParam("memberId") String memberId) {
		List<BoardNotification> list = service.getUnreadNotificationList(memberId);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 회원별 안읽은 알림 수 조회
	@GetMapping("/board/notification/unread-count")
	public Map<String, Object> getUnreadCount(@RequestParam("memberId") String memberId) {
		long count = service.getUnreadCount(memberId);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("count", count);
		return map;
	}
	
	// 알림 읽음 처리
	@PostMapping("/board/notification/read")
	public Map<String, Object> markAsRead(@RequestBody Map<String, Long> params) {
		Long notificationSeq = params.get("notificationSeq");
		int result = service.markAsRead(notificationSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "알림이 읽음 처리되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "알림 읽음 처리에 실패했습니다.");
		}
		return map;
	}
	
	// 회원의 모든 알림 읽음 처리
	@PostMapping("/board/notification/read-all")
	public Map<String, Object> markAllAsRead(@RequestBody Map<String, String> params) {
		String memberId = params.get("memberId");
		int count = service.markAllAsRead(memberId);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("msg", count + "개의 알림이 읽음 처리되었습니다.");
		map.put("count", count);
		return map;
	}
	
	// 알림 삭제
	@PostMapping("/board/notification/delete")
	public Map<String, Object> deleteNotification(@RequestBody Map<String, Long> params) {
		Long notificationSeq = params.get("notificationSeq");
		int result = service.delete(notificationSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "알림이 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "알림 삭제에 실패했습니다.");
		}
		return map;
	}
}

