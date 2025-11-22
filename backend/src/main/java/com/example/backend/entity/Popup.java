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
@Table(name = "POPUP1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Popup {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
				generator = "POPUP_SEQUENCE_GENERATOR")
	@SequenceGenerator(name = "POPUP_SEQUENCE_GENERATOR",
					   sequenceName = "SEQ_POPUP1",
					   initialValue = 1, allocationSize = 1)
	@Column(name = "POPUP_SEQ")
	private int popupSeq;  // 팝업 번호 (PK)
	
	@Column(name = "POPUP_TITLE")
	private String popupTitle;  // 팝업 제목
	
	@Lob
	@Column(name = "POPUP_CONTENT")
	private String popupContent;  // 팝업 내용
	
	@Column(name = "BACKGROUND_IMAGE")
	private String backgroundImage;  // 백그라운드 이미지 경로
	
	@Column(name = "IS_VISIBLE")
	private String isVisible;  // 노출 여부 (Y: 노출, N: 비노출)
	
	@Column(name = "POPUP_TYPE")
	private String popupType;  // 팝업 타입 (이벤트, 초특가, 공지사항)
	
	@Temporal(TemporalType.DATE)
	@Column(name = "START_DATE")
	private Date startDate;  // 노출 시작일
	
	@Temporal(TemporalType.DATE)
	@Column(name = "END_DATE")
	private Date endDate;  // 노출 종료일
	
	@Temporal(TemporalType.DATE)
	@Column(name = "LOGTIME")
	private Date logtime;  // 등록일시
}

