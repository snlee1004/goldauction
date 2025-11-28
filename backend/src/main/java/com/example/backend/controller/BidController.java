package com.example.backend.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.BidDTO;
import com.example.backend.entity.Bid;
import com.example.backend.entity.Imageboard;
import com.example.backend.entity.Member;
import com.example.backend.service.BidService;
import com.example.backend.service.ImageboardService;
import com.example.backend.service.MemberService;

@RestController
public class BidController {
	@Autowired
	BidService service;
	
	@Autowired
	MemberService memberService;
	
	@Autowired
	ImageboardService imageboardService;
	
	// 입찰 등록
	@PostMapping("/bid/write")
	public Map<String, Object> bidWrite(@RequestBody Map<String, Object> params) {
		int imageboardSeq = Integer.parseInt(params.get("imageboardSeq").toString());
		String bidderId = params.get("bidderId").toString();
		int bidAmount = Integer.parseInt(params.get("bidAmount").toString());
		
		// 경매 정보 조회
		Imageboard imageboard = imageboardService.imageboardView(imageboardSeq);
		if(imageboard == null) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "경매 정보를 찾을 수 없습니다.");
			return map;
		}
		
		// 작성자는 자신이 등록한 상품에 입찰할 수 없음
		if(imageboard.getImageid() != null && imageboard.getImageid().equals(bidderId)) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "자신이 등록한 상품에는 입찰할 수 없습니다.");
			return map;
		}
		
		// 경매가 이미 종료되었는지 확인
		if("판매완료".equals(imageboard.getStatus()) || "종료".equals(imageboard.getStatus())) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "이미 종료된 경매입니다.");
			return map;
		}
		
		BidDTO dto = new BidDTO();
		dto.setImageboardSeq(imageboardSeq);
		dto.setBidderId(bidderId);
		dto.setBidAmount(bidAmount);
		dto.setBidTime(new Date());
		dto.setStatus("유효");
		
		Bid bid = service.save(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(bid != null) {
			// 최고 낙찰 가격 체크 (즉시 구매)
			Integer maxBidPrice = imageboard.getMaxBidPrice();
			boolean immediatePurchase = false;
			
			if(maxBidPrice != null && maxBidPrice > 0 && bidAmount >= maxBidPrice) {
				// 즉시 구매 처리: 입찰을 낙찰 상태로 변경
				Bid awardedBid = service.awardBid(bid.getBidSeq());
				if(awardedBid != null) {
					System.out.println("즉시 구매 낙찰 처리 완료 (bidSeq: " + bid.getBidSeq() + ", bidderId: " + bid.getBidderId() + ")");
					
					// 경매 상태를 "판매완료"로 변경하고 종료일을 현재 시간으로 설정
					com.example.backend.dto.ImageboardDTO imageboardDto = new com.example.backend.dto.ImageboardDTO();
					imageboardDto.setSeq(imageboardSeq);
					imageboardDto.setImageId(imageboard.getImageid());
					imageboardDto.setImageName(imageboard.getImagename());
					imageboardDto.setImagePrice(imageboard.getImageprice());
					imageboardDto.setMaxBidPrice(imageboard.getMaxBidPrice());
					imageboardDto.setImageQty(imageboard.getImageqty());
					imageboardDto.setImageContent(imageboard.getImagecontent());
					imageboardDto.setImage1(imageboard.getImage1());
					imageboardDto.setCategory(imageboard.getCategory());
					imageboardDto.setAuctionPeriod(null); // null로 설정하여 종료일 재계산 방지
					imageboardDto.setTransactionMethod(imageboard.getTransactionMethod());
					imageboardDto.setAuctionStartDate(imageboard.getAuctionStartDate());
					imageboardDto.setAuctionEndDate(new Date()); // 즉시 종료
					imageboardDto.setStatus("판매완료");
					imageboardDto.setLogtime(imageboard.getLogtime());
					
					Imageboard updatedImageboard = imageboardService.imageboardModify(imageboardDto);
					if(updatedImageboard != null) {
						immediatePurchase = true;
					}
				}
			}
			
			map.put("rt", "OK");
			map.put("immediatePurchase", immediatePurchase);
			if(immediatePurchase) {
				map.put("msg", "즉시 구매가 완료되었습니다!");
			}
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
	
	// 입찰 취소
	@PostMapping("/bid/cancel")
	public Map<String, Object> cancelBid(@RequestParam("bidSeq") int bidSeq) {
		Bid bid = service.cancelBid(bidSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(bid != null) {
			map.put("rt", "OK");
			map.put("msg", "입찰이 취소되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "입찰 취소에 실패했습니다. 입찰 정보를 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 입찰자 ID로 낙찰된 경매 목록 조회 (구매완료)
	@GetMapping("/bid/awardedAuctionsByBidder")
	public Map<String, Object> getAwardedAuctionsByBidder(@RequestParam("bidderId") String bidderId) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			// 낙찰된 입찰 목록 조회
			List<Bid> awardedBidList = service.getAwardedBidsByBidderId(bidderId);
			if(awardedBidList == null) {
				awardedBidList = new java.util.ArrayList<>();
			}
			
			// 중복 제거를 위해 Set 사용
			java.util.Set<Integer> imageboardSeqSet = new java.util.HashSet<>();
			for(Bid bid : awardedBidList) {
				imageboardSeqSet.add(bid.getImageboardSeq());
			}
			
			// 경매 정보 조회
			List<Map<String, Object>> auctionList = new java.util.ArrayList<>();
			for(Integer seq : imageboardSeqSet) {
				Imageboard imageboard = imageboardService.imageboardView(seq);
				if(imageboard != null) {
					// 자신이 등록한 경매는 제외
					if(imageboard.getImageid() != null && imageboard.getImageid().equals(bidderId)) {
						continue;
					}
					
					// 판매완료 상태인 경매만 포함
					if(!"판매완료".equals(imageboard.getStatus())) {
						continue;
					}
					
					Map<String, Object> auctionInfo = new HashMap<>();
					auctionInfo.put("seq", imageboard.getSeq());
					auctionInfo.put("imagename", imageboard.getImagename());
					auctionInfo.put("imageprice", imageboard.getImageprice());
					auctionInfo.put("imageid", imageboard.getImageid());
					auctionInfo.put("status", imageboard.getStatus());
					auctionInfo.put("logtime", imageboard.getLogtime());
					auctionInfo.put("auctionEndDate", imageboard.getAuctionEndDate());
					
					// 해당 경매에서 이 입찰자의 낙찰 금액 찾기
					int awardedAmount = 0;
					for(Bid bid : awardedBidList) {
						if(bid.getImageboardSeq() == seq && bid.getBidAmount() > awardedAmount) {
							awardedAmount = bid.getBidAmount();
						}
					}
					auctionInfo.put("awardedAmount", awardedAmount);
					auctionList.add(auctionInfo);
				}
			}
			
			map.put("rt", "OK");
			map.put("items", auctionList);
			map.put("total", auctionList.size());
		} catch(Exception e) {
			System.out.println("낙찰된 경매 목록 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "낙찰된 경매 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new java.util.ArrayList<>());
			map.put("total", 0);
		}
		return map;
	}
	
	// 입찰자 ID로 입찰한 경매 목록 조회
	@GetMapping("/bid/auctionsByBidder")
	public Map<String, Object> getAuctionsByBidder(@RequestParam("bidderId") String bidderId) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			List<Bid> bidList = service.getBidsByBidderId(bidderId);
			if(bidList == null) {
				bidList = new java.util.ArrayList<>();
			}
			
			// 중복 제거를 위해 Set 사용
			java.util.Set<Integer> imageboardSeqSet = new java.util.HashSet<>();
			for(Bid bid : bidList) {
				imageboardSeqSet.add(bid.getImageboardSeq());
			}
			
			// 경매 정보 조회
			List<Map<String, Object>> auctionList = new java.util.ArrayList<>();
			for(Integer seq : imageboardSeqSet) {
				Imageboard imageboard = imageboardService.imageboardView(seq);
				if(imageboard != null) {
					// 자신이 등록한 경매는 제외 (imageid가 입찰자 ID와 같으면 제외)
					if(imageboard.getImageid() != null && imageboard.getImageid().equals(bidderId)) {
						System.out.println("자신이 등록한 경매 제외 (seq: " + seq + ", imageid: " + imageboard.getImageid() + ")");
						continue; // 자신이 등록한 경매는 목록에 포함하지 않음
					}
					
					Map<String, Object> auctionInfo = new HashMap<>();
					auctionInfo.put("seq", imageboard.getSeq());
					auctionInfo.put("imagename", imageboard.getImagename());
					auctionInfo.put("imageprice", imageboard.getImageprice());
					auctionInfo.put("imageid", imageboard.getImageid()); // 작성자 ID 추가
					auctionInfo.put("status", imageboard.getStatus());
					auctionInfo.put("logtime", imageboard.getLogtime());
					auctionInfo.put("auctionEndDate", imageboard.getAuctionEndDate());
					// 해당 경매에서 이 입찰자의 최고 입찰 금액 찾기
					int maxBidAmount = 0;
					for(Bid bid : bidList) {
						if(bid.getImageboardSeq() == seq && bid.getBidAmount() > maxBidAmount) {
							maxBidAmount = bid.getBidAmount();
						}
					}
					auctionInfo.put("myMaxBidAmount", maxBidAmount);
					auctionList.add(auctionInfo);
				}
			}
			
			map.put("rt", "OK");
			map.put("items", auctionList);
			map.put("total", auctionList.size());
		} catch(Exception e) {
			System.out.println("입찰자별 경매 목록 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "경매 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new java.util.ArrayList<>());
			map.put("total", 0);
		}
		return map;
	}
	
	// 거래 성립 정보 조회 (구매자/판매자 정보)
	@GetMapping("/bid/transactionInfo")
	public Map<String, Object> getTransactionInfo(@RequestParam("imageboardSeq") int imageboardSeq) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			// 경매 정보 조회
			Imageboard imageboard = imageboardService.imageboardView(imageboardSeq);
			if(imageboard == null) {
				map.put("rt", "FAIL");
				map.put("msg", "경매 정보를 찾을 수 없습니다.");
				return map;
			}
			
			// 낙찰된 입찰 조회 (낙찰 상태인 입찰)
			List<Bid> awardedBids = service.getAwardedBidsByImageboardSeq(imageboardSeq);
			
			// 낙찰된 입찰이 없으면 최고 입찰 금액의 입찰 조회 (자동 낙찰 처리)
			Bid topBid = null;
			if(awardedBids == null || awardedBids.isEmpty()) {
				// 최고 입찰 금액의 입찰 조회
				topBid = service.getTopBidByImageboardSeq(imageboardSeq);
				if(topBid != null && "판매완료".equals(imageboard.getStatus())) {
					// 자동 낙찰 처리
					topBid = service.awardBid(topBid.getBidSeq());
					awardedBids = new java.util.ArrayList<>();
					awardedBids.add(topBid);
				}
			} else {
				topBid = awardedBids.get(0); // 첫 번째 낙찰 입찰 사용
			}
			
			if(topBid == null) {
				map.put("rt", "FAIL");
				map.put("msg", "낙찰된 입찰이 없습니다.");
				return map;
			}
			
			// 구매자 정보 조회
			Member buyer = memberService.getMember(topBid.getBidderId());
			if(buyer == null) {
				map.put("rt", "FAIL");
				map.put("msg", "구매자 정보를 찾을 수 없습니다.");
				return map;
			}
			
			// 판매자 정보 조회
			Member seller = memberService.getMember(imageboard.getImageid());
			if(seller == null) {
				map.put("rt", "FAIL");
				map.put("msg", "판매자 정보를 찾을 수 없습니다.");
				return map;
			}
			
			// 구매자 정보 구성
			Map<String, Object> buyerInfo = new HashMap<>();
			buyerInfo.put("id", buyer.getId());
			buyerInfo.put("name", buyer.getName());
			buyerInfo.put("nickname", buyer.getNickname());
			buyerInfo.put("email1", buyer.getEmail1());
			buyerInfo.put("email2", buyer.getEmail2());
			buyerInfo.put("tel1", buyer.getTel1());
			buyerInfo.put("tel2", buyer.getTel2());
			buyerInfo.put("tel3", buyer.getTel3());
			buyerInfo.put("addr", buyer.getAddr());
			
			// 판매자 정보 구성
			Map<String, Object> sellerInfo = new HashMap<>();
			sellerInfo.put("id", seller.getId());
			sellerInfo.put("name", seller.getName());
			sellerInfo.put("nickname", seller.getNickname());
			sellerInfo.put("email1", seller.getEmail1());
			sellerInfo.put("email2", seller.getEmail2());
			sellerInfo.put("tel1", seller.getTel1());
			sellerInfo.put("tel2", seller.getTel2());
			sellerInfo.put("tel3", seller.getTel3());
			sellerInfo.put("addr", seller.getAddr());
			
			// 경매 정보
			Map<String, Object> auctionInfo = new HashMap<>();
			auctionInfo.put("seq", imageboard.getSeq());
			auctionInfo.put("imagename", imageboard.getImagename());
			auctionInfo.put("finalPrice", topBid.getBidAmount()); // 최종 낙찰 금액
			auctionInfo.put("transactionMethod", imageboard.getTransactionMethod());
			
			map.put("rt", "OK");
			map.put("buyer", buyerInfo);
			map.put("seller", sellerInfo);
			map.put("auction", auctionInfo);
		} catch(Exception e) {
			System.out.println("거래 성립 정보 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "거래 성립 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
}

