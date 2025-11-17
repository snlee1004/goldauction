package com.example.backend.controller;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.ImageboardDTO;
import com.example.backend.entity.Imageboard;
import com.example.backend.service.ImageboardService;




@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ImageboardController {
	@Autowired
	ImageboardService service;
	
	@Value("${project.upload.path}")
	private String uploadpath;  // 파일 저장 폴더 경로 저장
	
	// 1. 저장
	@PostMapping("/imageboard/imageboardWrite")
	public Map<String, Object> imageboardWrite(ImageboardDTO dto,
			@RequestParam(value="img", required=false) MultipartFile uploadFile) {
		System.out.println(dto.toString());
		// 1. 데이터 처리
		// 저장 폴더 만들기
		File folder = new File(uploadpath);
		if(!folder.exists()) {
			folder.mkdirs();
		}
		// 파일이 있으면 저장
		if(uploadFile != null) {
			String fileName = uploadFile.getOriginalFilename();
			File file = new File(uploadpath, fileName);
			try {
				uploadFile.transferTo(file);
			} catch (IllegalStateException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			// dto에 파일명 저장
			dto.setImage1(fileName);
		}
		// dto에 등록일 저장
		dto.setLogtime(new Date());
		// db에 저장
		Imageboard imageboard = service.imageboardWrite(dto);
		
		// 2. 결과 응답
		Map<String, Object> map = new HashMap<String, Object>();
		if(imageboard != null) map.put("rt", "OK");
		else map.put("rt", "FAIL");
		return map;
	}
	// 2. 목록
	@GetMapping("/imageboard/imageboardList")
	public Map<String, Object> imageboardList(@RequestParam(value="pg", defaultValue="1") int pg) {
		// 1. 데이터 처리
		// 목록 : 5개
		int endNum = pg * 5;
		int startNum = endNum - 4;
		List<Imageboard> list = service.imageboardList(startNum, endNum);
		// 페이징 : 3블럭
		int totalA = service.getCount();
		int totalP = (totalA + 4) / 5;
		int startPage = (pg-1)/3*3 + 1;
		int endPage = startPage + 2;
		if(endPage > totalP) endPage = totalP;
		// 2. 결과 응답
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("total", list.size());
		map.put("pg", pg);
		map.put("totalP", totalP);
		map.put("startPage", startPage);
		map.put("endPage", endPage);
		map.put("items", list);
		return map;
	}
	// 3. 상세보기
	@GetMapping("/imageboard/imageboardView")
	public Map<String, Object> imageboardView(@RequestParam("seq") int seq) {
		// 1. 데이터 처리
		Imageboard imageboard = service.imageboardView(seq);
		// 2. 결과 응답
		Map<String, Object> map = new HashMap<String, Object>();
		if(imageboard != null) {
			map.put("rt", "OK");
			map.put("total", 1);
			map.put("item", imageboard);
		} else {
			map.put("rt", "FAIL");
		}
		return map;
	}
	// 4. 삭제
	@GetMapping("/imageboard/imageboardDelete")
	public Map<String, Object> imageboardDelete(@RequestParam("seq") int seq) {
		// 1. 데이터 처리
		boolean result = service.imageboardDelete(seq);
		// 2. 결과 응답
		Map<String, Object> map = new HashMap<String, Object>();
		if(result) {
			map.put("rt", "OK");
		} else {
			map.put("rt", "FAIL");
		}
		return map;
	}
}

