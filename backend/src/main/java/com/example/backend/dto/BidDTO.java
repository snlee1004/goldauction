package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.Bid;

import lombok.Data;

@Data
public class BidDTO {
	private int bidSeq;
	private int imageboardSeq;
	private String bidderId;
	private int bidAmount;
	private Date bidTime;
	private String status;
	
	public Bid toEntity() {
		return new Bid(bidSeq, imageboardSeq, bidderId, bidAmount, bidTime, status);
	}
}

