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
@Table(name = "BID1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Bid {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
				generator = "BID_SEQUENCE_GENERATOR")
	@SequenceGenerator(name = "BID_SEQUENCE_GENERATOR",
					   sequenceName = "SEQ_BID1",
					   initialValue = 1, allocationSize = 1)
	private int bidSeq;  // 입찰 번호 (PK)
	private int imageboardSeq;  // 경매 게시글 번호 (FK)
	private String bidderId;  // 입찰자 ID (FK)
	private int bidAmount;  // 입찰 금액
	@Temporal(TemporalType.TIMESTAMP)
	private Date bidTime;  // 입찰 시간
	private String status;  // 상태 (유효, 취소, 낙찰)
}

