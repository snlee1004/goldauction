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
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.EventProductDTO;
import com.example.backend.entity.EventProduct;
import com.example.backend.entity.EventProductImage;
import com.example.backend.repository.EventProductImageRepository;
import com.example.backend.repository.EventProductRepository;
import com.example.backend.service.EventProductService;

@RestController
public class EventProductController {
	@Autowired
	EventProductService service;
	
	@Autowired
	EventProductRepository eventProductRepository;
	
	@Autowired
	EventProductImageRepository eventProductImageRepository;
	
	@Value("${project.upload.path}")
	private String uploadpath;  // 파일 저장 폴더 경로
	
	// 공구이벤트 상품 등록 (이미지 포함)
	@PostMapping("/event/product/create")
	public Map<String, Object> createProduct(
			@RequestParam(value="boardSeq", required=false) Long boardSeq,
			@RequestParam(value="productName", required=false) String productName,
			@RequestParam(value="productDescription", required=false) String productDescription,
			@RequestParam(value="originalPrice", required=false) Long originalPrice,
			@RequestParam(value="salePrice", required=false) Long salePrice,
			@RequestParam(value="stockQuantity", required=false) Integer stockQuantity,
			@RequestParam(value="deliveryInfo", required=false) String deliveryInfo,
			@RequestParam(value="eventStatus", required=false) String eventStatus,
			@RequestParam(value="endDate", required=false) String endDate,
			@RequestParam(value="images", required=false) List<MultipartFile> images) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			// DTO 설정
			EventProductDTO dto = new EventProductDTO();
			if(boardSeq != null) dto.setBoardSeq(boardSeq);
			if(productName != null) dto.setProductName(productName);
			if(productDescription != null) dto.setProductDescription(productDescription);
			if(originalPrice != null) dto.setOriginalPrice(originalPrice);
			if(salePrice != null) dto.setSalePrice(salePrice);
			if(stockQuantity != null) dto.setStockQuantity(stockQuantity);
			if(deliveryInfo != null) dto.setDeliveryInfo(deliveryInfo);
			if(eventStatus != null) dto.setEventStatus(eventStatus);
			
			// 종료일 처리
			if(endDate != null && !endDate.isEmpty()) {
				try {
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
					Date endDateObj = sdf.parse(endDate);
					dto.setEndDate(endDateObj);
				} catch(ParseException e) {
					try {
						SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd");
						Date endDateObj = sdf2.parse(endDate);
						dto.setEndDate(endDateObj);
					} catch(ParseException e2) {
						System.out.println("날짜 파싱 오류: " + e2.getMessage());
					}
				}
			}
			
			// 기본값 설정 (EventProductDAO의 write 메서드와 동일하게)
			if(dto.getOriginalPrice() == null) {
				dto.setOriginalPrice(0L);
			}
			if(dto.getSalePrice() == null) {
				dto.setSalePrice(0L);
			}
			if(dto.getStockQuantity() == null) {
				dto.setStockQuantity(0);
			}
			if(dto.getSoldQuantity() == null) {
				dto.setSoldQuantity(0);
			}
			if(dto.getEventStatus() == null || dto.getEventStatus().isEmpty()) {
				dto.setEventStatus("진행중");
			}
			if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
				dto.setIsDeleted("N");  // 삭제되지 않음으로 설정
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			// 상품 등록 (직접 저장하여 productSeq 얻기)
			EventProduct savedProduct = eventProductRepository.save(dto.toEntity());
			
