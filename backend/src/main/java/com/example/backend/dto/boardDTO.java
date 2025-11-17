package com.example.backend.dto;

import java.util.Date;
import com.example.backend.entity.board;
import lombok.Data;


@Data
public class boardDTO {
	private int seq;
	private String imageId;
	private String imageName;
    private int imagePrice;
    private int imageQty;
    private String imageContent;
    private String image1;
    private Date logtime;
    
    
	public board toEntity() {
		return new board(seq, imageId, imageName, imagePrice, 
				imageQty, imageContent, image1, logtime);
	}

}
