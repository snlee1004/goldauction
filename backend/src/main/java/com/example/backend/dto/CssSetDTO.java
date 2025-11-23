package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.CssSet;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CssSetDTO {
	private Integer setSeq;  // 스타일셋 번호
	private String setName;  // 스타일셋 이름
	private String setDescription;  // 스타일셋 설명
	private String isActive;  // 활성화 여부
	private Date createdDate;  // 생성일시
	private Date modifiedDate;  // 수정일시
	
	// Entity로 변환
	public CssSet toEntity() {
		CssSet entity = new CssSet();
		entity.setSetSeq(this.setSeq);
		entity.setSetName(this.setName);
		entity.setSetDescription(this.setDescription);
		entity.setIsActive(this.isActive);
		entity.setCreatedDate(this.createdDate);
		entity.setModifiedDate(this.modifiedDate);
		return entity;
	}
	
	// Entity에서 DTO로 변환
	public static CssSetDTO fromEntity(CssSet entity) {
		CssSetDTO dto = new CssSetDTO();
		dto.setSetSeq(entity.getSetSeq());
		dto.setSetName(entity.getSetName());
		dto.setSetDescription(entity.getSetDescription());
		dto.setIsActive(entity.getIsActive());
		dto.setCreatedDate(entity.getCreatedDate());
		dto.setModifiedDate(entity.getModifiedDate());
		return dto;
	}
}

