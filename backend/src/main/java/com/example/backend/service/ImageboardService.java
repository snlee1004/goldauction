package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.ImageboardDAO;
import com.example.backend.dto.ImageboardDTO;
import com.example.backend.entity.Imageboard;


@Service
public class ImageboardService {
	@Autowired
	ImageboardDAO dao;
	
	// 1. 글저장
	public Imageboard imageboardWrite(ImageboardDTO dto) {
		return dao.imageboardWrite(dto);
	}
	// 2. 글 목록
	public List<Imageboard> imageboardList(int startNum, int endNum) {
		return dao.imageboardList(startNum, endNum);
	}
	// 3. 총글수
	public int getCount() {
		return dao.getCount();
	}
	// 4. 상세보기
	public Imageboard imageboardView(int seq) {
		return dao.imageboardView(seq);
	}
	// 5. 삭제
	public boolean imageboardDelete(int seq) {
		return dao.imageboardDelete(seq); 
	}
}
