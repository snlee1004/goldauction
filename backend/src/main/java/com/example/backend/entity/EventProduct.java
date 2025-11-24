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
@Table(name = "EVENT_PRODUCT1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "EVENT_PRODUCT_SEQ_GENERATOR", sequenceName = "SEQ_EVENT_PRODUCT1", allocationSize = 1)
public class EventProduct {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EVENT_PRODUCT_SEQ_GENERATOR")
	@Column(name = "PRODUCT_SEQ")
	private Long productSeq;  // 상품 번호 (PK, 시퀀스)
	
	@Column(name = "BOARD_SEQ", nullable = false)
	private Long boardSeq;  // 게시판 번호 (FK -> BOARD1.BOARD_SEQ)
	
	@Column(name = "PRODUCT_NAME", nullable = false, length = 200)
	private String productName;  // 상품명
	
	@Column(name = "PRODUCT_DESCRIPTION", columnDefinition = "CLOB")
	private String productDescription;  // 상품 설명
	
	@Column(name = "ORIGINAL_PRICE")
	private Long originalPrice;  // 정가
	
	@Column(name = "SALE_PRICE")
	private Long salePrice;  // 할인가
	
	@Column(name = "STOCK_QUANTITY")
	private Integer stockQuantity;  // 재고 수량
	
	@Column(name = "SOLD_QUANTITY")
	private Integer soldQuantity;  // 판매 수량
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "END_DATE")
	private Date endDate;  // 종료일시
	
	@Column(name = "EVENT_STATUS", length = 20)
	private String eventStatus;  // 이벤트 상태 (진행중/마감/종료)
	
	@Column(name = "DELIVERY_INFO", length = 500)
	private String deliveryInfo;  // 배송 정보
	
	@Column(name = "IS_DELETED", length = 1)
	private String isDeleted;  // 삭제 여부 (Y: 삭제, N: 정상)
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPDATED_DATE")
	private Date updatedDate;  // 수정일
}

