package com.example.backend.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class board {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, 
					generator = "IMAGEBOARD_SEQUENCE_GENERATOR")
	@SequenceGenerator(name = "IMAGEBOARD_SEQUENCE_GENERATOR", 
					sequenceName = "seq_imageboard", 
					initialValue = 1, allocationSize = 1)
	private int seq;
	private String imageId;
	private String imageName;
	private int imagePrice;
	private int imageQty;
	private String imageContent;
	private String image1;
	@Temporal(TemporalType.DATE)
	private Date logtime;

}
