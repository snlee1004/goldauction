package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.BidDAO;
import com.example.backend.dto.BidDTO;
import com.example.backend.entity.Bid;

@Service
public class BidService {
	@Autowired
	BidDAO dao;
	
	// 입찰 저장
	public Bid save(BidDTO dto) {
		return dao.save(dto);
	}
	
	// 게시글 번호로 입찰 목록 조회
	public List<Bid> getBidsByImageboardSeq(int imageboardSeq) {
		return dao.findByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 최고 입찰 금액 조회
	public Integer getMaxBidAmountByImageboardSeq(int imageboardSeq) {
		return dao.findMaxBidAmountByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 입찰 수 조회
	public int getBidCountByImageboardSeq(int imageboardSeq) {
		return dao.countByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 상위 입찰 목록 조회
	public List<Bid> getTopBidsByImageboardSeq(int imageboardSeq, int limit) {
		return dao.findTopBidsByImageboardSeq(imageboardSeq, limit);
	}
	
	// 입찰 취소
	public Bid cancelBid(int bidSeq) {
		return dao.cancelBid(bidSeq);
	}
	
	// 입찰자 ID로 입찰 목록 조회
	public List<Bid> getBidsByBidderId(String bidderId) {
		return dao.findByBidderId(bidderId);
	}
	
	// 게시글 번호로 낙찰된 입찰 조회
	public List<Bid> getAwardedBidsByImageboardSeq(int imageboardSeq) {
		return dao.findAwardedBidsByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 최고 입찰 금액의 입찰 조회
	public Bid getTopBidByImageboardSeq(int imageboardSeq) {
		return dao.findTopBidByImageboardSeq(imageboardSeq);
	}
	
	// 입찰 낙찰 처리
	public Bid awardBid(int bidSeq) {
		return dao.awardBid(bidSeq);
	}
	
	// 입찰자 ID로 낙찰된 입찰 목록 조회
	public List<Bid> getAwardedBidsByBidderId(String bidderId) {
		return dao.findAwardedBidsByBidderId(bidderId);
	}
}

