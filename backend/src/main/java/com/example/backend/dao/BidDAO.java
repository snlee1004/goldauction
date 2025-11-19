package com.example.backend.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.BidDTO;
import com.example.backend.entity.Bid;
import com.example.backend.repository.BidRepository;

@Repository
public class BidDAO {
	@Autowired
	BidRepository repository;
	
	// 입찰 저장
	public Bid save(BidDTO dto) {
		return repository.save(dto.toEntity());
	}
	
	// 게시글 번호로 입찰 목록 조회
	public List<Bid> findByImageboardSeq(int imageboardSeq) {
		return repository.findByImageboardSeqOrderByBidAmountDesc(imageboardSeq);
	}
	
	// 게시글 번호로 최고 입찰 금액 조회
	public Integer findMaxBidAmountByImageboardSeq(int imageboardSeq) {
		return repository.findMaxBidAmountByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 입찰 수 조회
	public int countByImageboardSeq(int imageboardSeq) {
		return repository.countByImageboardSeq(imageboardSeq);
	}
	
	// 게시글 번호로 상위 입찰 목록 조회
	public List<Bid> findTopBidsByImageboardSeq(int imageboardSeq, int limit) {
		return repository.findTopBidsByImageboardSeq(imageboardSeq, limit);
	}
}