			if(savedProduct != null && savedProduct.getProductSeq() != null) {
				// 이미지 저장
				if(images != null && !images.isEmpty()) {
					int order = 1;
					for(MultipartFile file : images) {
						if(file != null && !file.isEmpty()) {
							try {
								String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
								File saveFile = new File(uploadpath, fileName);
								file.transferTo(saveFile);
								
								// 이미지 정보 저장
								EventProductImage productImage = new EventProductImage();
								productImage.setProductSeq(savedProduct.getProductSeq());
								productImage.setImagePath(fileName);
								productImage.setImageOrder(order);
								productImage.setUploadDate(new Date());
								eventProductImageRepository.save(productImage);
								
								order++;
							} catch (IllegalStateException | IOException e) {
								System.out.println("이미지 저장 오류: " + e.getMessage());
								e.printStackTrace();
							}
						}
					}
				}
				
				map.put("rt", "OK");
				map.put("msg", "상품이 등록되었습니다.");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "상품 등록에 실패했습니다.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "상품 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
		
		return map;
	}
	
	// 게시판별 상품 목록 조회 (페이징)
	@GetMapping("/event/product/list")
	public Map<String, Object> getProductList(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size) {
		
		Page<EventProduct> productPage = service.getProductList(boardSeq, page, size);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", productPage.getContent());
		map.put("total", productPage.getTotalElements());
		map.put("totalPages", productPage.getTotalPages());
		map.put("currentPage", productPage.getNumber());
		map.put("size", productPage.getSize());
		return map;
	}
	
