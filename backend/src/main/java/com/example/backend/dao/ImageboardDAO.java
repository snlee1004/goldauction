package com.example.backend.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.ImageboardDTO;
import com.example.backend.entity.Imageboard;
import com.example.backend.repository.ImageboardRepository;


@Repository
public class ImageboardDAO {
	@Autowired
	ImageboardRepository imageboardRepository;
	
	// 1. 글저장
	public Imageboard imageboardWrite(ImageboardDTO dto) {
		return imageboardRepository.save(dto.toEntity());
	}
	// 2. 목록
	public List<Imageboard> imageboardList(int startNum, int endNum) {
		return imageboardRepository.findByStartnumAndEndnum(startNum, endNum);
	}
	// 2-1. 검색 목록
	public List<Imageboard> imageboardListByKeyword(String keyword, int startNum, int endNum) {
		return imageboardRepository.findByKeywordAndStartnumAndEndnum(keyword, startNum, endNum);
	}
	// 3. 총글수
	public int getCount() {
		return (int) imageboardRepository.count();
	}
	// 3-1. 검색어가 포함된 총글수
	public int getCountByKeyword(String keyword) {
		return imageboardRepository.getCountByKeyword(keyword);
	}
	// 4. 상세보기
	public Imageboard imageboardView(int seq) {
		return imageboardRepository.findById(seq).orElse(null);
	}
	// 5. 삭제
	public boolean imageboardDelete(int seq) {
		// 1) 기존 데이터 가져오기
		Imageboard imageboard = imageboardRepository.findById(seq).orElse(null);
		// 2) 있으면 삭제
		if(imageboard != null) {
			imageboardRepository.delete(imageboard); 
			return !imageboardRepository.existsById(seq);
		}
		return false;
	}
	// 6. 수정
	public Imageboard imageboardModify(ImageboardDTO dto) {
		Imageboard imageboard = imageboardRepository.findById(dto.getSeq()).orElse(null);
		if(imageboard != null) {
			return imageboardRepository.save(dto.toEntity());
		}
		return null;
	}
}
