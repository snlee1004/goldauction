package com.example.backend.dto;

import java.util.Date;

import com.example.backend.entity.CssApply;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CssApplyDTO {
	private Integer applySeq;  // 적용 설정 번호
	private Integer setSeq;  // 적용할 스타일셋 번호
	private String applyScope;  // 적용 범위
	private String isActive;  // 활성화 여부
	private Date appliedDate;  // 적용일시
	
	// Entity로 변환
	public CssApply toEntity() {
		CssApply entity = new CssApply();
		entity.setApplySeq(this.applySeq);
		entity.setSetSeq(this.setSeq);
		entity.setApplyScope(this.applyScope);
		entity.setIsActive(this.isActive);
		entity.setAppliedDate(this.appliedDate);
		return entity;
	}
	
	// Entity에서 DTO로 변환
	public static CssApplyDTO fromEntity(CssApply entity) {
		CssApplyDTO dto = new CssApplyDTO();
		dto.setApplySeq(entity.getApplySeq());
		dto.setSetSeq(entity.getSetSeq());
		dto.setApplyScope(entity.getApplyScope());
		dto.setIsActive(entity.getIsActive());
		dto.setAppliedDate(entity.getAppliedDate());
		return dto;
	}
}