	// 게시판별 진행중인 상품 목록 조회
	@GetMapping("/event/product/active")
	public Map<String, Object> getActiveProductList(@RequestParam("boardSeq") Long boardSeq) {
		List<EventProduct> list = service.getActiveProductList(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 게시판별 상품 목록 조회 (전체)
	@GetMapping("/event/product/list/all")
	public Map<String, Object> getAllProductList(@RequestParam("boardSeq") Long boardSeq) {
		List<EventProduct> list = service.getAllProductList(boardSeq);
		
		// 각 상품의 대표 이미지 경로 설정
		for(EventProduct product : list) {
			try {
				List<EventProductImage> images = eventProductImageRepository.findByProductSeqOrderByImageOrderAsc(product.getProductSeq());
				if(images != null && !images.isEmpty()) {
					// imageOrder가 1인 이미지를 대표 이미지로 설정
					EventProductImage mainImage = images.stream()
						.filter(img -> img.getImageOrder() != null && img.getImageOrder() == 1)
						.findFirst()
						.orElse(images.get(0)); // imageOrder가 1인 이미지가 없으면 첫 번째 이미지
					product.setMainImagePath(mainImage.getImagePath());
				}
			} catch(Exception e) {
				System.out.println("상품 " + product.getProductSeq() + "의 이미지 조회 오류: " + e.getMessage());
			}
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 이벤트 상태별 조회
	@GetMapping("/event/product/list/status")
	public Map<String, Object> getProductListByStatus(
			@RequestParam("boardSeq") Long boardSeq,
			@RequestParam("eventStatus") String eventStatus) {
		
		List<EventProduct> list = service.getProductListByStatus(boardSeq, eventStatus);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("list", list);
		map.put("total", list.size());
		return map;
	}
	
	// 상품 상세 조회
	@GetMapping("/event/product/detail")
	public Map<String, Object> getProductDetail(@RequestParam("productSeq") Long productSeq) {
		EventProduct product = service.getProduct(productSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(product != null && !"Y".equals(product.getIsDeleted())) {
			// 대표 이미지 경로 설정
			try {
				List<EventProductImage> images = eventProductImageRepository.findByProductSeqOrderByImageOrderAsc(productSeq);
				if(images != null && !images.isEmpty()) {
					// imageOrder가 1인 이미지를 대표 이미지로 설정
					EventProductImage mainImage = images.stream()
						.filter(img -> img.getImageOrder() != null && img.getImageOrder() == 1)
						.findFirst()
						.orElse(images.get(0)); // imageOrder가 1인 이미지가 없으면 첫 번째 이미지
					product.setMainImagePath(mainImage.getImagePath());
				}
			} catch(Exception e) {
				System.out.println("상품 " + productSeq + "의 이미지 조회 오류: " + e.getMessage());
			}
			
			map.put("rt", "OK");
			map.put("product", product);
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품을 찾을 수 없습니다.");
		}
		return map;
	}
	
	// 상품 수정
	@PostMapping("/event/product/modify")
	public Map<String, Object> modifyProduct(@RequestBody EventProductDTO dto) {
		int result = service.modify(dto);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "상품이 수정되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품 수정에 실패했습니다.");
		}
		return map;
	}
	
	// 상품 삭제
	@PostMapping("/event/product/delete")
	public Map<String, Object> deleteProduct(@RequestBody Map<String, Long> params) {
		Long productSeq = params.get("productSeq");
		int result = service.delete(productSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "상품이 삭제되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "상품 삭제에 실패했습니다.");
		}
		return map;
	}
	
	// 상품 이미지 조회 (대표 이미지)
	@GetMapping("/event/product/image/main")
	public Map<String, Object> getMainProductImage(@RequestParam("productSeq") Long productSeq) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			List<EventProductImage> images = eventProductImageRepository.findByProductSeqOrderByImageOrderAsc(productSeq);
			if(images != null && !images.isEmpty()) {
				// 첫 번째 이미지가 대표 이미지 (imageOrder가 1인 이미지)
				EventProductImage mainImage = images.stream()
					.filter(img -> img.getImageOrder() != null && img.getImageOrder() == 1)
					.findFirst()
					.orElse(images.get(0)); // imageOrder가 1인 이미지가 없으면 첫 번째 이미지
				
				map.put("rt", "OK");
				map.put("imagePath", mainImage.getImagePath());
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "이미지가 없습니다.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "이미지 조회 중 오류가 발생했습니다.");
		}
		
		return map;
	}
	
	// 상품별 이미지 목록 조회
	@GetMapping("/event/product/images")
	public Map<String, Object> getProductImages(@RequestParam("productSeq") Long productSeq) {
		Map<String, Object> map = new HashMap<String, Object>();
		
		try {
			List<EventProductImage> images = eventProductImageRepository.findByProductSeqOrderByImageOrderAsc(productSeq);
			map.put("rt", "OK");
			map.put("list", images);
			map.put("total", images != null ? images.size() : 0);
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "이미지 조회 중 오류가 발생했습니다.");
			map.put("list", new java.util.ArrayList<EventProductImage>());
			map.put("total", 0);
		}
		
		return map;
	}
	
	// 재고 차감
	@PostMapping("/event/product/stock/decrease")
	public Map<String, Object> decreaseStock(@RequestBody Map<String, Object> params) {
		Long productSeq = Long.parseLong(params.get("productSeq").toString());
		Integer quantity = Integer.parseInt(params.get("quantity").toString());
		
		int result = service.decreaseStock(productSeq, quantity);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "재고가 차감되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "재고 차감에 실패했습니다. 재고를 확인해주세요.");
		}
		return map;
	}
	
	// 재고 복구
	@PostMapping("/event/product/stock/restore")
	public Map<String, Object> restoreStock(@RequestBody Map<String, Object> params) {
		Long productSeq = Long.parseLong(params.get("productSeq").toString());
		Integer quantity = Integer.parseInt(params.get("quantity").toString());
		
		int result = service.restoreStock(productSeq, quantity);
		
		Map<String, Object> map = new HashMap<String, Object>();
		if(result == 1) {
			map.put("rt", "OK");
			map.put("msg", "재고가 복구되었습니다.");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "재고 복구에 실패했습니다.");
		}
		return map;
	}
	
	// 이벤트 상태 자동 업데이트
	@PostMapping("/event/product/status/auto-update")
	public Map<String, Object> autoUpdateStatus(@RequestBody(required = false) Map<String, Long> params) {
		Long boardSeq = params != null ? params.get("boardSeq") : null;
		int count = service.autoUpdateStatus(boardSeq);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rt", "OK");
		map.put("msg", count + "개의 상품 상태가 업데이트되었습니다.");
		map.put("count", count);
		return map;
	}
}

