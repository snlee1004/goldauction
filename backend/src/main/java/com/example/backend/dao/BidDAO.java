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
	
	// 입찰 취소 (bidSeq로 입찰 찾아서 status를 "취소"로 변경)
	public Bid cancelBid(int bidSeq) {
		Bid bid = repository.findById(bidSeq).orElse(null);
		if(bid != null) {
			BidDTO dto = new BidDTO();
			dto.setBidSeq(bid.getBidSeq());
			dto.setImageboardSeq(bid.getImageboardSeq());
			dto.setBidderId(bid.getBidderId());
			dto.setBidAmount(bid.getBidAmount());
			dto.setBidTime(bid.getBidTime());
			dto.setStatus("취소");
			return repository.save(dto.toEntity());
		}
		return null;
	}
	
	// 입찰자 ID로 입찰 목록 조회
	public List<Bid> findByBidderId(String bidderId) {
		return repository.findByBidderId(bidderId);
	}
}

