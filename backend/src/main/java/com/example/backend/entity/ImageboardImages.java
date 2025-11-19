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
@Table(name = "IMAGEBOARD_IMAGES1")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageboardImages {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
				generator = "IMAGEBOARD_IMAGES_SEQUENCE_GENERATOR")
	@SequenceGenerator(name = "IMAGEBOARD_IMAGES_SEQUENCE_GENERATOR",
					   sequenceName = "SEQ_IMAGEBOARD_IMAGES1",
					   initialValue = 1, allocationSize = 1)
	private int imgSeq;  // 이미지 번호 (PK)
	private int imageboardSeq;  // 게시글 번호 (FK)
	private String imagePath;  // 이미지 파일 경로
	private int imageOrder;  // 이미지 순서 (1: 대표이미지)
	@Temporal(TemporalType.DATE)
	private Date uploadDate;  // 업로드 일시
}

