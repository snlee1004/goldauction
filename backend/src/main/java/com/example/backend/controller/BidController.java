package com.example.backend.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.BidDTO;
import com.example.backend.entity.Bid;
import com.example.backend.entity.Member;
import com.example.backend.service.BidService;
import com.example.backend.service.MemberService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class BidController {
	@Autowired
	BidService service;
	
	@Autowired
	MemberService memberService;
	
	// 입찰 등록
	@PostMapping("/bid/write")
	public Map<String, Object> bidWrite(@RequestBody Map<String, Object> params) {
		int imageboardSeq = Integer.parseInt(params.get("imageboardSeq").toString());
		String bidderId = params.get("bidderId").toString();
		int bidAmount = Integer.parseInt(params.get("bidAmount").toString());
		
		BidDTO dto = new BidDTO();
		dto.setImageboardSeq(imageboardSeq);
		dto.setBidderId(bidderId);
		dto.setBidAmount(bidAmount);
		dto.setBidTime(new Date());
		dto.setStatus("유효");
		
		Bid bid = service.save(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(bid != null) {
			map.put("rt", "OK");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "입찰 등록에 실패했습니다.");
		}
		return map;
	}
	
	// 게시글 번호로 입찰 목록 조회
	@GetMapping("/bid/list")
	public Map<String, Object> bidList(@RequestParam("imageboardSeq") int imageboardSeq) {
		List<Bid> list = service.getBidsByImageboardSeq(imageboardSeq);
		
		// 각 입찰자에 닉네임 추가
		List<Map<String, Object>> itemsWithNickname = new java.util.ArrayList<>();
		for(Bid bid : list) {
			Map<String, Object> itemMap = new HashMap<>();
			itemMap.put("bidSeq", bid.getBidSeq());
			itemMap.put("imageboardSeq", bid.getImageboardSeq());
			itemMap.put("bidderId", bid.getBidderId());
			itemMap.put("bidAmount", bid.getBidAmount());
			itemMap.put("bidTime", bid.getBidTime());
			itemMap.put("status", bid.getStatus());
			
			// 입찰자 닉네임 조회
			Member member = memberService.getMember(bid.getBidderId());
			if(member != null && member.getNickname() != null && !member.getNickname().isEmpty()) {
				itemMap.put("bidderNickname", member.getNickname());
			} else {
				itemMap.put("bidderNickname", bid.getBidderId()); // 닉네임이 없으면 ID 사용
			}
			
			itemsWithNickname.add(itemMap);
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("items", itemsWithNickname);
		return map;
	}
	
	// 게시글 번호로 최고 입찰 금액 조회
	@GetMapping("/bid/maxAmount")
	public Map<String, Object> getMaxBidAmount(@RequestParam("imageboardSeq") int imageboardSeq) {
		Integer maxAmount = service.getMaxBidAmountByImageboardSeq(imageboardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("maxAmount", maxAmount != null ? maxAmount : 0);
		return map;
	}
	
	// 게시글 번호로 입찰 수 조회
	@GetMapping("/bid/count")
	public Map<String, Object> getBidCount(@RequestParam("imageboardSeq") int imageboardSeq) {
		int count = service.getBidCountByImageboardSeq(imageboardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("count", count);
		return map;
	}
	
	// 게시글 번호로 상위 입찰 목록 조회
	@GetMapping("/bid/topList")
	public Map<String, Object> getTopBids(@RequestParam("imageboardSeq") int imageboardSeq,
										   @RequestParam(value="limit", defaultValue="10") int limit) {
		List<Bid> list = service.getTopBidsByImageboardSeq(imageboardSeq, limit);
		
		// 각 입찰자에 닉네임 추가
		List<Map<String, Object>> itemsWithNickname = new java.util.ArrayList<>();
		for(Bid bid : list) {
			Map<String, Object> itemMap = new HashMap<>();
			itemMap.put("bidSeq", bid.getBidSeq());
			itemMap.put("imageboardSeq", bid.getImageboardSeq());
			itemMap.put("bidderId", bid.getBidderId());
			itemMap.put("bidAmount", bid.getBidAmount());
			itemMap.put("bidTime", bid.getBidTime());
			itemMap.put("status", bid.getStatus());
			
			// 입찰자 닉네임 조회
			Member member = memberService.getMember(bid.getBidderId());
			if(member != null && member.getNickname() != null && !member.getNickname().isEmpty()) {
				itemMap.put("bidderNickname", member.getNickname());
			} else {
				itemMap.put("bidderNickname", bid.getBidderId()); // 닉네임이 없으면 ID 사용
			}
			
			itemsWithNickname.add(itemMap);
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("items", itemsWithNickname);
		return map;
	}
}

