package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.CssFile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CssFileDTO {
	private Integer fileSeq;  // CSS 파일 번호
	private Integer setSeq;  // 스타일셋 번호
	private String fileName;  // CSS 파일명
	private String cssContent;  // CSS 코드 내용
	private String fileType;  // 파일 타입
	private Date createdDate;  // 생성일시
	private Date modifiedDate;  // 수정일시
	
	// Entity로 변환
	public CssFile toEntity() {
		CssFile entity = new CssFile();
		entity.setFileSeq(this.fileSeq);
		entity.setSetSeq(this.setSeq);
		entity.setFileName(this.fileName);
		entity.setCssContent(this.cssContent);
		entity.setFileType(this.fileType);
		entity.setCreatedDate(this.createdDate);
		entity.setModifiedDate(this.modifiedDate);
		return entity;
	}
	
	// Entity에서 DTO로 변환
	public static CssFileDTO fromEntity(CssFile entity) {
		CssFileDTO dto = new CssFileDTO();
		dto.setFileSeq(entity.getFileSeq());
		dto.setSetSeq(entity.getSetSeq());
		dto.setFileName(entity.getFileName());
		dto.setCssContent(entity.getCssContent());
		dto.setFileType(entity.getFileType());
		dto.setCreatedDate(entity.getCreatedDate());
		dto.setModifiedDate(entity.getModifiedDate());
		return dto;
	}
}

