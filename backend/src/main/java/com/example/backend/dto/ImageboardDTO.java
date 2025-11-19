package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.Imageboard;

import lombok.Data;

@Data
public class ImageboardDTO {
	private int seq;
	private String imageId;
	private String imageName;
    private int imagePrice;
    private Integer maxBidPrice;  // 최고 낙찰 가격 (즉시 구매 가격, 선택사항)
    private int imageQty;
    private String imageContent;
    private String image1;
    private String category;  // 카테고리
    private String auctionPeriod;  // 경매종료일
    private String transactionMethod;  // 거래방식
    private Date auctionStartDate;  // 경매 시작일
    private Date auctionEndDate;  // 경매 종료일
    private String status;  // 상태
    private Date logtime;
    
    public Imageboard toEntity() {
    	return new Imageboard(seq, imageId, imageName, imagePrice, maxBidPrice, imageQty, imageContent, image1, 
    			category, auctionPeriod, transactionMethod, auctionStartDate, auctionEndDate, status, logtime);
    }
}
