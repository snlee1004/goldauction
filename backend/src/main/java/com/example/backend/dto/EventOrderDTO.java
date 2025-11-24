package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.EventOrder;

import lombok.Data;

@Data
public class EventOrderDTO {
	private Long orderSeq;  // 주문 번호
	private Long productSeq;  // 상품 번호
	private String memberId;  // 회원 ID
	private Integer orderQuantity;  // 주문 수량
	private Long orderPrice;  // 주문 가격
	private String orderStatus;  // 주문 상태
	private String deliveryAddress;  // 배송 주소
	private String deliveryPhone;  // 배송 연락처
	private Date createdDate;  // 주문일
	private Date updatedDate;  // 수정일
	
	public EventOrder toEntity() {
		return new EventOrder(orderSeq, productSeq, memberId, orderQuantity, orderPrice,
							orderStatus, deliveryAddress, deliveryPhone, createdDate, updatedDate);
	}
}

