# PlantUML 이미지 생성 가이드

## 🎯 PPT 삽입용 최적 포맷

### 1. **SVG 형식 (가장 추천) ⭐**
- **장점**: 벡터 형식으로 확대해도 깨지지 않음, 파일 크기 작음, PPT에서 편집 가능
- **단점**: 일부 PPT 버전에서 지원 안 될 수 있음 (최신 버전은 대부분 지원)

**생성 방법:**
```bash
# PlantUML 서버 사용
http://www.plantuml.com/plantuml/svg/[인코딩된_문자열]

# VS Code 확장 사용
- 파일 우클릭 → "Export Current Diagram" → "SVG"
- 또는 단축키: Alt+D → SVG 선택
```

### 2. **PNG 형식 (고해상도)**
- **장점**: 모든 PPT 버전에서 지원, 호환성 좋음
- **단점**: 확대 시 깨질 수 있음 (고해상도로 생성 필요)

**고해상도 PNG 생성 방법:**
```bash
# PlantUML 서버에서 DPI 설정
http://www.plantuml.com/plantuml/png/[인코딩된_문자열]

# VS Code 확장에서 설정
- 설정에서 "PlantUML: Export Format" → "PNG"
- "PlantUML: Export DPI" → 300 이상 설정 (기본값: 96)
```

### 3. **PDF 형식**
- **장점**: 문서용으로 최적, 인쇄 품질 우수
- **단점**: PPT에 직접 삽입 시 편집 어려움

---

## 🛠️ 생성 방법별 상세 가이드

### 방법 1: VS Code PlantUML 확장 사용 (가장 편리)

1. **확장 설치**
   - VS Code에서 "PlantUML" 확장 설치
   - Markdown Preview Mermaid Support (선택)

2. **고품질 이미지 생성**
   ```
   - .puml 파일 열기
   - Alt+D (또는 우클릭 → "Export Current Diagram")
   - 포맷 선택: SVG (추천) 또는 PNG
   ```

3. **DPI 설정 (PNG 선택 시)**
   ```json
   // settings.json에 추가
   {
     "plantuml.exportFormat": "png",
     "plantuml.exportDPI": 300
   }
   ```

### 방법 2: PlantUML 서버 사용 (온라인)

1. **PlantUML 서버 접속**
   - http://www.plantuml.com/plantuml/uml/

2. **코드 입력 및 이미지 생성**
   - .puml 파일 내용 복사 → 붙여넣기
   - 우측 상단에서 포맷 선택 (SVG/PNG/PDF)
   - 다운로드

3. **직접 URL 생성 (고급)**
   ```
   http://www.plantuml.com/plantuml/svg/[인코딩된_문자열]
   ```

### 방법 3: Java 명령줄 사용 (로컬)

1. **PlantUML JAR 다운로드**
   ```bash
   # plantuml.jar 다운로드
   wget http://sourceforge.net/projects/plantuml/files/plantuml.jar/download
   ```

2. **이미지 생성**
   ```bash
   # SVG 생성
   java -jar plantuml.jar -tsvg table_relationship_diagram.puml
   
   # 고해상도 PNG 생성 (DPI 300)
   java -jar plantuml.jar -tpng -SDPI=300 table_relationship_diagram.puml
   
   # PDF 생성
   java -jar plantuml.jar -tpdf table_relationship_diagram.puml
   ```

---

## 📊 PPT 삽입 시 권장 설정

### SVG 사용 시
1. **PPT에 삽입**
   - 삽입 → 그림 → 파일에서 → SVG 선택
   - 또는 드래그 앤 드롭

2. **크기 조정**
   - SVG는 벡터 형식이므로 자유롭게 확대/축소 가능
   - 우클릭 → "그림 서식" → 크기 조정

### PNG 사용 시
1. **고해상도 이미지 생성**
   - 최소 300 DPI 권장
   - PPT 슬라이드 크기 고려 (1920x1080 기준)

2. **PPT에 삽입**
   - 삽입 → 그림 → 파일에서 → PNG 선택
   - 크기 조정 시 비율 유지

---

## ⚙️ PlantUML 파일 최적화 설정

### PPT용 다이어그램 최적화
```puml
@startuml
!theme plain
skinparam defaultFontName "Malgun Gothic"
skinparam defaultFontSize 14
skinparam shadowing false
skinparam roundcorner 15
skinparam linetype ortho

' 고품질 출력을 위한 설정
skinparam dpi 300
skinparam antialias true

' ... 다이어그램 내용 ...
@enduml
```

### 추가 최적화 팁
1. **폰트 크기**: PPT에서 보기 좋도록 12-16pt 권장
2. **여백**: 충분한 여백 확보
3. **색상**: 대비가 명확한 색상 사용
4. **레이아웃**: 직교선(ortho) 사용으로 깔끔한 배치

---

## 🎨 PPT 삽입 후 편집 팁

### SVG 편집 (PowerPoint 2019 이상)
- SVG 삽입 후 → "그래픽으로 변환" → 개별 요소 편집 가능
- 색상, 크기, 위치 자유롭게 조정

### PNG 편집
- 그림 서식 → 색상 조정, 투명도 설정 가능
- 개별 요소 편집은 불가 (이미지 편집 도구 필요)

---

## 📝 체크리스트

- [ ] SVG 형식으로 생성 (우선순위 1)
- [ ] PNG 사용 시 최소 300 DPI 설정
- [ ] 한글 폰트 설정 확인 (Malgun Gothic)
- [ ] PPT 슬라이드 크기에 맞게 조정
- [ ] 이미지 품질 확인 (확대 시 깨짐 여부)
- [ ] 파일 크기 확인 (너무 크면 최적화)

---

## 🔗 유용한 링크

- PlantUML 공식 사이트: http://plantuml.com/
- PlantUML 온라인 서버: http://www.plantuml.com/plantuml/uml/
- VS Code PlantUML 확장: https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml

---

## 💡 추천 워크플로우

1. **VS Code에서 .puml 파일 작성**
2. **Alt+D로 SVG 형식으로 내보내기**
3. **PPT에 SVG 삽입**
4. **크기 및 위치 조정**
5. **완료!**



