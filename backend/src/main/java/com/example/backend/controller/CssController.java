package com.example.backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CssApplyDTO;
import com.example.backend.dto.CssFileDTO;
import com.example.backend.dto.CssSetDTO;
import com.example.backend.entity.CssApply;
import com.example.backend.entity.CssFile;
import com.example.backend.entity.CssSet;
import com.example.backend.service.CssApplyService;
import com.example.backend.service.CssFileService;
import com.example.backend.service.CssSetService;

@RestController
public class CssController {
	@Autowired
	CssSetService cssSetService;
	
	@Autowired
	CssFileService cssFileService;
	
	@Autowired
	CssApplyService cssApplyService;
	
	@Value("${project.upload.path:}")
	private String uploadPath;
	
	@Value("${project.css.path:}")
	private String cssPath;
	
	// ========== CSS 스타일셋 API ==========
	
	// default_set 생성 (빈 CSS로 기본 스타일셋 생성)
	@PostMapping("/css/set/createDefault")
	public Map<String, Object> createDefaultSet() {
		Map<String, Object> map = new HashMap<>();
		try {
			// default_set이 이미 존재하는지 확인
			if(cssSetService.isExistSetName("default_set")) {
				map.put("rt", "OK");
				map.put("msg", "default_set이 이미 존재합니다.");
				return map;
			}
			
			// default_set 생성
			CssSetDTO setDto = new CssSetDTO();
			setDto.setSetName("default_set");
			setDto.setSetDescription("기본 스타일셋 (CSS 적용 안된 상태)");
			setDto.setIsActive("N");
			
			int setResult = cssSetService.saveCssSet(setDto);
			if(setResult <= 0) {
				map.put("rt", "FAIL");
				map.put("msg", "default_set 생성 실패");
				return map;
			}
			
			// 저장된 default_set 조회
			CssSet defaultSet = cssSetService.getCssSetList().stream()
				.filter(s -> s.getSetName().equals("default_set"))
				.findFirst()
				.orElse(null);
			
			if(defaultSet == null) {
				map.put("rt", "FAIL");
				map.put("msg", "생성된 default_set을 찾을 수 없습니다.");
				return map;
			}
			
			// 파일 시스템에 default_set 폴더 생성
			String baseCssPath;
			if(cssPath != null && !cssPath.isEmpty()) {
				baseCssPath = cssPath;
			} else {
				baseCssPath = System.getProperty("user.dir") + "/../frontend/src/css";
			}
			String defaultSetPath = baseCssPath + "/default_set";
			File defaultSetDir = new File(defaultSetPath);
			if(!defaultSetDir.exists()) {
				defaultSetDir.mkdirs();
			}
			
			// layouts 폴더에서 실제 CSS 파일 읽기
			String layoutsPath = baseCssPath.replace("/css", "/layouts");
			Map<String, String> defaultCssContents = new HashMap<>();
			
			// header.css 읽기
			try {
				String headerPath = layoutsPath + "/header.css";
				File headerFile = new File(headerPath);
				if(headerFile.exists()) {
					String headerContent = new String(Files.readAllBytes(Paths.get(headerPath)), "UTF-8");
					defaultCssContents.put("header", headerContent);
				} else {
					defaultCssContents.put("header", "");
				}
			} catch(IOException e) {
				System.err.println("header.css 읽기 실패: " + e.getMessage());
				defaultCssContents.put("header", "");
			}
			
			// footer.css 읽기
			try {
				String footerPath = layoutsPath + "/footer.css";
				File footerFile = new File(footerPath);
				if(footerFile.exists()) {
					String footerContent = new String(Files.readAllBytes(Paths.get(footerPath)), "UTF-8");
					defaultCssContents.put("footer", footerContent);
				} else {
					defaultCssContents.put("footer", "");
				}
			} catch(IOException e) {
				System.err.println("footer.css 읽기 실패: " + e.getMessage());
				defaultCssContents.put("footer", "");
			}
			
			// imageboard.css, member.css는 빈 내용
			defaultCssContents.put("imageboard", "");
			defaultCssContents.put("member", "");
			
			// CSS 파일 생성 (DB와 파일 시스템 모두)
			String[] fileTypes = {"imageboard", "member", "header", "footer"};
			for(String fileType : fileTypes) {
				String cssContent = defaultCssContents.get(fileType);
				
				// DB에 저장
				CssFileDTO fileDto = new CssFileDTO();
				fileDto.setSetSeq(defaultSet.getSetSeq());
				fileDto.setFileName(fileType + ".css");
				fileDto.setCssContent(cssContent);
				fileDto.setFileType(fileType);
				cssFileService.saveCssFile(fileDto);
				
				// 파일 시스템에 저장
				try {
					String filePath = defaultSetPath + "/" + fileType + ".css";
					Files.write(Paths.get(filePath), cssContent.getBytes("UTF-8"));
				} catch(IOException e) {
					System.err.println("default_set CSS 파일 생성 실패: " + fileType + ".css - " + e.getMessage());
				}
			}
			
			map.put("rt", "OK");
			map.put("msg", "default_set이 생성되었습니다.");
			map.put("setSeq", defaultSet.getSetSeq());
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "default_set 생성 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 목록 조회
	@GetMapping("/css/set/list")
	public Map<String, Object> getCssSetList() {
		Map<String, Object> map = new HashMap<>();
		try {
			List<CssSet> list = cssSetService.getCssSetList();
			List<Map<String, Object>> items = new ArrayList<>();
			for(CssSet set : list) {
				Map<String, Object> item = new HashMap<>();
				item.put("setSeq", set.getSetSeq());
				item.put("setName", set.getSetName());
				item.put("setDescription", set.getSetDescription());
				item.put("isActive", set.getIsActive());
				item.put("createdDate", set.getCreatedDate());
				item.put("modifiedDate", set.getModifiedDate());
				items.add(item);
			}
			map.put("rt", "OK");
			map.put("items", items);
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 목록 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 상세 조회
	@GetMapping("/css/set/get")
	public Map<String, Object> getCssSet(@RequestParam("setSeq") Integer setSeq) {
		Map<String, Object> map = new HashMap<>();
		try {
			CssSet set = cssSetService.getCssSet(setSeq);
			if(set != null) {
				Map<String, Object> item = new HashMap<>();
				item.put("setSeq", set.getSetSeq());
				item.put("setName", set.getSetName());
				item.put("setDescription", set.getSetDescription());
				item.put("isActive", set.getIsActive());
				item.put("createdDate", set.getCreatedDate());
				item.put("modifiedDate", set.getModifiedDate());
				map.put("rt", "OK");
				map.put("item", item);
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋을 찾을 수 없습니다.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 저장/수정
	@PostMapping("/css/set/save")
	public Map<String, Object> saveCssSet(@RequestBody CssSetDTO dto) {
		Map<String, Object> map = new HashMap<>();
		try {
			// 이름 중복 확인 (수정 시에는 자기 자신 제외)
			if(dto.getSetSeq() == null) {
				// 신규 생성 시
				if(cssSetService.isExistSetName(dto.getSetName())) {
					map.put("rt", "FAIL");
					map.put("msg", "이미 존재하는 스타일셋 이름입니다.");
					return map;
				}
			}
			
			int result = cssSetService.saveCssSet(dto);
			if(result > 0) {
				// 저장된 스타일셋 조회하여 setSeq 반환
				CssSet savedSet = null;
				if(dto.getSetSeq() != null) {
					// 수정인 경우: 저장된 setSeq로 조회
					savedSet = cssSetService.getCssSet(dto.getSetSeq());
				} else {
					// 신규 생성인 경우: 이름으로 조회
					if(dto.getSetName() != null) {
						savedSet = cssSetService.getCssSetList().stream()
							.filter(s -> s.getSetName().equals(dto.getSetName()))
							.findFirst()
							.orElse(null);
					}
				}
				map.put("rt", "OK");
				map.put("msg", "스타일셋 저장 성공");
				if(savedSet != null) {
					map.put("setSeq", savedSet.getSetSeq());
				} else if(dto.getSetSeq() != null) {
					// 수정인데 조회 실패한 경우에도 setSeq 반환
					map.put("setSeq", dto.getSetSeq());
				}
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋 저장 실패");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 저장 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 삭제
	@PostMapping("/css/set/delete")
	public Map<String, Object> deleteCssSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<>();
		try {
			Integer setSeq = Integer.parseInt(params.get("setSeq").toString());
			
			// 삭제 전에 스타일셋 정보 조회 (파일 시스템 삭제를 위해)
			CssSet set = cssSetService.getCssSet(setSeq);
			if(set == null) {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋을 찾을 수 없습니다.");
				return map;
			}
			
			// DB에서 삭제
			int result = cssSetService.deleteCssSet(setSeq);
			if(result > 0) {
				// 파일 시스템에서도 삭제
				try {
					String baseCssPath;
					if(cssPath != null && !cssPath.isEmpty()) {
						baseCssPath = cssPath;
					} else {
						baseCssPath = System.getProperty("user.dir") + "/../frontend/src/css";
					}
					String setFolderPath = baseCssPath + "/" + set.getSetName();
					File setFolder = new File(setFolderPath);
					if(setFolder.exists() && setFolder.isDirectory()) {
						// 폴더 내 모든 파일 삭제
						File[] files = setFolder.listFiles();
						if(files != null) {
							for(File file : files) {
								file.delete();
							}
						}
						// 폴더 삭제
						setFolder.delete();
					}
				} catch(Exception e) {
					System.err.println("CSS 파일 시스템 삭제 실패: " + e.getMessage());
					// 파일 시스템 삭제 실패해도 DB 삭제는 성공했으므로 계속 진행
				}
				
				map.put("rt", "OK");
				map.put("msg", "스타일셋 삭제 성공");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋 삭제 실패");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 삭제 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 적용
	@PostMapping("/css/set/apply")
	public Map<String, Object> applyCssSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<>();
		try {
			Integer setSeq = Integer.parseInt(params.get("setSeq").toString());
			String applyScope = params.get("applyScope") != null ? params.get("applyScope").toString() : "FULL";
			
			// 스타일셋 존재 확인
			CssSet set = cssSetService.getCssSet(setSeq);
			if(set == null) {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋을 찾을 수 없습니다.");
				return map;
			}
			
		// 기존 활성화된 스타일셋 비활성화
		CssApply existingApply = cssApplyService.getActiveApply();
		if(existingApply != null) {
			CssSet existingSet = cssSetService.getCssSet(existingApply.getSetSeq());
			if(existingSet != null) {
				CssSetDTO existingSetDto = CssSetDTO.fromEntity(existingSet);
				existingSetDto.setIsActive("N");
				cssSetService.saveCssSet(existingSetDto);
			}
		}
		
		// 적용 설정 저장
		CssApplyDTO applyDto = new CssApplyDTO();
		applyDto.setSetSeq(setSeq);
		applyDto.setApplyScope(applyScope);
		int result = cssApplyService.saveCssApply(applyDto);
		
		if(result > 0) {
			// 새로 적용할 스타일셋 활성화
			CssSetDTO setDto = CssSetDTO.fromEntity(set);
			setDto.setIsActive("Y");
			cssSetService.saveCssSet(setDto);
			
			map.put("rt", "OK");
			map.put("msg", "스타일셋 적용 성공");
		} else {
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 적용 실패");
		}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 적용 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// 현재 적용된 스타일셋 조회 (CSS_APPLY1 테이블 기준)
	@GetMapping("/css/set/current")
	public Map<String, Object> getCurrentCssSet() {
		Map<String, Object> map = new HashMap<>();
		try {
			// CSS_APPLY1 테이블에서 활성화된 적용 설정 조회
			CssApply apply = cssApplyService.getActiveApply();
			if(apply != null) {
				// 적용 설정의 setSeq로 스타일셋 정보 조회
				CssSet set = cssSetService.getCssSet(apply.getSetSeq());
				if(set != null) {
					Map<String, Object> item = new HashMap<>();
					item.put("setSeq", set.getSetSeq());
					item.put("setName", set.getSetName());
					item.put("setDescription", set.getSetDescription());
					map.put("rt", "OK");
					map.put("item", item);
				} else {
					map.put("rt", "OK");
					map.put("item", null);
				}
			} else {
				map.put("rt", "OK");
				map.put("item", null);
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "현재 스타일셋 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 복제
	@PostMapping("/css/set/copy")
	public Map<String, Object> copyCssSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<>();
		try {
			Integer sourceSetSeq = Integer.parseInt(params.get("sourceSetSeq").toString());
			String newSetName = params.get("newSetName") != null ? params.get("newSetName").toString() : null;
			String newSetDescription = params.get("newSetDescription") != null ? params.get("newSetDescription").toString() : null;
			
			if(newSetName == null || newSetName.trim().isEmpty()) {
				map.put("rt", "FAIL");
				map.put("msg", "새 스타일셋 이름을 입력해주세요.");
				return map;
			}
			
			// 스타일셋 이름 중복 확인
			if(cssSetService.isExistSetName(newSetName)) {
				map.put("rt", "FAIL");
				map.put("msg", "이미 존재하는 스타일셋 이름입니다: " + newSetName);
				return map;
			}
			
			// 원본 스타일셋 조회
			CssSet sourceSet = cssSetService.getCssSet(sourceSetSeq);
			if(sourceSet == null) {
				map.put("rt", "FAIL");
				map.put("msg", "복사할 스타일셋을 찾을 수 없습니다.");
				return map;
			}
			
			// 새 스타일셋 생성
			CssSetDTO newSetDto = new CssSetDTO();
			newSetDto.setSetName(newSetName);
			newSetDto.setSetDescription(newSetDescription != null ? newSetDescription : (sourceSet.getSetDescription() != null ? sourceSet.getSetDescription() + " (복사본)" : "복사본"));
			newSetDto.setIsActive("N");
			
			int setResult = cssSetService.saveCssSet(newSetDto);
			if(setResult <= 0) {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋 생성 실패");
				return map;
			}
			
			// 저장된 새 스타일셋 조회
			CssSet newSet = cssSetService.getCssSetList().stream()
				.filter(s -> s.getSetName().equals(newSetName))
				.findFirst()
				.orElse(null);
			
			if(newSet == null) {
				map.put("rt", "FAIL");
				map.put("msg", "생성된 스타일셋을 찾을 수 없습니다.");
				return map;
			}
			
			// 원본 CSS 파일 목록 조회
			List<CssFile> sourceFiles = cssFileService.getCssFileList(sourceSetSeq);
			
			// CSS 파일 복사 (DB와 파일 시스템 모두)
			for(CssFile sourceFile : sourceFiles) {
				CssFileDTO newFileDto = new CssFileDTO();
				newFileDto.setSetSeq(newSet.getSetSeq());
				newFileDto.setFileName(sourceFile.getFileName());
				newFileDto.setCssContent(sourceFile.getCssContent());
				newFileDto.setFileType(sourceFile.getFileType());
				
				// DB에 저장 (saveCssFile이 파일 시스템에도 저장함)
				cssFileService.saveCssFile(newFileDto);
			}
			
			// 파일 시스템에서도 복사 (원본 폴더에서 새 폴더로)
			try {
				String baseCssPath;
				if(cssPath != null && !cssPath.isEmpty()) {
					baseCssPath = cssPath;
				} else {
					baseCssPath = System.getProperty("user.dir") + "/../frontend/src/css";
				}
				
				// sourceSet은 이미 위에서 선언됨
				if(sourceSet != null) {
					String sourcePath = baseCssPath + "/" + sourceSet.getSetName();
					String newPath = baseCssPath + "/" + newSetName;
					
					File sourceDir = new File(sourcePath);
					File newDir = new File(newPath);
					
					if(sourceDir.exists() && !newDir.exists()) {
						newDir.mkdirs();
						String[] fileTypes = {"imageboard", "member", "header", "footer"};
						for(String fileType : fileTypes) {
							File sourceFile = new File(sourceDir, fileType + ".css");
							File newFile = new File(newDir, fileType + ".css");
							if(sourceFile.exists()) {
								Files.copy(sourceFile.toPath(), newFile.toPath());
							}
						}
					}
				}
			} catch(Exception e) {
				System.err.println("파일 시스템 복사 실패: " + e.getMessage());
				// 파일 시스템 복사 실패해도 DB 복사는 성공했으므로 계속 진행
			}
			
			map.put("rt", "OK");
			map.put("msg", "스타일셋이 복제되었습니다.");
			map.put("setSeq", newSet.getSetSeq());
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 복제 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// 스타일셋 적용 해제
	@PostMapping("/css/set/unapply")
	public Map<String, Object> unapplyCssSet() {
		Map<String, Object> map = new HashMap<>();
		try {
			// 현재 활성화된 적용 설정 조회
			CssApply apply = cssApplyService.getActiveApply();
			if(apply == null) {
				map.put("rt", "FAIL");
				map.put("msg", "적용된 스타일셋이 없습니다.");
				return map;
			}
			
			// 적용 설정 비활성화
			int applyResult = cssApplyService.unapplyCssApply();
			if(applyResult <= 0) {
				map.put("rt", "FAIL");
				map.put("msg", "적용 설정 비활성화 실패");
				return map;
			}
			
			// 스타일셋 비활성화
			CssSet set = cssSetService.getCssSet(apply.getSetSeq());
			if(set != null) {
				CssSetDTO setDto = CssSetDTO.fromEntity(set);
				setDto.setIsActive("N");
				cssSetService.saveCssSet(setDto);
			}
			
			map.put("rt", "OK");
			map.put("msg", "스타일셋 적용이 해제되었습니다.");
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "스타일셋 적용 해제 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// CSS 파일에서 스타일셋 가져오기 (샘플 스타일셋 등록)
	@PostMapping("/css/set/importFromFile")
	public Map<String, Object> importCssSetFromFile(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<>();
		try {
			String setName = params.get("setName") != null ? params.get("setName").toString() : "cssset_1";
			String setDescription = params.get("setDescription") != null ? params.get("setDescription").toString() : "샘플 CSS 스타일셋";
			
			// 스타일셋 이름 중복 확인
			if(cssSetService.isExistSetName(setName)) {
				map.put("rt", "FAIL");
				map.put("msg", "이미 존재하는 스타일셋 이름입니다: " + setName);
				return map;
			}
			
			// CSS 파일 경로 설정 (프론트엔드 src/css 폴더 기준)
			String baseCssPath;
			if(cssPath != null && !cssPath.isEmpty()) {
				baseCssPath = cssPath;
			} else {
				// 기본값: 상대 경로 (백업용)
				baseCssPath = System.getProperty("user.dir") + "/../frontend/src/css";
			}
			String targetCssPath = baseCssPath + "/" + setName;
			
			// CSS 파일 읽기
			String[] fileTypes = {"imageboard", "member", "header", "footer"};
			Map<String, String> cssContents = new HashMap<>();
			
			for(String fileType : fileTypes) {
				String filePath = targetCssPath + "/" + fileType + ".css";
				File cssFile = new File(filePath);
				
				if(cssFile.exists()) {
					try {
						String content = new String(Files.readAllBytes(Paths.get(filePath)));
						cssContents.put(fileType, content);
					} catch(IOException e) {
						System.err.println("CSS 파일 읽기 실패: " + filePath + " - " + e.getMessage());
						cssContents.put(fileType, ""); // 빈 내용으로 설정
					}
				} else {
					System.err.println("CSS 파일이 존재하지 않습니다: " + filePath);
					cssContents.put(fileType, ""); // 빈 내용으로 설정
				}
			}
			
			// 스타일셋 저장
			CssSetDTO setDto = new CssSetDTO();
			setDto.setSetName(setName);
			setDto.setSetDescription(setDescription);
			setDto.setIsActive("N");
			
			int setResult = cssSetService.saveCssSet(setDto);
			if(setResult <= 0) {
				map.put("rt", "FAIL");
				map.put("msg", "스타일셋 저장 실패");
				return map;
			}
			
			// 저장된 스타일셋 조회
			CssSet savedSet = cssSetService.getCssSetList().stream()
				.filter(s -> s.getSetName().equals(setName))
				.findFirst()
				.orElse(null);
			
			if(savedSet == null) {
				map.put("rt", "FAIL");
				map.put("msg", "저장된 스타일셋을 찾을 수 없습니다.");
				return map;
			}
			
			// CSS 파일 저장
			for(String fileType : fileTypes) {
				CssFileDTO fileDto = new CssFileDTO();
				fileDto.setSetSeq(savedSet.getSetSeq());
				fileDto.setFileName(fileType + ".css");
				fileDto.setCssContent(cssContents.get(fileType));
				fileDto.setFileType(fileType);
				
				cssFileService.saveCssFile(fileDto);
			}
			
			map.put("rt", "OK");
			map.put("msg", "CSS 스타일셋이 성공적으로 가져와졌습니다.");
			map.put("setSeq", savedSet.getSetSeq());
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "CSS 스타일셋 가져오기 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// ========== CSS 파일 API ==========
	
	// 스타일셋 내 CSS 파일 목록 조회
	@GetMapping("/css/file/list")
	public Map<String, Object> getCssFileList(@RequestParam("setSeq") Integer setSeq) {
		Map<String, Object> map = new HashMap<>();
		try {
			List<CssFile> list = cssFileService.getCssFileList(setSeq);
			List<Map<String, Object>> items = new ArrayList<>();
			for(CssFile file : list) {
				Map<String, Object> item = new HashMap<>();
				item.put("fileSeq", file.getFileSeq());
				item.put("setSeq", file.getSetSeq());
				item.put("fileName", file.getFileName());
				item.put("cssContent", file.getCssContent());
				item.put("fileType", file.getFileType());
				item.put("createdDate", file.getCreatedDate());
				item.put("modifiedDate", file.getModifiedDate());
				items.add(item);
			}
			map.put("rt", "OK");
			map.put("items", items);
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "CSS 파일 목록 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// CSS 파일 상세 조회
	@GetMapping("/css/file/get")
	public Map<String, Object> getCssFile(@RequestParam("fileSeq") Integer fileSeq) {
		Map<String, Object> map = new HashMap<>();
		try {
			CssFile file = cssFileService.getCssFile(fileSeq);
			if(file != null) {
				Map<String, Object> item = new HashMap<>();
				item.put("fileSeq", file.getFileSeq());
				item.put("setSeq", file.getSetSeq());
				item.put("fileName", file.getFileName());
				item.put("cssContent", file.getCssContent());
				item.put("fileType", file.getFileType());
				item.put("createdDate", file.getCreatedDate());
				item.put("modifiedDate", file.getModifiedDate());
				map.put("rt", "OK");
				map.put("item", item);
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "CSS 파일을 찾을 수 없습니다.");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "CSS 파일 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// 타입별 CSS 파일 조회
	@GetMapping("/css/file/getByType")
	public Map<String, Object> getCssFileByType(@RequestParam("setSeq") Integer setSeq, @RequestParam("type") String type) {
		Map<String, Object> map = new HashMap<>();
		try {
			CssFile file = cssFileService.getCssFileByType(setSeq, type);
			if(file != null) {
				Map<String, Object> item = new HashMap<>();
				item.put("fileSeq", file.getFileSeq());
				item.put("setSeq", file.getSetSeq());
				item.put("fileName", file.getFileName());
				item.put("cssContent", file.getCssContent());
				item.put("fileType", file.getFileType());
				map.put("rt", "OK");
				map.put("item", item);
			} else {
				map.put("rt", "OK");
				map.put("item", null);
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "CSS 파일 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// CSS 파일 저장/수정 (DB와 파일 시스템 모두 업데이트)
	@PostMapping("/css/file/save")
	public Map<String, Object> saveCssFile(@RequestBody CssFileDTO dto) {
		Map<String, Object> map = new HashMap<>();
		try {
			// DB에 저장
			int result = cssFileService.saveCssFile(dto);
			if(result > 0) {
				// 파일 시스템에도 저장
				try {
					// 스타일셋 이름 조회
					CssSet set = cssSetService.getCssSet(dto.getSetSeq());
					if(set != null) {
						// CSS 파일 경로 설정
						String baseCssPath;
						if(cssPath != null && !cssPath.isEmpty()) {
							baseCssPath = cssPath;
						} else {
							baseCssPath = System.getProperty("user.dir") + "/../frontend/src/css";
						}
						String setFolderPath = baseCssPath + "/" + set.getSetName();
						
						// 폴더가 없으면 생성
						File setFolder = new File(setFolderPath);
						if(!setFolder.exists()) {
							setFolder.mkdirs();
						}
						
						// CSS 파일 저장
						String filePath = setFolderPath + "/" + dto.getFileName();
						Files.write(Paths.get(filePath), dto.getCssContent().getBytes("UTF-8"));
					}
				} catch(IOException e) {
					System.err.println("CSS 파일 시스템 저장 실패: " + e.getMessage());
					// 파일 시스템 저장 실패해도 DB 저장은 성공했으므로 계속 진행
				}
				
				map.put("rt", "OK");
				map.put("msg", "CSS 파일 저장 성공");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "CSS 파일 저장 실패");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "CSS 파일 저장 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// ========== CSS 적용 API ==========
	
	// 현재 적용 설정 조회
	@GetMapping("/css/apply/current")
	public Map<String, Object> getCurrentApply() {
		Map<String, Object> map = new HashMap<>();
		try {
			CssApply apply = cssApplyService.getCurrentApply();
			if(apply != null) {
				Map<String, Object> item = new HashMap<>();
				item.put("applySeq", apply.getApplySeq());
				item.put("setSeq", apply.getSetSeq());
				item.put("applyScope", apply.getApplyScope());
				item.put("isActive", apply.getIsActive());
				item.put("appliedDate", apply.getAppliedDate());
				map.put("rt", "OK");
				map.put("item", item);
			} else {
				map.put("rt", "OK");
				map.put("item", null);
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "적용 설정 조회 실패: " + e.getMessage());
		}
		return map;
	}
	
	// 적용 설정 저장
	@PostMapping("/css/apply/save")
	public Map<String, Object> saveCssApply(@RequestBody CssApplyDTO dto) {
		Map<String, Object> map = new HashMap<>();
		try {
			int result = cssApplyService.saveCssApply(dto);
			if(result > 0) {
				map.put("rt", "OK");
				map.put("msg", "적용 설정 저장 성공");
			} else {
				map.put("rt", "FAIL");
				map.put("msg", "적용 설정 저장 실패");
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "적용 설정 저장 중 오류: " + e.getMessage());
		}
		return map;
	}
	
	// 활성화된 CSS 조회 (프론트엔드 적용용)
	@GetMapping("/css/apply/active")
	public Map<String, Object> getActiveCss() {
		Map<String, Object> map = new HashMap<>();
		try {
			CssApply apply = cssApplyService.getActiveApply();
			if(apply != null) {
				// 스타일셋 정보 조회
				CssSet set = cssSetService.getCssSet(apply.getSetSeq());
				if(set != null) {
					// 적용 범위에 따라 CSS 파일 조회
					String applyScope = apply.getApplyScope();
					List<String> fileTypes = new ArrayList<>();
					
					if("FULL".equals(applyScope)) {
						// 전체 적용: member + imageboard + header + footer
						fileTypes.add("imageboard");
						fileTypes.add("member");
						fileTypes.add("header");
						fileTypes.add("footer");
					} else if("MEMBER".equals(applyScope)) {
						// 회원 적용: member 폴더 안의 모든 jsx
						fileTypes.add("member");
					} else if("IMAGEBOARD".equals(applyScope)) {
						// 이미지보드 적용: imageboard 폴더 안의 모든 jsx
						fileTypes.add("imageboard");
					} else if("HEADER_FOOTER".equals(applyScope)) {
						// 상단 하단 적용: layouts 안의 헤더 풋터 jsx
						fileTypes.add("header");
						fileTypes.add("footer");
					} else if("IMAGEBOARD_MEMBER".equals(applyScope)) {
						// 하위 호환성을 위한 기존 값
						fileTypes.add("imageboard");
						fileTypes.add("member");
					}
					
					// CSS 파일 조회 (DB에서 조회하되, 파일 시스템이 있으면 파일 시스템 우선)
					List<Map<String, Object>> cssFiles = new ArrayList<>();
					
					// 파일 시스템 경로 설정
					String baseCssPath;
					if(cssPath != null && !cssPath.isEmpty()) {
						baseCssPath = cssPath;
					} else {
						baseCssPath = System.getProperty("user.dir") + "/../frontend/src/css";
					}
					String setFolderPath = baseCssPath + "/" + set.getSetName();
					
					for(String fileType : fileTypes) {
						String cssContent = null;
						
						// 파일 시스템에서 먼저 읽기 시도
						try {
							String filePath = setFolderPath + "/" + fileType + ".css";
							File cssFile = new File(filePath);
							if(cssFile.exists()) {
								cssContent = new String(Files.readAllBytes(Paths.get(filePath)), "UTF-8");
								System.out.println("파일 시스템에서 CSS 읽기 성공: " + filePath);
							}
						} catch(IOException e) {
							System.err.println("파일 시스템에서 CSS 읽기 실패: " + fileType + ".css - " + e.getMessage());
						}
						
						// 파일 시스템에 없으면 DB에서 읽기
						if(cssContent == null || cssContent.trim().isEmpty()) {
							CssFile file = cssFileService.getCssFileByType(apply.getSetSeq(), fileType);
							if(file != null) {
								cssContent = file.getCssContent();
								System.out.println("DB에서 CSS 읽기 성공: " + fileType + ".css");
							}
						}
						
						// CSS 내용이 있으면 추가
						if(cssContent != null && !cssContent.trim().isEmpty()) {
							Map<String, Object> cssItem = new HashMap<>();
							cssItem.put("fileType", fileType);
							cssItem.put("cssContent", cssContent);
							cssFiles.add(cssItem);
						}
					}
					
					Map<String, Object> result = new HashMap<>();
					result.put("setSeq", set.getSetSeq());
					result.put("setName", set.getSetName());
					result.put("applyScope", applyScope);
					result.put("cssFiles", cssFiles);
					
					map.put("rt", "OK");
					map.put("data", result);
				} else {
					map.put("rt", "FAIL");
					map.put("msg", "스타일셋을 찾을 수 없습니다.");
				}
			} else {
				map.put("rt", "OK");
				map.put("data", null);
			}
		} catch(Exception e) {
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "활성화된 CSS 조회 실패: " + e.getMessage());
		}
		return map;
	}
}
