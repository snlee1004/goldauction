package com.example.backend.entity;

import java.util.Date;

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
@Table(name = "IMAGEBOARD1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Imageboard {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
				generator = "IMAGEBOARD_SEQUENCE_GENERATOR")
	@SequenceGenerator(name = "IMAGEBOARD_SEQUENCE_GENERATOR",
					   sequenceName = "SEQ_IMAGEBOARD1",
					   initialValue = 1, allocationSize = 1)
	private int seq;	
	private String imageid;
	private String imagename;
    private int imageprice;
    private Integer maxBidPrice;  // 최고 낙찰 가격 (즉시 구매 가격, 선택사항)
    private int imageqty;
    private String imagecontent;
    private String image1;
    private String category;  // 카테고리 (골드, 실버, 백금, 다이아, 귀금속, 주화, 금은정련, 유가증권)
    private String auctionPeriod;  // 경매종료일 (7일후, 14일후, 21일후, 30일후)
    private String transactionMethod;  // 거래방식 (직거래, 매장방문, 에스크로, 중계소 이용)
    @Temporal(TemporalType.DATE)
    private Date auctionStartDate;  // 경매 시작일
    @Temporal(TemporalType.DATE)
    private Date auctionEndDate;  // 경매 종료일
    private String status;  // 상태 (진행중, 판매완료, 종료)
    @Temporal(TemporalType.DATE)
    private Date logtime;
}
