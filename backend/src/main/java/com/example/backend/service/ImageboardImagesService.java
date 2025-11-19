package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.ImageboardImagesDAO;
import com.example.backend.dto.ImageboardImagesDTO;
import com.example.backend.entity.ImageboardImages;

@Service
public class ImageboardImagesService {
	@Autowired
	ImageboardImagesDAO dao;
	
	// 이미지 저장
	public ImageboardImages save(ImageboardImagesDTO dto) {
		return dao.save(dto);
	}
	
	// 게시글 번호로 이미지 목록 조회
	public List<ImageboardImages> getImagesByImageboardSeq(int imageboardSeq) {
		return dao.findByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 이미지 삭제
	public void deleteByImageboardSeq(int imageboardSeq) {
		dao.deleteByImageboardSeq(imageboardSeq);
	}
}

