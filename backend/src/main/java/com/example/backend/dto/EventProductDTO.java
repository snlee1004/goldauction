package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.EventProduct;

import lombok.Data;

@Data
public class EventProductDTO {
	private Long productSeq;  // 상품 번호
	private Long boardSeq;  // 게시판 번호
	private String productName;  // 상품명
	private String productDescription;  // 상품 설명
	private Long originalPrice;  // 정가
	private Long salePrice;  // 할인가
	private Integer stockQuantity;  // 재고 수량
	private Integer soldQuantity;  // 판매 수량
	private Date endDate;  // 종료일시
	private String eventStatus;  // 이벤트 상태
	private String deliveryInfo;  // 배송 정보
	private String isDeleted;  // 삭제 여부
	private Date createdDate;  // 생성일
	private Date updatedDate;  // 수정일
	
	public EventProduct toEntity() {
		return new EventProduct(productSeq, boardSeq, productName, productDescription,
							  originalPrice, salePrice, stockQuantity, soldQuantity,
							  endDate, eventStatus, deliveryInfo, isDeleted, createdDate, updatedDate);
	}
}

