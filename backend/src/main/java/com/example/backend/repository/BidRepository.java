package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Bid;

public interface BidRepository extends JpaRepository<Bid, Integer> {
	// 게시글 번호로 입찰 목록 조회 (금액 내림차순)
	@Query(value = "select * from BID1 where IMAGEBOARD_SEQ = :seq and STATUS = '유효' order by BID_AMOUNT desc, BID_TIME desc", nativeQuery = true)
	List<Bid> findByImageboardSeqOrderByBidAmountDesc(@Param("seq") int seq);
	
	// 게시글 번호로 최고 입찰 금액 조회
	@Query(value = "select max(BID_AMOUNT) from BID1 where IMAGEBOARD_SEQ = :seq and STATUS = '유효'", nativeQuery = true)
	Integer findMaxBidAmountByImageboardSeq(@Param("seq") int seq);
	
	// 게시글 번호로 입찰 수 조회
	@Query(value = "select count(*) from BID1 where IMAGEBOARD_SEQ = :seq and STATUS = '유효'", nativeQuery = true)
	int countByImageboardSeq(@Param("seq") int seq);
	
	// 게시글 번호로 입찰 목록 조회 (상위 N개)
	@Query(value = "select * from (select * from BID1 where IMAGEBOARD_SEQ = :seq and STATUS = '유효' order by BID_AMOUNT desc, BID_TIME desc) where rownum <= :limit", nativeQuery = true)
	List<Bid> findTopBidsByImageboardSeq(@Param("seq") int seq, @Param("limit") int limit);
}

