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
	// 3-2. 카테고리와 검색어가 포함된 목록
	public List<Imageboard> imageboardListByKeywordAndCategory(String keyword, String category, int startNum, int endNum) {
		return imageboardRepository.findByKeywordAndCategoryAndStartnumAndEndnum(keyword, category, startNum, endNum);
	}
	// 3-3. 카테고리와 검색어가 포함된 총글수
	public int getCountByKeywordAndCategory(String keyword, String category) {
		return imageboardRepository.getCountByKeywordAndCategory(keyword, category);
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
	// 7. 경매 포기
	public Imageboard cancelAuction(int seq) {
		Imageboard imageboard = imageboardRepository.findById(seq).orElse(null);
		if(imageboard != null) {
			ImageboardDTO dto = new ImageboardDTO();
			dto.setSeq(seq);
			dto.setImageId(imageboard.getImageid());
			dto.setImageName(imageboard.getImagename());
			dto.setImagePrice(imageboard.getImageprice());
			dto.setImageQty(imageboard.getImageqty());
			dto.setImageContent(imageboard.getImagecontent());
			dto.setImage1(imageboard.getImage1());
			dto.setCategory(imageboard.getCategory());
			dto.setAuctionPeriod(imageboard.getAuctionPeriod());
			dto.setTransactionMethod(imageboard.getTransactionMethod());
			dto.setAuctionStartDate(imageboard.getAuctionStartDate());
			dto.setAuctionEndDate(imageboard.getAuctionEndDate());
			dto.setStatus("포기");
			dto.setLogtime(imageboard.getLogtime());
			return imageboardRepository.save(dto.toEntity());
		}
		return null;
	}
	// 8. 포기된 경매 목록 조회
	public List<Imageboard> getCanceledList(int startNum, int endNum) {
		return imageboardRepository.findByStatusAndStartnumAndEndnum("포기", startNum, endNum);
	}
	// 9. 포기된 경매 총 개수
	public int getCanceledCount() {
		return imageboardRepository.countByStatus("포기");
	}
	// 10. 회원 ID로 경매 목록 조회
	public List<Imageboard> getListByMemberId(String memberId) {
		return imageboardRepository.findByImageid(memberId);
	}
	// 11. 회원 ID와 상태로 경매 목록 조회
	public List<Imageboard> getListByMemberIdAndStatus(String memberId, String status) {
		return imageboardRepository.findByImageidAndStatus(memberId, status);
	}
}
