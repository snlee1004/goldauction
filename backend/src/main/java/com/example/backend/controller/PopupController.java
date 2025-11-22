package com.example.backend.controller;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.PopupDTO;
import com.example.backend.entity.Popup;
import com.example.backend.service.PopupService;

@RestController
public class PopupController {
	@Autowired
	PopupService service;
	
	@Value("${project.upload.path}")
	private String uploadpath;
	
	// 팝업 목록 조회
	@GetMapping("/popup/list")
	public Map<String, Object> getPopupList() {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			List<Popup> popupList = service.getAllPopups();
			map.put("rt", "OK");
			map.put("items", popupList);
			map.put("total", popupList.size());
		} catch(Exception e) {
			System.err.println("팝업 목록 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "팝업 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new java.util.ArrayList<>());
		}
		return map;
	}
	
	// 노출 중인 팝업 조회 (Intro.jsx에서 사용)
	@GetMapping("/popup/visible")
	public Map<String, Object> getVisiblePopups() {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			List<Popup> popupList = service.getVisiblePopups();
			map.put("rt", "OK");
			map.put("items", popupList);
		} catch(Exception e) {
			System.err.println("노출 팝업 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "노출 팝업 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new java.util.ArrayList<>());
		}
		return map;
	}
	
	// 팝업 조회
	@GetMapping("/popup/get")
	public Map<String, Object> getPopup(@RequestParam("popupSeq") int popupSeq) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			Popup popup = service.getPopup(popupSeq);
			if(popup != null) {
				map.put("rt", "OK");
				map.put("popup", popup);
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "팝업을 찾을 수 없습니다.");
			}
		} catch(Exception e) {
			System.err.println("팝업 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "팝업 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 팝업 저장/수정
	@PostMapping("/popup/save")
	public Map<String, Object> savePopup(
			@RequestParam(value="popupSeq", required=false) Integer popupSeq,
			@RequestParam(value="popupTitle", required=false) String popupTitle,
			@RequestParam(value="popupContent", required=false) String popupContent,
			@RequestParam(value="backgroundImage", required=false) String backgroundImage,
			@RequestParam(value="isVisible", required=false) String isVisible,
			@RequestParam(value="popupType", required=false) String popupType,
			@RequestParam(value="startDate", required=false) String startDate,
			@RequestParam(value="endDate", required=false) String endDate,
			@RequestParam(value="imageFile", required=false) MultipartFile imageFile) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			System.out.println("팝업 저장 요청 받음 - popupSeq: " + popupSeq + ", title: " + popupTitle);
			
			PopupDTO dto = new PopupDTO();
			
			// popupSeq 처리 (null이거나 0이면 새로 생성, 아니면 수정)
			if(popupSeq == null) {
				popupSeq = 0;
			}
			dto.setPopupSeq(popupSeq);
			
			// 기본 정보 설정
			dto.setPopupTitle(popupTitle);
			dto.setPopupContent(popupContent);
			dto.setIsVisible(isVisible);
			if(dto.getIsVisible() == null || dto.getIsVisible().isEmpty()) {
				dto.setIsVisible("N");
			}
			dto.setPopupType(popupType);
			if(dto.getPopupType() == null || dto.getPopupType().isEmpty()) {
				dto.setPopupType("공지사항");
			}
			
			// 이미지 파일 업로드 처리
			if(imageFile != null && !imageFile.isEmpty()) {
				try {
					String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
					File saveFile = new File(uploadpath, fileName);
					imageFile.transferTo(saveFile);
					dto.setBackgroundImage(fileName);
					System.out.println("이미지 저장 성공: " + fileName);
				} catch(Exception e) {
					System.err.println("이미지 저장 오류: " + e.getMessage());
					e.printStackTrace();
					// 이미지 저장 실패해도 계속 진행 (기존 이미지 유지)
					if(backgroundImage != null && !backgroundImage.isEmpty()) {
						dto.setBackgroundImage(backgroundImage);
					}
				}
			} else {
				// 이미지 파일이 없으면 기존 이미지 경로 유지
				dto.setBackgroundImage(backgroundImage);
			}
			
			// 날짜 파싱
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			sdf.setLenient(false);
			if(startDate != null && !startDate.trim().isEmpty()) {
				try {
					dto.setStartDate(sdf.parse(startDate));
					System.out.println("시작일 파싱 성공: " + dto.getStartDate());
				} catch(Exception e) {
					System.err.println("시작일 파싱 오류: " + startDate + " - " + e.getMessage());
				}
			}
			if(endDate != null && !endDate.trim().isEmpty()) {
				try {
					dto.setEndDate(sdf.parse(endDate));
					System.out.println("종료일 파싱 성공: " + dto.getEndDate());
				} catch(Exception e) {
					System.err.println("종료일 파싱 오류: " + endDate + " - " + e.getMessage());
				}
			}
			
			// 등록일시 설정
			if(dto.getLogtime() == null) {
				dto.setLogtime(new Date());
			}
			
			System.out.println("팝업 저장 DTO - popupSeq: " + dto.getPopupSeq() + ", title: " + dto.getPopupTitle() + 
							   ", isVisible: " + dto.getIsVisible() + ", popupType: " + dto.getPopupType());
			
			Popup popup = service.save(dto);
			if(popup != null) {
				map.put("rt", "OK");
				map.put("msg", "팝업이 저장되었습니다.");
				map.put("popup", popup);
				System.out.println("팝업 저장 성공 - popupSeq: " + popup.getPopupSeq());
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "팝업 저장에 실패했습니다.");
				System.err.println("팝업 저장 실패 - popup이 null입니다.");
			}
		} catch(Exception e) {
			System.err.println("팝업 저장 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "팝업 저장 중 오류가 발생했습니다: " + e.getMessage());
			// 스택 트레이스 전체 출력
			java.io.StringWriter sw = new java.io.StringWriter();
			java.io.PrintWriter pw = new java.io.PrintWriter(sw);
			e.printStackTrace(pw);
			map.put("stackTrace", sw.toString());
		}
		return map;
	}
	
	// 팝업 삭제
	@PostMapping("/popup/delete")
	public Map<String, Object> deletePopup(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			int popupSeq = Integer.parseInt(params.get("popupSeq").toString());
			int result = service.deletePopup(popupSeq);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", "팝업이 삭제되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "팝업 삭제에 실패했습니다.");
			}
		} catch(Exception e) {
			System.err.println("팝업 삭제 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "팝업 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 팝업 노출 상태 변경
	@PostMapping("/popup/updateVisibility")
	public Map<String, Object> updateVisibility(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			int popupSeq = Integer.parseInt(params.get("popupSeq").toString());
			String isVisible = params.get("isVisible").toString();
			int result = service.updateVisibility(popupSeq, isVisible);
			if(result == 1) {
				map.put("rt", "OK");
				map.put("msg", isVisible.equals("Y") ? "팝업이 노출됩니다." : "팝업이 비노출됩니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "팝업 상태 변경에 실패했습니다.");
			}
		} catch(Exception e) {
			System.err.println("팝업 상태 변경 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "팝업 상태 변경 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
}

