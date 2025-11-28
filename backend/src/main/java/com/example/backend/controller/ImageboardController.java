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
					
					// 한국 시간대 설정
					java.util.TimeZone timeZone = java.util.TimeZone.getTimeZone("Asia/Seoul");
					
					boolean parsed = false;
					for(String format : formats) {
						try {
							SimpleDateFormat sdf = new SimpleDateFormat(format);
							sdf.setLenient(false);
							sdf.setTimeZone(timeZone); // 한국 시간대 설정
							endDate = sdf.parse(auctionPeriod);
							System.out.println("날짜/시간 형식 파싱 성공 (" + format + "): " + endDate + " (타임존: Asia/Seoul)");
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
					sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Seoul")); // 한국 시간대 설정
					endDate = sdf.parse(auctionPeriod);
					// 시간을 23:59:59로 설정
					java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Seoul"));
					cal.setTime(endDate);
					cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
					cal.set(java.util.Calendar.MINUTE, 59);
					cal.set(java.util.Calendar.SECOND, 59);
					cal.set(java.util.Calendar.MILLISECOND, 0);
					endDate = cal.getTime();
					System.out.println("날짜 형식 파싱 성공: " + endDate + " (타임존: Asia/Seoul)");
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
		
		// 경매 상태를 명시적으로 "진행중"으로 설정 (등록 직후에는 항상 진행중)
		dto.setStatus("진행중");
		System.out.println("경매 등록 - 상태를 '진행중'으로 명시적 설정");
		
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
		int savedImageCount = 0; // 실제 저장된 이미지 개수
		int totalImageCount = 0; // 전체 이미지 개수
		if(images != null && !images.isEmpty()) {
			System.out.println("=== 이미지 저장 시작 ===");
			System.out.println("받은 이미지 개수: " + images.size()); // 디버깅용
			int order = 1;
			long baseTimestamp = System.currentTimeMillis(); // 기준 타임스탬프
			
			for(MultipartFile file : images) {
				if(file != null && !file.isEmpty()) {
					totalImageCount++;
					System.out.println("이미지 처리 시작 (순서: " + order + ", 크기: " + file.getSize() + " bytes)"); // 디버깅용
					try {
						// 파일명에 고유성 보장 (타임스탬프 + 순서 + UUID + 확장자)
						String originalFileName = file.getOriginalFilename();
						if(originalFileName == null || originalFileName.isEmpty()) {
							originalFileName = "image.jpg";
						}
						System.out.println("원본 파일명: " + originalFileName); // 디버깅용
						
						// 파일 확장자 추출
						String extension = ".jpg"; // 기본값
						int lastDotIndex = originalFileName.lastIndexOf('.');
						if(lastDotIndex > 0 && lastDotIndex < originalFileName.length() - 1) {
							extension = originalFileName.substring(lastDotIndex).toLowerCase();
							// 확장자 검증 (알파벳과 숫자만 허용, 최대 10자)
							if(!extension.matches("\\.[a-zA-Z0-9]{1,10}")) {
								extension = ".jpg";
							}
						}
						System.out.println("확장자: " + extension); // 디버깅용
						
						// 고유 파일명 생성 (타임스탬프_순서_UUID.확장자)
						// UUID를 사용하여 완전히 고유한 파일명 보장
						String uuid = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
						// 파일명을 간단하게 생성 (특수문자 제거)
						String fileName = baseTimestamp + "_" + order + "_" + uuid + extension;
						// 파일명에서 특수문자 제거 (안전한 파일명 보장)
						fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
						System.out.println("생성된 파일명: " + fileName); // 디버깅용
						
						// 원본과 썸네일 자동 생성
						System.out.println("이미지 저장 시작 (순서: " + order + ")");
						// InputStream을 안전하게 처리
						java.io.InputStream inputStream = null;
						try {
							inputStream = file.getInputStream();
							String savedPath = thumbnailUtil.saveImageWithThumbnail(inputStream, fileName);
							System.out.println("이미지 저장 완료: " + savedPath + " (순서: " + order + ")"); // 디버깅용
							
							// 첫 번째 이미지를 대표 이미지로 설정
							if(order == 1) {
								dto.setSeq(imageboard.getSeq());
								dto.setImage1(savedPath);  // original/파일명 형식으로 저장
								Imageboard updatedImageboard = service.imageboardModify(dto);  // 대표 이미지 업데이트
								if(updatedImageboard != null) {
									System.out.println("대표 이미지 설정 완료: " + savedPath); // 디버깅용
								} else {
									System.err.println("대표 이미지 설정 실패 (순서: " + order + ")");
								}
							}
							
							// 이미지 정보 저장 (DB에는 original/파일명 형식으로 저장)
							ImageboardImagesDTO imgDto = new ImageboardImagesDTO();
							imgDto.setImageboardSeq(imageboard.getSeq());
							imgDto.setImagePath(savedPath);  // original/파일명 형식
							imgDto.setImageOrder(order);
							imgDto.setUploadDate(new Date());
							ImageboardImages savedImage = imagesService.save(imgDto);
							if(savedImage != null && savedImage.getImgSeq() > 0) {
								System.out.println("이미지 정보 저장 완료: seq=" + savedImage.getImgSeq() + ", path=" + savedImage.getImagePath()); // 디버깅용
								savedImageCount++;
							} else {
								System.err.println("이미지 정보 저장 실패 (순서: " + order + ", savedImage: " + savedImage + ")");
							}
							
							order++;
						} finally {
							// InputStream 안전하게 닫기
							if(inputStream != null) {
								try {
									inputStream.close();
								} catch(IOException closeE) {
									System.err.println("InputStream 닫기 오류: " + closeE.getMessage());
								}
							}
						}
					} catch (IllegalStateException e) {
						System.err.println("IllegalStateException 발생 (순서: " + order + "): " + e.getMessage());
						e.printStackTrace();
						// 개별 이미지 저장 실패해도 다음 이미지 계속 처리
					} catch (IOException e) {
						System.err.println("IOException 발생 (순서: " + order + "): " + e.getMessage());
						e.printStackTrace();
						// 개별 이미지 저장 실패해도 다음 이미지 계속 처리
					} catch (Exception e) {
						System.err.println("예상치 못한 오류 (순서: " + order + "): " + e.getClass().getName() + " - " + e.getMessage());
						e.printStackTrace();
					}
				} else {
					System.out.println("빈 파일 건너뜀 (순서: " + order + ")"); // 디버깅용
				}
			}
			System.out.println("=== 이미지 저장 완료 ===");
			System.out.println("총 저장된 이미지 개수: " + savedImageCount + " / " + totalImageCount); // 디버깅용
		} else {
			System.out.println("이미지가 없거나 비어있음"); // 디버깅용
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		// 경매 등록 자체는 성공했으므로 항상 OK 반환
		// 이미지 저장 결과는 별도로 전달
		map.put("rt", "OK");
		if(images != null && !images.isEmpty()) {
			if(savedImageCount == totalImageCount) {
				map.put("msg", "경매가 등록되었습니다. (" + savedImageCount + "개 이미지 저장 완료)");
			} else if(savedImageCount > 0) {
				map.put("msg", "경매가 등록되었습니다. (" + savedImageCount + "/" + totalImageCount + "개 이미지 저장 완료)");
			} else {
				map.put("msg", "경매가 등록되었습니다. (이미지 저장 실패)");
			}
			map.put("savedImageCount", savedImageCount);
			map.put("totalImageCount", totalImageCount);
		} else {
			map.put("msg", "경매가 등록되었습니다.");
		}
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
						// 시간을 포함한 정확한 비교 (시간을 0으로 초기화하지 않음)
						if(endDate != null) {
							// 디버깅: 비교 값 출력
							long nowTime = now.getTime();
							long endTime = endDate.getTime();
							long diff = endTime - nowTime;
							
							// 경매 등록 직후 체크 (등록 후 1분 이내면 상태 체크 건너뛰기)
							Date logtime = item.getLogtime();
							boolean isRecentlyCreated = false;
							if(logtime != null) {
								long timeSinceCreation = nowTime - logtime.getTime();
								if(timeSinceCreation < 60000) { // 1분(60000ms) 이내
									isRecentlyCreated = true;
									System.out.println("경매 등록 직후 (seq: " + item.getSeq() + ", 등록 후 " + (timeSinceCreation / 1000) + "초) - 상태 체크 건너뛰기");
								}
							}
							
							if(!isRecentlyCreated) {
								System.out.println("경매 상태 체크 (seq: " + item.getSeq() + ", 현재: " + now + " (" + nowTime + "), 종료일: " + endDate + " (" + endTime + "), 차이: " + diff + "ms)");
								
								// 현재 시간이 종료 시간보다 늦거나 같으면 종료
								// 차이가 0보다 작거나 같으면 종료 (밀리초 단위 정확한 비교)
								if(diff <= 0) {
									currentStatus = "종료";
									System.out.println("경매 종료 감지 (seq: " + item.getSeq() + ") - 상태를 '종료'로 변경");
								
								// DB에도 상태 업데이트 (비동기로 처리하거나 별도로 처리 가능)
								try {
									// 상태가 "진행중"인 경우에만 DB 업데이트
									if(item.getStatus() != null && item.getStatus().equals("진행중")) {
										// 입찰이 있는지 확인 (예외 처리)
										try {
											int bidCount = bidService.getBidCountByImageboardSeq(item.getSeq());
											if(bidCount > 0) {
												// 최고 입찰 금액의 입찰 조회 (예외 처리)
												try {
													com.example.backend.entity.Bid topBid = bidService.getTopBidByImageboardSeq(item.getSeq());
													if(topBid != null) {
														// 최고 입찰자를 낙찰 처리 (예외 처리)
														try {
															bidService.awardBid(topBid.getBidSeq());
															System.out.println("자동 낙찰 처리 완료 (bidSeq: " + topBid.getBidSeq() + ", bidderId: " + topBid.getBidderId() + ")");
															// 경매 상태를 "판매완료"로 변경
															currentStatus = "판매완료";
														} catch(Exception bidE) {
															System.err.println("낙찰 처리 실패 (bidSeq: " + topBid.getBidSeq() + "): " + bidE.getMessage());
															bidE.printStackTrace();
															// 낙찰 실패해도 상태는 "종료"로 유지
														}
													}
												} catch(Exception topBidE) {
													System.err.println("최고 입찰 조회 실패 (seq: " + item.getSeq() + "): " + topBidE.getMessage());
													topBidE.printStackTrace();
													// 최고 입찰 조회 실패해도 계속 진행
												}
											}
										} catch(Exception bidCountE) {
											System.err.println("입찰 수 조회 실패 (seq: " + item.getSeq() + "): " + bidCountE.getMessage());
											bidCountE.printStackTrace();
											// 입찰 수 조회 실패해도 계속 진행
										}
										
										// 상태 업데이트 (예외 처리)
										try {
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
											updateDto.setStatus(currentStatus);
											updateDto.setLogtime(item.getLogtime());
											service.imageboardModify(updateDto);
											System.out.println("DB 상태 업데이트 완료 (seq: " + item.getSeq() + ", status: " + currentStatus + ")");
										} catch(Exception updateE) {
											System.err.println("상태 업데이트 실패 (seq: " + item.getSeq() + "): " + updateE.getMessage());
											updateE.printStackTrace();
											// 상태 업데이트 실패해도 반환값은 "종료"로 설정
										}
									}
								} catch(Exception e) {
									System.err.println("DB 상태 업데이트 실패 (seq: " + item.getSeq() + "): " + e.getMessage());
									e.printStackTrace();
									// DB 업데이트 실패해도 반환값은 "종료"로 설정
								}
							} else {
								System.out.println("경매 진행 중 (seq: " + item.getSeq() + ", 남은 시간: " + (diff / 1000) + "초)");
							}
							} // if(!isRecentlyCreated) 블록 닫기
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
	
	// 관리자용 전체 상품 목록 조회 (페이지네이션 없이 모든 상품 반환)
	@GetMapping("/imageboard/imageboardListAll")
	public Map<String, Object> imageboardListAll(
			@RequestParam(value="keyword", required=false) String keyword) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			System.out.println("관리자용 전체 목록 조회 시작 - keyword: " + keyword);
			
			List<Imageboard> list;
			
			// 검색어 처리
			String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
			
			if(!searchKeyword.isEmpty()) {
				// 검색어가 있으면 검색된 전체 목록
				list = service.imageboardListAllByKeyword(searchKeyword);
			} else {
				// 전체 목록
				list = service.imageboardListAll();
			}
			
			System.out.println("조회된 전체 데이터 개수: " + (list != null ? list.size() : 0));
		
			// 각 항목에 입찰인수 및 최고 입찰 금액 추가
			List<Map<String, Object>> itemsWithBidCount = new java.util.ArrayList<>();
			
			if(list != null) {
				for(Imageboard item : list) {
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
					
					// 입찰인수 조회 (예외 처리)
					try {
						int bidCount = bidService.getBidCountByImageboardSeq(item.getSeq());
						itemMap.put("bidCount", bidCount);
					} catch(Exception e) {
						System.out.println("입찰인수 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
						itemMap.put("bidCount", 0);
					}
					
					// 최고 입찰 금액 조회 (예외 처리)
					try {
						Integer maxBidAmount = bidService.getMaxBidAmountByImageboardSeq(item.getSeq());
						itemMap.put("maxBidAmount", maxBidAmount != null && maxBidAmount > 0 ? maxBidAmount : 0);
					} catch(Exception e) {
						System.out.println("최고 입찰 금액 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
						itemMap.put("maxBidAmount", 0);
					}
					
					itemsWithBidCount.add(itemMap);
				}
			}
			
			// 2. 결과 응답
			map.put("rt", "OK");
			map.put("total", list != null ? list.size() : 0);
			map.put("items", itemsWithBidCount);
			System.out.println("관리자용 전체 목록 조회 완료 - 반환할 항목 수: " + itemsWithBidCount.size());
			
		} catch(Exception e) {
			System.err.println("관리자용 전체 목록 조회 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "데이터를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new java.util.ArrayList<>());
			map.put("total", 0);
		}
		
		return map;
	}
	
	// 관리자용 상품 목록 조회 (페이지당 10개)
	@GetMapping("/imageboard/imageboardListForAdmin")
	public Map<String, Object> imageboardListForAdmin(
			@RequestParam(value="pg", defaultValue="1") int pg,
			@RequestParam(value="keyword", required=false) String keyword) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			System.out.println("관리자용 목록 조회 시작 - pg: " + pg + ", keyword: " + keyword);
			
			// 1. 데이터 처리
			// 목록 : 10개 (관리자용)
			int endNum = pg * 10;
			int startNum = endNum - 9;
			List<Imageboard> list;
			int totalA;
			
			// 검색어 처리
			String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
			
			if(!searchKeyword.isEmpty()) {
				// 검색어가 있으면 검색 목록
				list = service.imageboardListByKeyword(searchKeyword, startNum, endNum);
				totalA = service.getCountByKeyword(searchKeyword);
			} else {
				// 전체 목록
				list = service.imageboardList(startNum, endNum);
				totalA = service.getCount();
			}
			
			System.out.println("조회된 데이터 개수: " + (list != null ? list.size() : 0) + ", 총 개수: " + totalA);
		
			// 페이징 : 10개씩
			int totalP = (totalA + 9) / 10;
			int startPage = (pg-1)/3*3 + 1;
			int endPage = startPage + 2;
			if(endPage > totalP) endPage = totalP;
			
			// 각 항목에 입찰인수 및 최고 입찰 금액 추가
			List<Map<String, Object>> itemsWithBidCount = new java.util.ArrayList<>();
			
			if(list != null) {
				for(Imageboard item : list) {
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
					
					// 입찰인수 조회 (예외 처리)
					try {
						int bidCount = bidService.getBidCountByImageboardSeq(item.getSeq());
						itemMap.put("bidCount", bidCount);
					} catch(Exception e) {
						System.out.println("입찰인수 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
						itemMap.put("bidCount", 0);
					}
					
					// 최고 입찰 금액 조회 (예외 처리)
					try {
						Integer maxBidAmount = bidService.getMaxBidAmountByImageboardSeq(item.getSeq());
						itemMap.put("maxBidAmount", maxBidAmount != null && maxBidAmount > 0 ? maxBidAmount : 0);
					} catch(Exception e) {
						System.out.println("최고 입찰 금액 조회 오류 (seq: " + item.getSeq() + "): " + e.getMessage());
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
			System.out.println("관리자용 목록 조회 완료 - 반환할 항목 수: " + itemsWithBidCount.size());
			
		} catch(Exception e) {
			System.err.println("관리자용 목록 조회 중 오류 발생: " + e.getMessage());
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
				// 시간을 포함한 정확한 비교 (시간을 0으로 초기화하지 않음)
				if(endDate != null) {
					// 디버깅: 비교 값 출력
					long nowTime = now.getTime();
					long endTime = endDate.getTime();
					long diff = endTime - nowTime;
					
					// 경매 등록 직후 체크 (등록 후 1분 이내면 상태 체크 건너뛰기)
					Date logtime = imageboard.getLogtime();
					boolean isRecentlyCreated = false;
					if(logtime != null) {
						long timeSinceCreation = nowTime - logtime.getTime();
						if(timeSinceCreation < 60000) { // 1분(60000ms) 이내
							isRecentlyCreated = true;
							System.out.println("경매 등록 직후 (seq: " + seq + ", 등록 후 " + (timeSinceCreation / 1000) + "초) - 상태 체크 건너뛰기");
						}
					}
					
					if(!isRecentlyCreated) {
						System.out.println("경매 상태 체크 (seq: " + seq + ", 현재: " + now + " (" + nowTime + "), 종료일: " + endDate + " (" + endTime + "), 차이: " + diff + "ms)");
						
						// 현재 시간이 종료 시간보다 늦거나 같으면 종료
						// 차이가 0보다 작거나 같으면 종료 (밀리초 단위 정확한 비교)
						if(diff <= 0) {
							currentStatus = "종료";
							System.out.println("경매 종료 감지 (seq: " + seq + ") - 상태를 '종료'로 변경");
						
						// DB에도 상태 업데이트
						try {
							// 상태가 "진행중"인 경우에만 DB 업데이트
							if(imageboard.getStatus() != null && imageboard.getStatus().equals("진행중")) {
								// 입찰이 있는지 확인
								int bidCount = bidService.getBidCountByImageboardSeq(seq);
								if(bidCount > 0) {
									// 최고 입찰 금액의 입찰 조회
									com.example.backend.entity.Bid topBid = bidService.getTopBidByImageboardSeq(seq);
									if(topBid != null) {
										// 최고 입찰자를 낙찰 처리
										bidService.awardBid(topBid.getBidSeq());
										System.out.println("자동 낙찰 처리 완료 (bidSeq: " + topBid.getBidSeq() + ", bidderId: " + topBid.getBidderId() + ")");
										// 경매 상태를 "판매완료"로 변경
										currentStatus = "판매완료";
									}
								}
								
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
								updateDto.setStatus(currentStatus);
								updateDto.setLogtime(imageboard.getLogtime());
								service.imageboardModify(updateDto);
								System.out.println("DB 상태 업데이트 완료 (seq: " + seq + ", status: " + currentStatus + ")");
								
								// 업데이트된 데이터 다시 조회
								imageboard = service.imageboardView(seq);
							}
						} catch(Exception e) {
							System.err.println("DB 상태 업데이트 실패 (seq: " + seq + "): " + e.getMessage());
							e.printStackTrace();
							// DB 업데이트 실패해도 반환값은 "종료"로 설정
							imageboard.setStatus("종료");
						}
					} else {
						System.out.println("경매 진행 중 (seq: " + seq + ", 남은 시간: " + (diff / 1000) + "초)");
					}
					} // if(!isRecentlyCreated) 블록 닫기
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
	// 6-1. 경매 재시작 (포기 상태를 진행중으로 변경)
	@PostMapping("/imageboard/resumeAuction")
	public Map<String, Object> resumeAuction(@RequestParam("seq") int seq) {
		Imageboard imageboard = service.resumeAuction(seq);
		Map<String, Object> map = new HashMap<String, Object>();
		if(imageboard != null) {
			map.put("rt", "OK");
			map.put("msg", "경매가 재시작되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "경매 재시작에 실패했습니다.");
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

