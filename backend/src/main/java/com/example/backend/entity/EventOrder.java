package com.example.backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "EVENT_ORDER1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "EVENT_ORDER_SEQ_GENERATOR", sequenceName = "SEQ_EVENT_ORDER1", allocationSize = 1)
public class EventOrder {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EVENT_ORDER_SEQ_GENERATOR")
	@Column(name = "ORDER_SEQ")
	private Long orderSeq;  // 주문 번호 (PK, 시퀀스)
	
	@Column(name = "PRODUCT_SEQ", nullable = false)
	private Long productSeq;  // 상품 번호 (FK -> EVENT_PRODUCT1.PRODUCT_SEQ)
	
	@Column(name = "MEMBER_ID", nullable = false, length = 50)
	private String memberId;  // 회원 ID (FK -> MEMBER1.ID)
	
	@Column(name = "ORDER_QUANTITY")
	private Integer orderQuantity;  // 주문 수량
	
	@Column(name = "ORDER_PRICE")
	private Long orderPrice;  // 주문 가격
	
	@Column(name = "ORDER_STATUS", length = 20)
	private String orderStatus;  // 주문 상태 (주문완료/취소/배송중/배송완료)
	
	@Column(name = "DELIVERY_ADDRESS", length = 500)
	private String deliveryAddress;  // 배송 주소
	
	@Column(name = "DELIVERY_PHONE", length = 50)
	private String deliveryPhone;  // 배송 연락처
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 주문일
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPDATED_DATE")
	private Date updatedDate;  // 수정일
}

