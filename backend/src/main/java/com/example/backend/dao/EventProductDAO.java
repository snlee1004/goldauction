package com.example.backend.dao;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.EventProductDTO;
import com.example.backend.entity.EventProduct;
import com.example.backend.repository.EventProductRepository;

@Repository
public class EventProductDAO {
	@Autowired
	EventProductRepository eventProductRepository;
	
	// 공구이벤트 상품 등록 => 1:등록성공, 0:등록실패
	public int write(EventProductDTO dto) {
		try {
			// 기본값 설정
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
				dto.setIsDeleted("N");
			}
			if(dto.getCreatedDate() == null) {
				dto.setCreatedDate(new Date());
			}
			
			EventProduct product = eventProductRepository.save(dto.toEntity());
			return product != null ? 1 : 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판별 상품 목록 조회 (페이징)
	public Page<EventProduct> getProductList(Long boardSeq, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return eventProductRepository.findByBoardSeqAndNotDeleted(boardSeq, pageable);
	}
	
	// 게시판별 진행중인 상품 목록 조회
	public List<EventProduct> getActiveProductList(Long boardSeq) {
		return eventProductRepository.findActiveProductsByBoardSeq(boardSeq);
	}
	
	// 게시판별 상품 목록 조회 (전체)
	public List<EventProduct> getAllProductList(Long boardSeq) {
		return eventProductRepository.findByBoardSeqAndIsDeletedOrderByCreatedDateDesc(boardSeq, "N");
	}
	
	// 이벤트 상태별 조회
	public List<EventProduct> getProductListByStatus(Long boardSeq, String eventStatus) {
		return eventProductRepository.findByBoardSeqAndEventStatusAndIsDeletedOrderByCreatedDateDesc(boardSeq, eventStatus, "N");
	}
	
	// 상품 상세 조회
	public EventProduct getProduct(Long productSeq) {
		return eventProductRepository.findById(productSeq).orElse(null);
	}
	
	// 상품 수정 => 1:수정성공, 0:수정실패
	public int modify(EventProductDTO dto) {
		try {
			EventProduct product = eventProductRepository.findById(dto.getProductSeq()).orElse(null);
			if(product != null) {
				// 생성일은 유지
				dto.setCreatedDate(product.getCreatedDate());
				// 수정일 설정
				dto.setUpdatedDate(new Date());
				// 기존 값 유지 (null인 경우)
				if(dto.getBoardSeq() == null) {
					dto.setBoardSeq(product.getBoardSeq());
				}
				if(dto.getSoldQuantity() == null) {
					dto.setSoldQuantity(product.getSoldQuantity());
				}
				if(dto.getIsDeleted() == null || dto.getIsDeleted().isEmpty()) {
					dto.setIsDeleted(product.getIsDeleted());
				}
				
				// 이벤트 상태 자동 업데이트 체크
				if(dto.getEndDate() != null && dto.getEndDate().before(new Date())) {
					dto.setEventStatus("마감");
				} else if(dto.getStockQuantity() != null && dto.getStockQuantity() <= 0) {
					dto.setEventStatus("마감");
				} else if(dto.getEventStatus() == null || dto.getEventStatus().isEmpty()) {
					dto.setEventStatus(product.getEventStatus());
				}
				
				EventProduct result = eventProductRepository.save(dto.toEntity());
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 상품 삭제 (소프트 삭제) => 1:삭제성공, 0:삭제실패
	public int delete(Long productSeq) {
		try {
			EventProduct product = eventProductRepository.findById(productSeq).orElse(null);
			if(product != null) {
				product.setIsDeleted("Y");
				product.setUpdatedDate(new Date());
				EventProduct result = eventProductRepository.save(product);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 재고 차감 => 1:성공, 0:실패
	public int decreaseStock(Long productSeq, Integer quantity) {
		try {
			EventProduct product = eventProductRepository.findById(productSeq).orElse(null);
			if(product != null && product.getStockQuantity() >= quantity) {
				product.setStockQuantity(product.getStockQuantity() - quantity);
				product.setSoldQuantity(product.getSoldQuantity() + quantity);
				product.setUpdatedDate(new Date());
				
				// 재고 소진 시 자동 마감
				if(product.getStockQuantity() <= 0) {
					product.setEventStatus("마감");
				}
				
				EventProduct result = eventProductRepository.save(product);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 재고 복구 (주문 취소 시)
	public int restoreStock(Long productSeq, Integer quantity) {
		try {
			EventProduct product = eventProductRepository.findById(productSeq).orElse(null);
			if(product != null) {
				product.setStockQuantity(product.getStockQuantity() + quantity);
				product.setSoldQuantity(product.getSoldQuantity() - quantity);
				product.setUpdatedDate(new Date());
				
				// 재고가 복구되면 진행중으로 변경 (종료일이 지나지 않은 경우)
				if(product.getStockQuantity() > 0 && 
				   (product.getEndDate() == null || product.getEndDate().after(new Date()))) {
					product.setEventStatus("진행중");
				}
				
				EventProduct result = eventProductRepository.save(product);
				return result != null ? 1 : 0;
			}
			return 0;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 이벤트 상태 자동 업데이트 (종료일 도달 또는 재고 소진)
	public int autoUpdateStatus(Long boardSeq) {
		try {
			List<EventProduct> products;
			if(boardSeq != null) {
				products = eventProductRepository.findActiveProductsByBoardSeq(boardSeq);
			} else {
				// 모든 게시판의 진행중인 상품 조회
				products = eventProductRepository.findAllByStatus(null, "진행중");
			}
			
			int count = 0;
			Date now = new Date();
			
			for(EventProduct product : products) {
				// 종료일 도달 또는 재고 소진 체크
				if((product.getEndDate() != null && product.getEndDate().before(now)) ||
				   (product.getStockQuantity() != null && product.getStockQuantity() <= 0)) {
					if(!"마감".equals(product.getEventStatus())) {
						product.setEventStatus("마감");
						product.setUpdatedDate(now);
						eventProductRepository.save(product);
						count++;
					}
				}
			}
			
			return count;
		} catch(Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	// 게시판별 상품 수 조회
	public long getTotalCount(Long boardSeq) {
		return eventProductRepository.countByBoardSeqAndIsDeleted(boardSeq, "N");
	}
}

