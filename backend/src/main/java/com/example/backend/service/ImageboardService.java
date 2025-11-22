package com.example.backend.service;

import java.util.Calendar;
import java.util.Date;
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
	
	// 경매 종료일 계산
	private Date calculateAuctionEndDate(Date startDate, String auctionPeriod) {
		if(startDate == null || auctionPeriod == null || auctionPeriod.isEmpty()) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(startDate);
		
		if(auctionPeriod.equals("7일후")) {
			cal.add(Calendar.DAY_OF_MONTH, 7);
		} else if(auctionPeriod.equals("14일후")) {
			cal.add(Calendar.DAY_OF_MONTH, 14);
		} else if(auctionPeriod.equals("21일후")) {
			cal.add(Calendar.DAY_OF_MONTH, 21);
		} else if(auctionPeriod.equals("30일후")) {
			cal.add(Calendar.DAY_OF_MONTH, 30);
		}
		
		return cal.getTime();
	}
	
	// 1. 글저장
	public Imageboard imageboardWrite(ImageboardDTO dto) {
		// 경매 시작일 설정 (없으면 현재 날짜)
		if(dto.getAuctionStartDate() == null) {
			dto.setAuctionStartDate(new Date());
		}
		// 경매 종료일이 이미 설정되어 있으면 재계산하지 않음 (Controller에서 날짜/시간 형식으로 파싱한 경우)
		if(dto.getAuctionEndDate() == null && dto.getAuctionPeriod() != null && !dto.getAuctionPeriod().isEmpty()) {
			// "7일후", "14일후" 같은 형식인 경우에만 계산
			if(dto.getAuctionPeriod().equals("7일후") || dto.getAuctionPeriod().equals("14일후") 
				|| dto.getAuctionPeriod().equals("21일후") || dto.getAuctionPeriod().equals("30일후")) {
				dto.setAuctionEndDate(calculateAuctionEndDate(dto.getAuctionStartDate(), dto.getAuctionPeriod()));
			}
		}
		// 상태 기본값 설정
		if(dto.getStatus() == null || dto.getStatus().isEmpty()) {
			dto.setStatus("진행중");
		}
		return dao.imageboardWrite(dto);
	}
	// 2. 글 목록
	public List<Imageboard> imageboardList(int startNum, int endNum) {
		return dao.imageboardList(startNum, endNum);
	}
	// 2-1. 검색 목록
	public List<Imageboard> imageboardListByKeyword(String keyword, int startNum, int endNum) {
		return dao.imageboardListByKeyword(keyword, startNum, endNum);
	}
	// 3. 총글수
	public int getCount() {
		return dao.getCount();
	}
	// 3-1. 검색어가 포함된 총글수
	public int getCountByKeyword(String keyword) {
		return dao.getCountByKeyword(keyword);
	}
	// 3-2. 카테고리와 검색어가 포함된 목록
	public List<Imageboard> imageboardListByKeywordAndCategory(String keyword, String category, int startNum, int endNum) {
		return dao.imageboardListByKeywordAndCategory(keyword, category, startNum, endNum);
	}
	// 3-3. 카테고리와 검색어가 포함된 총글수
	public int getCountByKeywordAndCategory(String keyword, String category) {
		return dao.getCountByKeywordAndCategory(keyword, category);
	}
	// 4. 상세보기
	public Imageboard imageboardView(int seq) {
		return dao.imageboardView(seq);
	}
	// 5. 삭제
	public boolean imageboardDelete(int seq) {
		return dao.imageboardDelete(seq); 
	}
	// 6. 수정
	public Imageboard imageboardModify(ImageboardDTO dto) {
		// 경매 종료일이 이미 설정되어 있으면 재계산하지 않음 (즉시 구매 등)
		if(dto.getAuctionEndDate() == null && dto.getAuctionPeriod() != null && !dto.getAuctionPeriod().isEmpty()) {
			Date startDate = dto.getAuctionStartDate();
			if(startDate == null) {
				// 기존 데이터에서 시작일 가져오기
				Imageboard existing = dao.imageboardView(dto.getSeq());
				if(existing != null) {
					startDate = existing.getAuctionStartDate();
					if(startDate == null) {
						startDate = new Date();
					}
				} else {
					startDate = new Date();
				}
				dto.setAuctionStartDate(startDate);
			}
			dto.setAuctionEndDate(calculateAuctionEndDate(startDate, dto.getAuctionPeriod()));
		}
		return dao.imageboardModify(dto);
	}
	// 7. 경매 포기
	public Imageboard cancelAuction(int seq) {
		Imageboard imageboard = dao.imageboardView(seq);
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
			return dao.imageboardModify(dto);
		}
		return null;
	}
	// 8. 포기된 경매 목록 조회
	public List<Imageboard> getCanceledList(int startNum, int endNum) {
		return dao.getCanceledList(startNum, endNum);
	}
	// 9. 포기된 경매 총 개수
	public int getCanceledCount() {
		return dao.getCanceledCount();
	}
	// 10. 회원 ID로 경매 목록 조회
	public List<Imageboard> getListByMemberId(String memberId) {
		return dao.getListByMemberId(memberId);
	}
	// 11. 회원 ID와 상태로 경매 목록 조회
	public List<Imageboard> getListByMemberIdAndStatus(String memberId, String status) {
		return dao.getListByMemberIdAndStatus(memberId, status);
	}
}
