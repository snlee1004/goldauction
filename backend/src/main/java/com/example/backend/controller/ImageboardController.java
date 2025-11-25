package com.example.backend.controller;

import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.ImageboardDTO;
import com.example.backend.dto.ImageboardImagesDTO;
import com.example.backend.entity.Imageboard;
import com.example.backend.entity.ImageboardImages;
import com.example.backend.service.ImageboardService;
import com.example.backend.service.ImageboardImagesService;
import com.example.backend.service.BidService;
import com.example.backend.util.ImageThumbnailUtil;

@RestController
public class ImageboardController {
	@Autowired
	ImageboardService service;
	
	@Autowired
	ImageboardImagesService imagesService;
	
	@Autowired
	BidService bidService;
	
	@Autowired
	ImageThumbnailUtil thumbnailUtil;
	
	@Value("${project.upload.path}")
	private String uploadpath;  // 파일 저장 폴더 경로 저장
	
	// 1. 저장 (다중 이미지 지원)
	@PostMapping("/imageboard/imageboardWrite")
	public Map<String, Object> imageboardWrite(
			@RequestParam(value="productName", required=false) String productName,
			@RequestParam(value="category", required=false) String category,
			@RequestParam(value="startPrice", required=false) String startPrice,
			@RequestParam(value="maxBidPrice", required=false) String maxBidPrice,
			@RequestParam(value="auctionPeriod", required=false) String auctionPeriod,
			@RequestParam(value="transactionMethod", required=false) String transactionMethod,
			@RequestParam(value="description", required=false) String description,
			@RequestParam(value="imageId", required=false) String imageId,
			@RequestParam(value="images", required=false) List<MultipartFile> images) {
		
		// DTO 설정 (frontend 필드명을 backend 필드명으로 매핑)
		ImageboardDTO dto = new ImageboardDTO();
		if(productName != null) dto.setImageName(productName);
		if(category != null) dto.setCategory(category);
		if(startPrice != null && !startPrice.isEmpty()) {
			try {
				dto.setImagePrice(Integer.parseInt(startPrice));
			} catch(NumberFormatException e) {
				dto.setImagePrice(0);
			}
		}
		// 최고 낙찰 가격 처리 (선택사항)
		if(maxBidPrice != null && !maxBidPrice.isEmpty()) {
			try {
				dto.setMaxBidPrice(Integer.parseInt(maxBidPrice));
			} catch(NumberFormatException e) {
				dto.setMaxBidPrice(null);
			}
		}
		
		// 경매 시작일 설정 (현재 날짜)
		Date startDate = new Date();
		dto.setAuctionStartDate(startDate);
		
		// 경매 종료일 처리 (날짜/시간 형식 또는 "7일후" 형식)
		if(auctionPeriod != null && !auctionPeriod.isEmpty()) {
			Date endDate = null;
			try {
				// ISO 8601 형식 (예: "2025-11-25T14:30:00" 또는 "2025-11-25T14:30") 파싱 시도
				if(auctionPeriod.contains("T")) {
					// 여러 형식 시도
					String[] formats = {
						"yyyy-MM-dd'T'HH:mm:ss",
						"yyyy-MM-dd'T'HH:mm",
						"yyyy-MM-dd'T'HH:mm:ss.SSS"
					};
					
					boolean parsed = false;
					for(String format : formats) {
						try {
							SimpleDateFormat sdf = new SimpleDateFormat(format);
							sdf.setLenient(false);
							endDate = sdf.parse(auctionPeriod);
							System.out.println("날짜/시간 형식 파싱 성공 (" + format + "): " + endDate);
							parsed = true;
							break;
						} catch(ParseException pe) {
							// 다음 형식 시도
							continue;
						}
					}
					
					if(!parsed) {
						throw new ParseException("날짜/시간 형식을 파싱할 수 없습니다: " + auctionPeriod, 0);
					}
				} else if(auctionPeriod.matches("\\d{4}-\\d{2}-\\d{2}")) {
					// 날짜만 있는 경우 (예: "2025-11-25")
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					sdf.setLenient(false);
					endDate = sdf.parse(auctionPeriod);
					// 시간을 23:59:59로 설정
					java.util.Calendar cal = java.util.Calendar.getInstance();
					cal.setTime(endDate);
					cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
					cal.set(java.util.Calendar.MINUTE, 59);
					cal.set(java.util.Calendar.SECOND, 59);
					endDate = cal.getTime();
					System.out.println("날짜 형식 파싱 성공: " + endDate);
				} else {
					// "7일후", "14일후" 형식인 경우 (기존 로직 사용)
					dto.setAuctionPeriod(auctionPeriod);
					System.out.println("기간 형식으로 처리: " + auctionPeriod);
				}
				
				if(endDate != null) {
					// 종료일이 시작일보다 이전이면 안됨
					if(endDate.before(startDate)) {
						System.err.println("경매 종료일이 시작일보다 이전입니다. 시작일로 설정합니다.");
						// 시작일로부터 7일 후로 설정
						java.util.Calendar cal = java.util.Calendar.getInstance();
						cal.setTime(startDate);
						cal.add(java.util.Calendar.DAY_OF_MONTH, 7);
						endDate = cal.getTime();
					}
					dto.setAuctionEndDate(endDate);
					// auctionPeriod는 원래 형식 유지 (디버깅용)
					dto.setAuctionPeriod(auctionPeriod);
					System.out.println("경매 종료일 최종 설정: " + endDate);
				}
			} catch(ParseException e) {
				System.err.println("날짜 파싱 오류: " + auctionPeriod + " - " + e.getMessage());
				e.printStackTrace();
				// 파싱 실패 시 기존 로직 사용 ("7일후" 형식)
				dto.setAuctionPeriod(auctionPeriod);
			}
		} else {
			dto.setAuctionPeriod(auctionPeriod);
		}
		
		if(transactionMethod != null) dto.setTransactionMethod(transactionMethod);
		if(description != null) dto.setImageContent(description);
		if(imageId != null) dto.setImageId(imageId);
		dto.setImageQty(1);
		dto.setLogtime(new Date());
		
		File folder = new File(uploadpath);
		if(!folder.exists()) {
			folder.mkdirs();
		}
		
		// 게시글 저장
		Imageboard imageboard = service.imageboardWrite(dto);
		
		if(imageboard == null) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "글 저장에 실패했습니다.");
			return map;
		}
		
		// 다중 이미지 저장 (원본 + 썸네일 자동 생성)
		if(images != null && !images.isEmpty()) {
			System.out.println("받은 이미지 개수: " + images.size()); // 디버깅용
			int order = 1;
			for(MultipartFile file : images) {
				if(file != null && !file.isEmpty()) {
					try {
						String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
						
						// 원본과 썸네일 자동 생성
						String savedPath = thumbnailUtil.saveImageWithThumbnail(file.getInputStream(), fileName);
						System.out.println("이미지 저장 완료: " + savedPath + " (순서: " + order + ")"); // 디버깅용
						
						// 첫 번째 이미지를 대표 이미지로 설정
						if(order == 1) {
							dto.setSeq(imageboard.getSeq());
							dto.setImage1(savedPath);  // original/파일명 형식으로 저장
							service.imageboardModify(dto);  // 대표 이미지 업데이트
							System.out.println("대표 이미지 설정: " + savedPath); // 디버깅용
						}
						
						// 이미지 정보 저장 (DB에는 original/파일명 형식으로 저장)
						ImageboardImagesDTO imgDto = new ImageboardImagesDTO();
						imgDto.setImageboardSeq(imageboard.getSeq());
						imgDto.setImagePath(savedPath);  // original/파일명 형식
						imgDto.setImageOrder(order);
						imgDto.setUploadDate(new Date());
						ImageboardImages savedImage = imagesService.save(imgDto);
						System.out.println("이미지 정보 저장 완료: seq=" + savedImage.getImgSeq() + ", path=" + savedImage.getImagePath()); // 디버깅용
						
						order++;
					} catch (IllegalStateException | IOException e) {
						System.out.println("이미지 저장 오류: " + e.getMessage()); // 디버깅용
						e.printStackTrace();
					}
				} else {
					System.out.println("빈 파일 건너뜀 (순서: " + order + ")"); // 디버깅용
				}
			}
			System.out.println("총 저장된 이미지 개수: " + (order - 1)); // 디버깅용
		} else {
			System.out.println("이미지가 없거나 비어있음"); // 디버깅용
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		return map;
	}
	// 2. 목록 (카테고리 필터링 지원)
	@GetMapping("/imageboard/imageboardList")
	public Map<String, Object> imageboardList(
			@RequestParam(value="pg", defaultValue="1") int pg,
			@RequestParam(value="keyword", required=false) String keyword,
			@RequestParam(value="category", required=false) String category) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			System.out.println("목록 조회 시작 - pg: " + pg + ", keyword: " + keyword + ", category: " + category);
			
			// 1. 데이터 처리
			// 목록 : 5개
			int endNum = pg * 5;
			int startNum = endNum - 4;
			List<Imageboard> list;
			int totalA;
			
			// 검색어와 카테고리 처리
			String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
			String searchCategory = (category != null && !category.trim().isEmpty()) ? category.trim() : null;
			
			if(!searchKeyword.isEmpty() || searchCategory != null) {
				// 검색어 또는 카테고리가 있으면 필터링된 목록
				System.out.println("필터링된 목록 조회 - keyword: " + searchKeyword + ", category: " + searchCategory);
				list = service.imageboardListByKeywordAndCategory(searchKeyword, searchCategory, startNum, endNum);
				totalA = service.getCountByKeywordAndCategory(searchKeyword, searchCategory);
			} else if(!searchKeyword.isEmpty()) {
				// 검색어만 있으면 검색 목록
				System.out.println("검색 목록 조회 - keyword: " + searchKeyword);
				list = service.imageboardListByKeyword(searchKeyword, startNum, endNum);
				totalA = service.getCountByKeyword(searchKeyword);
			} else {
				// 전체 목록
				System.out.println("전체 목록 조회");
				list = service.imageboardList(startNum, endNum);
				totalA = service.getCount();
			}
			
			System.out.println("조회된 데이터 개수: " + (list != null ? list.size() : 0) + ", 총 개수: " + totalA);
		
			// 페이징 : 3블럭
			int totalP = (totalA + 4) / 5;
			int startPage = (pg-1)/3*3 + 1;
			int endPage = startPage + 2;
			if(endPage > totalP) endPage = totalP;
			
			// 각 항목에 입찰인수 및 최고 입찰 금액 추가
			List<Map<String, Object>> itemsWithBidCount = new java.util.ArrayList<>();
			Date now = new Date(); // 현재 시간
			
			if(list != null) {
				for(Imageboard item : list) {
					Map<String, Object> itemMap = new HashMap<>();
					itemMap.put("seq", item.getSeq());
					itemMap.put("imageid", item.getImageid());
					itemMap.put("imagename", item.getImagename());
					itemMap.put("imageprice", item.getImageprice());
					itemMap.put("imageqty", item.getImageqty());
					itemMap.put("imagecontent", item.getImagecontent());
					itemMap.put("image1", item.getImage1());
					itemMap.put("category", item.getCategory());
					itemMap.put("auctionPeriod", item.getAuctionPeriod());
					itemMap.put("transactionMethod", item.getTransactionMethod());
					itemMap.put("auctionStartDate", item.getAuctionStartDate());
					itemMap.put("auctionEndDate", item.getAuctionEndDate());
					
					// 경매 상태 확인 및 업데이트
					String currentStatus = item.getStatus();
					
					// 상태가 "포기"나 "판매완료"가 아닌 경우에만 종료일 확인
					if(currentStatus != null && !currentStatus.equals("포기") && !currentStatus.equals("판매완료")) {
						Date endDate = item.getAuctionEndDate();
						
						// 경매 종료일이 있고, 현재 시간이 종료일을 지났으면 상태를 "종료"로 변경
						if(endDate != null && now.after(endDate)) {
							// 날짜 비교 (시간 제외)
							java.util.Calendar endCal = java.util.Calendar.getInstance();
							endCal.setTime(endDate);
							endCal.set(java.util.Calendar.HOUR_OF_DAY, 0);
							endCal.set(java.util.Calendar.MINUTE, 0);
							endCal.set(java.util.Calendar.SECOND, 0);
							endCal.set(java.util.Calendar.MILLISECOND, 0);
							
							java.util.Calendar nowCal = java.util.Calendar.getInstance();
							nowCal.setTime(now);
							nowCal.set(java.util.Calendar.HOUR_OF_DAY, 0);
							nowCal.set(java.util.Calendar.MINUTE, 0);
							nowCal.set(java.util.Calendar.SECOND, 0);
							nowCal.set(java.util.Calendar.MILLISECOND, 0);
							
							// 종료일이 지났으면 상태를 "종료"로 변경
							if(nowCal.after(endCal) || nowCal.equals(endCal)) {
								currentStatus = "종료";
								System.out.println("경매 종료 감지 (seq: " + item.getSeq() + ") - 상태를 '종료'로 변경");
								
								// DB에도 상태 업데이트 (비동기로 처리하거나 별도로 처리 가능)
								try {
									// 상태가 "진행중"인 경우에만 DB 업데이트
									if(item.getStatus() != null && item.getStatus().equals("진행중")) {
										ImageboardDTO updateDto = new ImageboardDTO();
										updateDto.setSeq(item.getSeq());
										updateDto.setImageId(item.getImageid());
										updateDto.setImageName(item.getImagename());
										updateDto.setImagePrice(item.getImageprice());
										updateDto.setImageQty(item.getImageqty());
										updateDto.setImageContent(item.getImagecontent());
										updateDto.setImage1(item.getImage1());
										updateDto.setCategory(item.getCategory());
										updateDto.setAuctionPeriod(item.getAuctionPeriod());
										updateDto.setTransactionMethod(item.getTransactionMethod());
										updateDto.setAuctionStartDate(item.getAuctionStartDate());
										updateDto.setAuctionEndDate(item.getAuctionEndDate());
										updateDto.setStatus("종료");
										updateDto.setLogtime(item.getLogtime());
										service.imageboardModify(updateDto);
										System.out.println("DB 상태 업데이트 완료 (seq: " + item.getSeq() + ")");
									}
								} catch(Exception e) {
									System.err.println("DB 상태 업데이트 실패 (seq: " + item.getSeq() + "): " + e.getMessage());
									// DB 업데이트 실패해도 반환값은 "종료"로 설정
								}
							}
						}
					}
					
					itemMap.put("status", currentStatus);
					itemMap.put("logtime", item.getLogtime());
					
					// 입찰인수 조회 (예외 처리)
					try {
						int bidCount = bidService.getBidCountByImageboardSeq(item.getSeq());
						itemMap.put("bidCount", bidCount);
					} catch(Exception e) {
						System.out.println("입찰인수 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
						e.printStackTrace();
						itemMap.put("bidCount", 0);
					}
					
					// 최고 입찰 금액 조회 (예외 처리)
					try {
						Integer maxBidAmount = bidService.getMaxBidAmountByImageboardSeq(item.getSeq());
						itemMap.put("maxBidAmount", maxBidAmount != null && maxBidAmount > 0 ? maxBidAmount : 0);
					} catch(Exception e) {
						System.out.println("최고 입찰 금액 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
						e.printStackTrace();
						itemMap.put("maxBidAmount", 0);
					}
					
					itemsWithBidCount.add(itemMap);
				}
			}
			
			// 2. 결과 응답
			map.put("rt", "OK");
			map.put("total", list != null ? list.size() : 0);
			map.put("pg", pg);
			map.put("totalP", totalP);
			map.put("startPage", startPage);
			map.put("endPage", endPage);
			map.put("items", itemsWithBidCount);
			System.out.println("목록 조회 완료 - 반환할 항목 수: " + itemsWithBidCount.size());
			
		} catch(Exception e) {
			System.err.println("목록 조회 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "데이터를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new java.util.ArrayList<>());
			map.put("total", 0);
			map.put("pg", pg);
			map.put("totalP", 0);
			map.put("startPage", 1);
			map.put("endPage", 1);
		}
		
		return map;
	}
	// 3. 상세보기
	@GetMapping("/imageboard/imageboardView")
	public Map<String, Object> imageboardView(@RequestParam("seq") int seq) {
		System.out.println("상세보기 조회 시작 - seq: " + seq);
		Imageboard imageboard = service.imageboardView(seq);
		
		// 2. 결과 응답
		Map<String, Object> map = new HashMap<String, Object>();
		if(imageboard != null) {
			System.out.println("상세보기 데이터 조회 성공:");
			System.out.println("  - 상태: " + imageboard.getStatus());
			System.out.println("  - 경매 시작일: " + imageboard.getAuctionStartDate());
			System.out.println("  - 경매 종료일: " + imageboard.getAuctionEndDate());
			System.out.println("  - 상품명: " + imageboard.getImagename());
			
			// 경매 상태 확인 및 업데이트
			String currentStatus = imageboard.getStatus();
			Date now = new Date();
			
			// 상태가 "포기"나 "판매완료"가 아닌 경우에만 종료일 확인
			if(currentStatus != null && !currentStatus.equals("포기") && !currentStatus.equals("판매완료")) {
				Date endDate = imageboard.getAuctionEndDate();
				
				// 경매 종료일이 있고, 현재 시간이 종료일을 지났으면 상태를 "종료"로 변경
				if(endDate != null && now.after(endDate)) {
					// 날짜 비교 (시간 제외)
					java.util.Calendar endCal = java.util.Calendar.getInstance();
					endCal.setTime(endDate);
					endCal.set(java.util.Calendar.HOUR_OF_DAY, 0);
					endCal.set(java.util.Calendar.MINUTE, 0);
					endCal.set(java.util.Calendar.SECOND, 0);
					endCal.set(java.util.Calendar.MILLISECOND, 0);
					
					java.util.Calendar nowCal = java.util.Calendar.getInstance();
					nowCal.setTime(now);
					nowCal.set(java.util.Calendar.HOUR_OF_DAY, 0);
					nowCal.set(java.util.Calendar.MINUTE, 0);
					nowCal.set(java.util.Calendar.SECOND, 0);
					nowCal.set(java.util.Calendar.MILLISECOND, 0);
					
					// 종료일이 지났으면 상태를 "종료"로 변경
					if(nowCal.after(endCal) || nowCal.equals(endCal)) {
						currentStatus = "종료";
						System.out.println("경매 종료 감지 (seq: " + seq + ") - 상태를 '종료'로 변경");
						
						// DB에도 상태 업데이트
						try {
							// 상태가 "진행중"인 경우에만 DB 업데이트
							if(imageboard.getStatus() != null && imageboard.getStatus().equals("진행중")) {
								ImageboardDTO updateDto = new ImageboardDTO();
								updateDto.setSeq(imageboard.getSeq());
								updateDto.setImageId(imageboard.getImageid());
								updateDto.setImageName(imageboard.getImagename());
								updateDto.setImagePrice(imageboard.getImageprice());
								updateDto.setImageQty(imageboard.getImageqty());
								updateDto.setImageContent(imageboard.getImagecontent());
								updateDto.setImage1(imageboard.getImage1());
								updateDto.setCategory(imageboard.getCategory());
								updateDto.setAuctionPeriod(imageboard.getAuctionPeriod());
								updateDto.setTransactionMethod(imageboard.getTransactionMethod());
								updateDto.setAuctionStartDate(imageboard.getAuctionStartDate());
								updateDto.setAuctionEndDate(imageboard.getAuctionEndDate());
								updateDto.setStatus("종료");
								updateDto.setLogtime(imageboard.getLogtime());
								service.imageboardModify(updateDto);
								System.out.println("DB 상태 업데이트 완료 (seq: " + seq + ")");
								
								// 업데이트된 데이터 다시 조회
								imageboard = service.imageboardView(seq);
							}
						} catch(Exception e) {
							System.err.println("DB 상태 업데이트 실패 (seq: " + seq + "): " + e.getMessage());
							// DB 업데이트 실패해도 반환값은 "종료"로 설정
							imageboard.setStatus("종료");
						}
					}
				}
			}
			
			map.put("rt", "OK");
			map.put("total", 1);
			map.put("item", imageboard);
		} else {
			System.out.println("상세보기 데이터 조회 실패 - seq: " + seq);
			map.put("rt", "FAIL");
			map.put("msg", "해당 게시글이 존재하지 않습니다.");
		}
		return map;
	}
	
	// 게시글 번호로 이미지 목록 조회
	@GetMapping("/imageboard/images")
	public Map<String, Object> getImagesByImageboardSeq(@RequestParam("imageboardSeq") int imageboardSeq) {
		List<ImageboardImages> images = imagesService.getImagesByImageboardSeq(imageboardSeq);
		System.out.println("이미지 조회 요청: imageboardSeq=" + imageboardSeq + ", 조회된 이미지 개수: " + images.size()); // 디버깅용
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("items", images);
		map.put("total", images.size());
		return map;
	}
	// 4. 삭제
	@GetMapping("/imageboard/imageboardDelete")
	public Map<String, Object> imageboardDelete(@RequestParam("seq") int seq) {
		boolean result = service.imageboardDelete(seq);
		Map<String, Object> map = new HashMap<String, Object>();
		if(result) {
			map.put("rt", "OK");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "삭제에 실패했습니다.");
		}
		return map;
	}
	// 5. 수정 (다중 이미지 지원)
	@PostMapping("/imageboard/imageboardModify")
	public Map<String, Object> imageboardModify(
			@RequestParam(value="seq", required=true) int seq,
			@RequestParam(value="productName", required=false) String productName,
			@RequestParam(value="category", required=false) String category,
			@RequestParam(value="startPrice", required=false) String startPrice,
			@RequestParam(value="auctionPeriod", required=false) String auctionPeriod,
			@RequestParam(value="transactionMethod", required=false) String transactionMethod,
			@RequestParam(value="description", required=false) String description,
			@RequestParam(value="images", required=false) List<MultipartFile> images) {
		
		Imageboard existingBoard = service.imageboardView(seq);
		if(existingBoard == null) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("rt", "FAIL");
			map.put("msg", "해당 게시글이 존재하지 않습니다.");
			return map;
		}
		
		// DTO 설정
		ImageboardDTO dto = new ImageboardDTO();
		dto.setSeq(seq);
		if(productName != null) dto.setImageName(productName);
		else dto.setImageName(existingBoard.getImagename());
		
		if(category != null) dto.setCategory(category);
		else dto.setCategory(existingBoard.getCategory());
		
		if(startPrice != null && !startPrice.isEmpty()) {
			try {
				dto.setImagePrice(Integer.parseInt(startPrice));
			} catch(NumberFormatException e) {
				dto.setImagePrice(existingBoard.getImageprice());
			}
		} else {
			dto.setImagePrice(existingBoard.getImageprice());
		}
		
		if(auctionPeriod != null) dto.setAuctionPeriod(auctionPeriod);
		else dto.setAuctionPeriod(existingBoard.getAuctionPeriod());
		
		if(transactionMethod != null) dto.setTransactionMethod(transactionMethod);
		else dto.setTransactionMethod(existingBoard.getTransactionMethod());
		
		if(description != null) dto.setImageContent(description);
		else dto.setImageContent(existingBoard.getImagecontent());
		
		dto.setImageId(existingBoard.getImageid());
		dto.setImageQty(existingBoard.getImageqty());
		dto.setLogtime(existingBoard.getLogtime());
		dto.setAuctionStartDate(existingBoard.getAuctionStartDate());
		dto.setStatus(existingBoard.getStatus());
		
		File folder = new File(uploadpath);
		if(!folder.exists()) {
			folder.mkdirs();
		}
		
		// 새 이미지가 있으면 저장 (원본 + 썸네일 자동 생성)
		if(images != null && !images.isEmpty()) {
			// 기존 이미지 삭제 (선택사항 - 필요시 주석 해제)
			// imagesService.deleteByImageboardSeq(seq);
			
			int order = 1;
			for(MultipartFile file : images) {
				if(file != null && !file.isEmpty()) {
					try {
						String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
						
						// 원본과 썸네일 자동 생성
						String savedPath = thumbnailUtil.saveImageWithThumbnail(file.getInputStream(), fileName);
						System.out.println("이미지 저장 완료: " + savedPath + " (순서: " + order + ")"); // 디버깅용
						
						// 첫 번째 이미지를 대표 이미지로 설정
						if(order == 1) {
							dto.setImage1(savedPath);  // original/파일명 형식으로 저장
						}
						
						// 이미지 정보 저장 (DB에는 original/파일명 형식으로 저장)
						ImageboardImagesDTO imgDto = new ImageboardImagesDTO();
						imgDto.setImageboardSeq(seq);
						imgDto.setImagePath(savedPath);  // original/파일명 형식
						imgDto.setImageOrder(order);
						imgDto.setUploadDate(new Date());
						imagesService.save(imgDto);
						
						order++;
					} catch (IllegalStateException | IOException e) {
						System.out.println("이미지 저장 오류: " + e.getMessage()); // 디버깅용
						e.printStackTrace();
					}
				}
			}
		} else {
			// 기존 대표 이미지 유지
			dto.setImage1(existingBoard.getImage1());
		}
		
		Imageboard imageboard = service.imageboardModify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(imageboard != null) {
			map.put("rt", "OK");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "글 수정에 실패했습니다.");
		}
		return map;
	}
	// 6. 경매 포기
	@PostMapping("/imageboard/cancelAuction")
	public Map<String, Object> cancelAuction(@RequestParam("seq") int seq) {
		Imageboard imageboard = service.cancelAuction(seq);
		Map<String, Object> map = new HashMap<String, Object>();
		if(imageboard != null) {
			map.put("rt", "OK");
			map.put("msg", "경매가 포기되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "경매 포기에 실패했습니다.");
		}
		return map;
	}
	// 7. 포기된 경매 목록
	@GetMapping("/imageboard/canceledList")
	public Map<String, Object> canceledList(
			@RequestParam(value="pg", defaultValue="1") int pg) {
		int pageSize = 10;
		int endNum = pg * pageSize;
		int startNum = endNum - pageSize + 1;
		
		List<Imageboard> list = service.getCanceledList(startNum, endNum);
		int total = service.getCanceledCount();
		int totalPages = (int) Math.ceil((double) total / pageSize);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("list", list);
		map.put("pg", pg);
		map.put("total", total);
		map.put("totalPages", totalPages);
		return map;
	}
	// 8. 회원별 경매 목록 조회
	@GetMapping("/imageboard/listByMember")
	public Map<String, Object> listByMember(@RequestParam("memberId") String memberId) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			if(memberId == null || memberId.trim().isEmpty()) {
				map.put("rt", "FAIL");
				map.put("msg", "회원 ID가 필요합니다.");
				return map;
			}
			
			List<Imageboard> allList = service.getListByMemberId(memberId);
			if(allList == null) {
				allList = new java.util.ArrayList<>();
			}
			
			// 상태별로 분류 및 입찰 수 추가
			List<Map<String, Object>> activeList = new java.util.ArrayList<>(); // 진행중
			List<Map<String, Object>> completedList = new java.util.ArrayList<>(); // 종료/판매완료
			List<Map<String, Object>> canceledList = new java.util.ArrayList<>(); // 포기
			
			for(Imageboard item : allList) {
				if(item == null) continue;
				
				// Imageboard를 Map으로 변환하여 입찰 수 추가
				Map<String, Object> itemMap = new HashMap<>();
				itemMap.put("seq", item.getSeq());
				itemMap.put("imageid", item.getImageid());
				itemMap.put("imagename", item.getImagename());
				itemMap.put("imageprice", item.getImageprice());
				itemMap.put("imageqty", item.getImageqty());
				itemMap.put("imagecontent", item.getImagecontent());
				itemMap.put("image1", item.getImage1());
				itemMap.put("category", item.getCategory());
				itemMap.put("auctionPeriod", item.getAuctionPeriod());
				itemMap.put("transactionMethod", item.getTransactionMethod());
				itemMap.put("auctionStartDate", item.getAuctionStartDate());
				itemMap.put("auctionEndDate", item.getAuctionEndDate());
				itemMap.put("status", item.getStatus());
				itemMap.put("logtime", item.getLogtime());
				
				// 입찰 수 조회
				try {
					int bidCount = bidService.getBidCountByImageboardSeq(item.getSeq());
					itemMap.put("bidCount", bidCount);
				} catch(Exception e) {
					System.out.println("입찰 수 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
					itemMap.put("bidCount", 0);
				}
				
				String status = item.getStatus();
				if(status == null || status.isEmpty() || status.equals("진행중")) {
					activeList.add(itemMap);
				} else if(status.equals("종료") || status.equals("판매완료")) {
					completedList.add(itemMap);
				} else if(status.equals("포기")) {
					canceledList.add(itemMap);
				}
			}
			
			map.put("rt", "OK");
			map.put("activeList", activeList); // 진행중
			map.put("completedList", completedList); // 종료/판매완료
			map.put("canceledList", canceledList); // 포기
			map.put("total", allList.size());
		} catch(Exception e) {
			System.out.println("회원별 경매 목록 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "경매 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("activeList", new java.util.ArrayList<>());
			map.put("completedList", new java.util.ArrayList<>());
			map.put("canceledList", new java.util.ArrayList<>());
			map.put("total", 0);
		}
		return map;
	}
}

