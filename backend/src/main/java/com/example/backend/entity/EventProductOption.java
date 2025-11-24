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
@Table(name = "EVENT_PRODUCT_OPTION1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "EVENT_PRODUCT_OPTION_SEQ_GENERATOR", sequenceName = "SEQ_EVENT_PRODUCT_OPTION1", allocationSize = 1)
public class EventProductOption {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EVENT_PRODUCT_OPTION_SEQ_GENERATOR")
	@Column(name = "OPTION_SEQ")
	private Long optionSeq;  // 옵션 번호 (PK, 시퀀스)
	
	@Column(name = "PRODUCT_SEQ", nullable = false)
	private Long productSeq;  // 상품 번호 (FK -> EVENT_PRODUCT1.PRODUCT_SEQ)
	
	@Column(name = "OPTION_NAME", nullable = false, length = 100)
	private String optionName;  // 옵션명 (예: 색상, 사이즈)
	
	@Column(name = "OPTION_VALUE", nullable = false, length = 200)
	private String optionValue;  // 옵션값 (예: 빨강, L)
	
	@Column(name = "OPTION_PRICE")
	private Long optionPrice;  // 옵션 추가 가격
	
	@Column(name = "STOCK_QUANTITY")
	private Integer stockQuantity;  // 옵션별 재고 수량
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATED_DATE")
	private Date createdDate;  // 생성일
}

