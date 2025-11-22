package com.example.backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
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
	@Column(name = "SEQ")
	private int seq;	
	@Column(name = "IMAGEID")
	private String imageid;
	@Column(name = "IMAGENAME")
	private String imagename;
	@Column(name = "IMAGEPRICE")
    private int imageprice;
    @Column(name = "MAX_BID_PRICE")
    private Integer maxBidPrice;  // 최고 낙찰 가격 (즉시 구매 가격, 선택사항)
	@Column(name = "IMAGEQTY")
    private int imageqty;
	@Lob  // CLOB 타입 명시 (Oracle DB에서 큰 텍스트 데이터 저장용)
	@Column(name = "IMAGECONTENT")
    private String imagecontent;
	@Column(name = "IMAGE1")
    private String image1;
	@Column(name = "CATEGORY")
    private String category;  // 카테고리 (골드, 실버, 백금, 다이아, 귀금속, 주화, 금은정련, 유가증권)
	@Column(name = "AUCTION_PERIOD")
    private String auctionPeriod;  // 경매종료일 (7일후, 14일후, 21일후, 30일후)
	@Column(name = "TRANSACTION_METHOD")
    private String transactionMethod;  // 거래방식 (직거래, 매장방문, 에스크로, 중계소 이용)
    @Temporal(TemporalType.DATE)
	@Column(name = "AUCTION_START_DATE")
    private Date auctionStartDate;  // 경매 시작일
    @Temporal(TemporalType.DATE)
	@Column(name = "AUCTION_END_DATE")
    private Date auctionEndDate;  // 경매 종료일
	@Column(name = "STATUS")
    private String status;  // 상태 (진행중, 판매완료, 종료)
    @Temporal(TemporalType.DATE)
	@Column(name = "LOGTIME")
    private Date logtime;
}
