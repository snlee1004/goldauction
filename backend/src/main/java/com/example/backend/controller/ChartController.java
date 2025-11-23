package com.example.backend.controller;

import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChartController {
	
	@Value("${project.upload.path}")
	private String uploadpath;
	
	@Value("${project.chart.path}")
	private String chartpath;
	
	// 차트셋 저장 경로 (프론트엔드 src/chart 폴더)
	private String getChartBasePath() {
		// application.properties에서 설정된 경로 사용
		if(chartpath != null && !chartpath.isEmpty()) {
			return chartpath;
		}
		// 기본값: 상대 경로 (백업용)
		return System.getProperty("user.dir") + "/../frontend/src/chart";
	}
	
	// 현재 적용된 차트셋 이름 저장 파일
	private String getCurrentChartSetFile() {
		return getChartBasePath() + "/current.txt";
	}
	
	// 차트셋 목록 조회
	@GetMapping("/chart/list")
	public Map<String, Object> getChartSetList() {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			File chartBaseDir = new File(getChartBasePath());
			if(!chartBaseDir.exists()) {
				chartBaseDir.mkdirs();
			}
			
			List<Map<String, String>> chartSetList = new ArrayList<>();
			File[] dirs = chartBaseDir.listFiles(File::isDirectory);
			
			if(dirs != null) {
				for(File dir : dirs) {
					String setName = dir.getName();
					if(!setName.equals("current.txt")) {
						Map<String, String> chartSet = new HashMap<>();
						chartSet.put("name", setName);
						chartSet.put("description", setName); // 기본값
						chartSetList.add(chartSet);
					}
				}
			}
			
			map.put("rt", "OK");
			map.put("items", chartSetList);
			map.put("total", chartSetList.size());
		} catch(Exception e) {
			System.err.println("차트셋 목록 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "차트셋 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
			map.put("items", new ArrayList<>());
		}
		return map;
	}
	
	// 차트셋 상세 조회
	@GetMapping("/chart/get")
	public Map<String, Object> getChartSet(@RequestParam("name") String name) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String basePath = getChartBasePath();
			String chartSetPath = basePath + "/" + name;
			File chartSetDir = new File(chartSetPath);
			
			System.out.println("차트셋 조회 시작 - name: " + name);
			System.out.println("차트셋 기본 경로: " + basePath);
			System.out.println("차트셋 전체 경로: " + chartSetPath);
			System.out.println("차트셋 디렉토리 존재 여부: " + chartSetDir.exists());
			
			// 기본 경로 존재 여부 확인
			File baseDir = new File(basePath);
			if(!baseDir.exists()) {
				System.err.println("차트셋 기본 디렉토리를 찾을 수 없습니다: " + basePath);
				map.put("rt", "FAIL");
				map.put("msg", "차트셋 기본 디렉토리를 찾을 수 없습니다: " + basePath);
				return map;
			}
			
			if(!chartSetDir.exists()) {
				System.err.println("차트셋 디렉토리를 찾을 수 없습니다: " + chartSetPath);
				map.put("rt", "FAIL");
				map.put("msg", "차트셋을 찾을 수 없습니다: " + name);
				return map;
			}
			
			// Chart.jsx 파일 읽기
			String chartCode = "";
			try {
				File chartFile = new File(chartSetPath + "/Chart.jsx");
				System.out.println("Chart.jsx 파일 경로: " + chartFile.getAbsolutePath());
				System.out.println("Chart.jsx 파일 존재 여부: " + chartFile.exists());
				if(chartFile.exists()) {
					chartCode = new String(Files.readAllBytes(chartFile.toPath()), "UTF-8");
					System.out.println("Chart.jsx 파일 크기: " + chartCode.length() + " bytes");
				} else {
					System.err.println("Chart.jsx 파일을 찾을 수 없습니다: " + chartFile.getAbsolutePath());
				}
			} catch(Exception e) {
				System.err.println("Chart.jsx 파일 읽기 오류: " + e.getMessage());
				e.printStackTrace();
			}
			
			// News.jsx 파일 읽기
			String newsCode = "";
			try {
				File newsFile = new File(chartSetPath + "/News.jsx");
				System.out.println("News.jsx 파일 경로: " + newsFile.getAbsolutePath());
				System.out.println("News.jsx 파일 존재 여부: " + newsFile.exists());
				if(newsFile.exists()) {
					newsCode = new String(Files.readAllBytes(newsFile.toPath()), "UTF-8");
					System.out.println("News.jsx 파일 크기: " + newsCode.length() + " bytes");
				} else {
					System.err.println("News.jsx 파일을 찾을 수 없습니다: " + newsFile.getAbsolutePath());
				}
			} catch(Exception e) {
				System.err.println("News.jsx 파일 읽기 오류: " + e.getMessage());
				e.printStackTrace();
			}
			
			// chart.css 파일 읽기
			String cssCode = "";
			try {
				File cssFile = new File(chartSetPath + "/chart.css");
				System.out.println("chart.css 파일 경로: " + cssFile.getAbsolutePath());
				System.out.println("chart.css 파일 존재 여부: " + cssFile.exists());
				if(cssFile.exists()) {
					cssCode = new String(Files.readAllBytes(cssFile.toPath()), "UTF-8");
					System.out.println("chart.css 파일 크기: " + cssCode.length() + " bytes");
				} else {
					System.err.println("chart.css 파일을 찾을 수 없습니다: " + cssFile.getAbsolutePath());
				}
			} catch(Exception e) {
				System.err.println("chart.css 파일 읽기 오류: " + e.getMessage());
				e.printStackTrace();
			}
			
			Map<String, Object> chartSet = new HashMap<>();
			chartSet.put("name", name);
			chartSet.put("chartCode", chartCode);
			chartSet.put("newsCode", newsCode);
			chartSet.put("cssCode", cssCode);
			
			map.put("rt", "OK");
			map.put("item", chartSet);
			System.out.println("차트셋 조회 완료 - name: " + name);
		} catch(Exception e) {
			System.err.println("차트셋 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "차트셋 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 차트셋 저장/수정
	@PostMapping("/chart/save")
	public Map<String, Object> saveChartSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String name = params.get("name").toString();
			String chartCode = params.get("chartCode") != null ? params.get("chartCode").toString() : "";
			String newsCode = params.get("newsCode") != null ? params.get("newsCode").toString() : "";
			String cssCode = params.get("cssCode") != null ? params.get("cssCode").toString() : "";
			
			String chartSetPath = getChartBasePath() + "/" + name;
			File chartSetDir = new File(chartSetPath);
			if(!chartSetDir.exists()) {
				chartSetDir.mkdirs();
			}
			
			// Chart.jsx 파일 저장
			if(!chartCode.isEmpty()) {
				File chartFile = new File(chartSetPath + "/Chart.jsx");
				try(FileWriter writer = new FileWriter(chartFile)) {
					writer.write(chartCode);
				}
			}
			
			// News.jsx 파일 저장
			if(!newsCode.isEmpty()) {
				File newsFile = new File(chartSetPath + "/News.jsx");
				try(FileWriter writer = new FileWriter(newsFile)) {
					writer.write(newsCode);
				}
			}
			
			// chart.css 파일 저장
			if(!cssCode.isEmpty()) {
				File cssFile = new File(chartSetPath + "/chart.css");
				try(FileWriter writer = new FileWriter(cssFile)) {
					writer.write(cssCode);
				}
			}
			
			map.put("rt", "OK");
			map.put("msg", "차트셋이 저장되었습니다.");
		} catch(Exception e) {
			System.err.println("차트셋 저장 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "차트셋 저장 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 차트셋 삭제
	@PostMapping("/chart/delete")
	public Map<String, Object> deleteChartSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String name = params.get("name").toString();
			String chartSetPath = getChartBasePath() + "/" + name;
			File chartSetDir = new File(chartSetPath);
			
			if(chartSetDir.exists()) {
				// 폴더 내 모든 파일 삭제
				File[] files = chartSetDir.listFiles();
				if(files != null) {
					for(File file : files) {
						file.delete();
					}
				}
				// 폴더 삭제
				chartSetDir.delete();
			}
			
			map.put("rt", "OK");
			map.put("msg", "차트셋이 삭제되었습니다.");
		} catch(Exception e) {
			System.err.println("차트셋 삭제 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "차트셋 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 차트셋 적용
	@PostMapping("/chart/apply")
	public Map<String, Object> applyChartSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String name = params.get("name").toString();
			File currentFile = new File(getCurrentChartSetFile());
			
			// 현재 적용된 차트셋 이름 저장
			try(FileWriter writer = new FileWriter(currentFile)) {
				writer.write(name);
			}
			
			map.put("rt", "OK");
			map.put("msg", "차트셋이 적용되었습니다.");
		} catch(Exception e) {
			System.err.println("차트셋 적용 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "차트셋 적용 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
	
	// 현재 적용된 차트셋 이름 조회
	@GetMapping("/chart/current")
	public Map<String, Object> getCurrentChartSet() {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			File currentFile = new File(getCurrentChartSetFile());
			String currentName = "chartSet_1"; // 기본값
			
			if(currentFile.exists()) {
				String content = new String(Files.readAllBytes(currentFile.toPath())).trim();
				if(content != null && !content.isEmpty()) {
					currentName = content;
				}
			}
			
			map.put("rt", "OK");
			map.put("name", currentName);
		} catch(Exception e) {
			System.err.println("현재 차트셋 조회 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "OK");
			map.put("name", "chartSet_1"); // 오류 시 기본값
		}
		return map;
	}
	
	// 차트셋 복사
	@PostMapping("/chart/copy")
	public Map<String, Object> copyChartSet(@RequestBody Map<String, Object> params) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String sourceName = params.get("sourceName").toString();
			String targetName = params.get("targetName").toString();
			
			String basePath = getChartBasePath();
			String sourcePath = basePath + "/" + sourceName;
			String targetPath = basePath + "/" + targetName;
			
			File sourceDir = new File(sourcePath);
			File targetDir = new File(targetPath);
			
			// 소스 차트셋 존재 확인
			if(!sourceDir.exists()) {
				map.put("rt", "FAIL");
				map.put("msg", "복사할 차트셋을 찾을 수 없습니다: " + sourceName);
				return map;
			}
			
			// 대상 차트셋이 이미 존재하는지 확인
			if(targetDir.exists()) {
				map.put("rt", "FAIL");
				map.put("msg", "이미 존재하는 차트셋입니다: " + targetName);
				return map;
			}
			
			// 대상 폴더 생성
			targetDir.mkdirs();
			
			// 파일 복사
			File[] sourceFiles = sourceDir.listFiles();
			if(sourceFiles != null) {
				for(File sourceFile : sourceFiles) {
					if(sourceFile.isFile()) {
						Path sourceFilePath = sourceFile.toPath();
						Path targetFilePath = Paths.get(targetPath, sourceFile.getName());
						Files.copy(sourceFilePath, targetFilePath, StandardCopyOption.REPLACE_EXISTING);
					}
				}
			}
			
			map.put("rt", "OK");
			map.put("msg", "차트셋이 복사되었습니다.");
		} catch(Exception e) {
			System.err.println("차트셋 복사 오류: " + e.getMessage());
			e.printStackTrace();
			map.put("rt", "FAIL");
			map.put("msg", "차트셋 복사 중 오류가 발생했습니다: " + e.getMessage());
		}
		return map;
	}
}

