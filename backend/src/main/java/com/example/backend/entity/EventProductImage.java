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
@Table(name = "EVENT_PRODUCT_IMAGE1")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SequenceGenerator(name = "EVENT_PRODUCT_IMAGE_SEQ_GENERATOR", sequenceName = "SEQ_EVENT_PRODUCT_IMAGE1", allocationSize = 1)
public class EventProductImage {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EVENT_PRODUCT_IMAGE_SEQ_GENERATOR")
	@Column(name = "IMAGE_SEQ")
	private Long imageSeq;  // 이미지 번호 (PK, 시퀀스)
	
	@Column(name = "PRODUCT_SEQ", nullable = false)
	private Long productSeq;  // 상품 번호 (FK -> EVENT_PRODUCT1.PRODUCT_SEQ)
	
	@Column(name = "IMAGE_PATH", nullable = false, length = 500)
	private String imagePath;  // 이미지 파일 경로
	
	@Column(name = "IMAGE_ORDER")
	private Integer imageOrder;  // 이미지 순서 (1: 대표이미지)
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "UPLOAD_DATE")
	private Date uploadDate;  // 업로드 일시
}

