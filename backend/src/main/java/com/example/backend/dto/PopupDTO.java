package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.Popup;

import lombok.Data;

@Data
public class PopupDTO {
	private int popupSeq;
	private String popupTitle;
	private String popupContent;
	private String backgroundImage;
	private String isVisible;
	private String popupType;
	private Date startDate;
	private Date endDate;
	private Date logtime;
	
	public Popup toEntity() {
		return new Popup(popupSeq, popupTitle, popupContent, backgroundImage, 
						 isVisible, popupType, startDate, endDate, logtime);
	}
}

