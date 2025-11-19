package com.example.backend.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.ImageboardImagesDTO;
import com.example.backend.entity.ImageboardImages;
import com.example.backend.repository.ImageboardImagesRepository;

@Repository
public class ImageboardImagesDAO {
	@Autowired
	ImageboardImagesRepository repository;
	
	// 이미지 저장
	public ImageboardImages save(ImageboardImagesDTO dto) {
		return repository.save(dto.toEntity());
	}
	
	// 게시글 번호로 이미지 목록 조회
	public List<ImageboardImages> findByImageboardSeq(int imageboardSeq) {
		return repository.findByImageboardSeqOrderByImageOrder(imageboardSeq);
	}
	
	// 게시글 번호로 이미지 삭제
	public void deleteByImageboardSeq(int imageboardSeq) {
		repository.deleteByImageboardSeq(imageboardSeq);
	}
}

