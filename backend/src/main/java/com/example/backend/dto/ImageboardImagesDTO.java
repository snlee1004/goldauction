package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.ImageboardImages;

import lombok.Data;

@Data
public class ImageboardImagesDTO {
	private int imgSeq;
	private int imageboardSeq;
	private String imagePath;
	private int imageOrder;
	private Date uploadDate;
	
	public ImageboardImages toEntity() {
		return new ImageboardImages(imgSeq, imageboardSeq, imagePath, imageOrder, uploadDate);
	}
}

