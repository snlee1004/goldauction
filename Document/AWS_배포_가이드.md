# 골드옥션 AWS 배포 가이드

## 📋 목차
1. [AWS EC2 인스턴스 생성](#aws-ec2-인스턴스-생성)
2. [EC2 초기 설정](#ec2-초기-설정)
3. [GitHub Actions 설정](#github-actions-설정)
4. [자동 배포 실행](#자동-배포-실행)
5. [비용 최적화](#비용-최적화)

---

## 📌 현재 설정된 서버 정보

> **이 정보는 이미 설정된 값입니다. 아래 설명을 참고하여 사용하세요.**

### AWS EC2 서버 정보
- **서버 IP**: `3.34.28.145`
- **EC2 사용자명**: `ubuntu` (Ubuntu 기본 사용자명)
- **인스턴스 이름**: `goldauction`
- **인스턴스 ID**: `i-03b5445a1c75016f3`
- **SSH 키 파일**: `C:\Users\elosy\Downloads\goldauction-key.pem
- ** 접속 **: ssh -i goldauction-key.pem ubuntu@3.34.28.145

### Oracle 데이터베이스 정보
- **데이터베이스 이름**: `Clone-of-dteam1`
- **사용자 ID**: `ADMIN`
- **비밀번호**: `n6$-cB_h&Hib`Mj`
- **TNS 연결 문자열**: 
  ```
  jdbc:oracle:thin:@(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-chuncheon-1.oraclecloud.com))(connect_data=(service_name=g175ea3ba887787_dwdtcxph2hgpl0hh_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))
  ```

---

## 🖥️ AWS EC2 인스턴스 생성

### 1. EC2 인스턴스 생성

1. **AWS Console** 접속 → **EC2** 서비스 선택
2. **Launch Instance** 클릭
3. 설정:

   **기본 설정:**
   - **Name**: `goldauction-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: `t2.micro` (Free tier) 또는 `t3.micro`
   - **Key pair**: 새로 생성 또는 기존 키 사용
   - **Network settings**: 
     - VPC: 기본 VPC 또는 새로 생성
     - Subnet: Public subnet
     - Auto-assign Public IP: Enable
     - Security group: 새로 생성
       - SSH (22): My IP
       - HTTP (80): Anywhere (0.0.0.0/0)
       - HTTPS (443): Anywhere (0.0.0.0/0)
   - **Storage**: 8GB gp3 (Free tier)

4. **Launch Instance** 클릭

### 2. Elastic IP 할당 (선택사항, 권장)

동적 IP 대신 고정 IP 사용:

1. **EC2 → Elastic IPs → Allocate Elastic IP address**
2. **Allocate** 클릭
3. **Actions → Associate Elastic IP address**
4. 생성한 인스턴스 선택 후 **Associate**

### 3. EC2 접속 (Windows 환경)

> **⚠️ 중요 구분:**
> - **로컬 컴퓨터 (Windows)**: 아래 명령어들을 실행하는 곳
> - **AWS EC2 서버 (Ubuntu)**: 접속 후 명령어를 실행하는 곳
> - **Git Bash**: Windows에 설치하는 프로그램 (EC2에는 설치 안 됨)

#### 방법 1: PowerShell 사용 (권장)

**📍 실행 위치: 로컬 컴퓨터 (Windows)**

**1단계: PowerShell 열기 (로컬 컴퓨터)**
- Windows 키 + X → "Windows PowerShell" 또는 "터미널" 선택
- **이것은 여러분의 Windows 컴퓨터입니다!**

**2단계: 키 파일 위치로 이동 (로컬 컴퓨터)**
```powershell
# 로컬 컴퓨터의 Downloads 폴더로 이동
cd C:\Users\elosy\Downloads
```

**3단계: SSH 키 권한 설정 (로컬 컴퓨터, 선택사항)**
```powershell
# Windows에서는 chmod가 없지만, 키 파일의 보안 속성 확인
# 파일 우클릭 → 속성 → 보안 → 고급 → 상속 비활성화 → 권한 편집
```

**4단계: EC2 접속 (로컬 컴퓨터에서 실행)**
```powershell
# 로컬 컴퓨터에서 실행 → AWS EC2 서버로 접속
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**접속 성공 시:**
```
Welcome to Ubuntu 22.04 LTS...
ubuntu@ip-xxx-xxx-xxx-xxx:~$  ← 이제 AWS EC2 서버에 접속된 상태!
```

> **접속 후**: 프롬프트가 `ubuntu@ip-xxx-xxx-xxx-xxx:~$`로 바뀌면 **AWS EC2 서버**에 접속된 것입니다.

#### 방법 2: Git Bash 사용

> **📍 Git Bash는 Windows 로컬 컴퓨터에 설치하는 프로그램입니다!**
> - AWS EC2에는 Git Bash가 **설치되어 있지 않습니다**
> - EC2는 Ubuntu Linux이므로 기본적으로 **bash**가 있습니다
> - 아래 명령어는 모두 **로컬 컴퓨터 (Windows)**에서 실행합니다

**1단계: Git Bash 설치 및 열기 (로컬 컴퓨터)**
- Git이 설치되어 있지 않다면: https://git-scm.com/downloads 에서 다운로드
- Git Bash 열기: 시작 메뉴 → Git → Git Bash
- **이것은 여러분의 Windows 컴퓨터입니다!**

**2단계: 키 파일 위치로 이동 (로컬 컴퓨터)**
```bash
# 로컬 컴퓨터의 Downloads 폴더로 이동
cd /c/Users/elosy/Downloads
```

**3단계: SSH 키 권한 설정 (로컬 컴퓨터)**
```bash
# 로컬 컴퓨터에서 키 파일 권한 설정
# Git Bash에서는 chmod 사용 가능
chmod 400 goldauction-key.pem
```

**4단계: EC2 접속 (로컬 컴퓨터에서 실행)**
```bash
# 로컬 컴퓨터에서 실행 → AWS EC2 서버로 접속
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**접속 성공 시:**
```
Welcome to Ubuntu 22.04 LTS...
ubuntu@ip-xxx-xxx-xxx-xxx:~$  ← 이제 AWS EC2 서버에 접속된 상태!
```

> **접속 후**: 프롬프트가 `ubuntu@ip-xxx-xxx-xxx-xxx:~$`로 바뀌면 **AWS EC2 서버**에 접속된 것입니다.
> 이제부터 입력하는 명령어는 **AWS EC2 서버**에서 실행됩니다.

#### 방법 3: Windows Terminal 사용

**1단계: Windows Terminal 열기**
- Windows 키 + R → `wt` 입력

**2단계: 명령어 실행**
```powershell
cd C:\Users\elosy\Downloads
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

#### 접속 문제 해결

**문제 1: "Permission denied (publickey)" 오류 - 상세 해결 가이드**

이 오류는 다음 중 하나의 문제일 수 있습니다:
1. **잘못된 사용자명** (가장 흔한 원인)
2. **키 파일 권한 문제**
3. **키 파일 경로 문제**
4. **키 파일 형식 문제**

**해결 방법 (순서대로 시도):**

**1단계: 올바른 사용자명 확인 및 사용**
```powershell
# ❌ 잘못된 사용자명 (시도하지 마세요)
# ssh -i goldauction-key.pem jadelee@3.34.28.145
# ssh -i goldauction-key.pem ec2-user@3.34.28.145

# ✅ 올바른 사용자명 사용
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**2단계: 키 파일 존재 확인**
```powershell
# 키 파일이 있는지 확인
Test-Path C:\Users\elosy\Downloads\goldauction-key.pem

# 파일 크기 확인 (0이면 안 됨)
(Get-Item C:\Users\elosy\Downloads\goldauction-key.pem).Length
```

**3단계: 키 파일 권한 설정 (Windows)**
```powershell
# PowerShell을 관리자 권한으로 실행 후
# 키 파일의 권한을 현재 사용자만 읽을 수 있도록 설정

# 방법 1: icacls 사용 (관리자 권한 필요)
icacls "C:\Users\elosy\Downloads\goldauction-key.pem" /inheritance:r
icacls "C:\Users\elosy\Downloads\goldauction-key.pem" /grant:r "$env:USERNAME:(R)"

# 방법 2: 파일 속성에서 수동 설정
# 1. goldauction-key.pem 파일 우클릭 → 속성
# 2. 보안 탭 → 고급
# 3. "상속 사용 안 함" 클릭 → "이 개체의 모든 상속된 사용 권한 제거" 선택
# 4. 추가 → 주체 선택 → 현재 사용자 입력 → 확인
# 5. 기본 권한: "읽기"만 체크 → 확인
# 6. 모든 창에서 확인 클릭
```

**4단계: 절대 경로로 접속 시도**
```powershell
# 현재 디렉토리 확인
pwd

# 절대 경로 사용 (따옴표 필수)
ssh -i "C:\Users\elosy\Downloads\goldauction-key.pem" ubuntu@3.34.28.145
```

**5단계: 상세 디버그 모드로 접속 시도**
```powershell
# -v 옵션으로 상세 로그 확인
ssh -v -i "C:\Users\elosy\Downloads\goldauction-key.pem" ubuntu@3.34.28.145

# 더 상세한 로그가 필요하면 -vv 또는 -vvv 사용
ssh -vv -i "C:\Users\elosy\Downloads\goldauction-key.pem" ubuntu@3.34.28.145
```

**6단계: Git Bash 사용 (권장)**
PowerShell에서 안 되면 Git Bash를 사용하세요:

```bash
# Git Bash 열기
cd /c/Users/elosy/Downloads

# 키 파일 권한 설정
chmod 400 goldauction-key.pem

# 접속 시도
ssh -i goldauction-key.pem ubuntu@3.34.28.145

# 상세 로그와 함께
ssh -v -i goldauction-key.pem ubuntu@3.34.28.145
```

**7단계: 키 파일 형식 확인**
```powershell
# 키 파일 내용 확인 (처음 몇 줄)
Get-Content C:\Users\elosy\Downloads\goldauction-key.pem -Head 5

# 올바른 형식:
# -----BEGIN RSA PRIVATE KEY-----
# 또는
# -----BEGIN PRIVATE KEY-----
# 또는
# -----BEGIN OPENSSH PRIVATE KEY-----

# 잘못된 형식이면 AWS Console에서 새 키를 다운로드해야 할 수 있음
```

**8단계: Security Group 확인**
AWS Console에서 확인:
1. **EC2 → Instances → goldauction-server 선택**
2. **Security 탭** 클릭
3. **Security groups** 클릭
4. **Inbound rules** 확인:
   - SSH (22) 포트가 **My IP** 또는 **0.0.0.0/0**에서 허용되어 있는지 확인
   - 없으면 **Edit inbound rules** → **Add rule**:
     - Type: SSH
     - Port: 22
     - Source: My IP (또는 임시로 0.0.0.0/0)
     - Save rules

**9단계: EC2 인스턴스 상태 확인**
AWS Console에서:
1. **EC2 → Instances**
2. `goldauction-server` 인스턴스 상태가 **running**인지 확인
3. **Instance state**가 **stopped**이면 **Start instance** 클릭

**10단계: 키 파일이 올바른지 확인**

**중요: 기존 키를 새 서버에서 사용할 수 있는지 확인**

AWS EC2에서 키 페어는 다음과 같이 작동합니다:
- ✅ **인스턴스 생성 시 같은 키 페어를 선택했다면** → 사용 가능
- ❌ **인스턴스 생성 시 다른 키 페어를 선택했다면** → 사용 불가능
- ⚠️ **인스턴스 생성 후에는 키 페어를 변경할 수 없음**

**키 페어 확인 방법:**

1. **AWS Console에서 확인:**
   ```
   AWS Console → EC2 → Instances
   → goldauction-server 선택
   → Details 탭
   → Key pair name 확인
   ```

2. **키 페어 이름 확인:**
   - 키 파일명이 `goldauction-key.pem`이면 키 페어 이름은 보통 `goldauction-key`
   - 인스턴스의 Key pair name이 `goldauction-key`이면 → ✅ 사용 가능
   - 인스턴스의 Key pair name이 다른 이름이면 → ❌ 사용 불가능

**해결 방법:**

**방법 1: 새 키 페어로 새 인스턴스 생성 (권장)**
```
1. AWS Console → EC2 → Key Pairs → Create key pair
2. 이름: goldauction-key
3. 키 유형: RSA
4. 프라이빗 키 파일 형식: .pem
5. Create key pair 클릭
6. 자동으로 다운로드됨 (goldauction-key.pem)
7. 새 인스턴스 생성 시 이 키 선택
```

**방법 2: 기존 키 페어로 새 인스턴스 재생성**
```
1. 현재 인스턴스 중지 (Stop)
2. 새 인스턴스 생성 시 기존 키 페어(goldauction-key) 선택
3. 같은 설정으로 인스턴스 생성
```

**방법 3: EC2 Instance Connect 사용 (임시 해결책)**
```
1. AWS Console → EC2 → Instances
2. goldauction-server 선택
3. Connect 버튼 클릭
4. EC2 Instance Connect 탭 선택
5. Connect 클릭
6. 브라우저에서 터미널 열림
7. 여기서 새 키를 추가할 수 있음
```

**방법 4: Systems Manager Session Manager 사용**
```
1. EC2 인스턴스에 SSM Agent 설치 필요
2. IAM 역할에 SSM 권한 추가
3. Systems Manager → Session Manager로 접속
4. 키 없이 접속 가능
```

**키 페어 확인 스크립트:**
```powershell
# AWS CLI가 설치되어 있다면
aws ec2 describe-instances --instance-ids i-0a09eddc30b23e255 --query 'Reservations[0].Instances[0].KeyName' --output text

# 출력 예시:
# goldauction-key → 기존 키 사용 가능
# 다른 이름 → 다른 키 필요
```

**문제 2: "WARNING: UNPROTECTED PRIVATE KEY FILE!" 오류**
```powershell
# PowerShell에서 실행 (관리자 권한)
icacls "C:\Users\elosy\Downloads\goldauction-key.pem" /inheritance:r
icacls "C:\Users\elosy\Downloads\goldauction-key.pem" /grant:r "$env:USERNAME:R"
```

**문제 3: 사용자명이 맞지 않을 때**

> **중요**: 이 EC2 인스턴스의 사용자명은 `ubuntu`입니다. (Ubuntu 기본 사용자명)

```powershell
# ❌ 잘못된 사용자명 (작동하지 않음)
# ssh -i goldauction-key.pem jadelee@3.34.28.145
# ssh -i goldauction-key.pem ec2-user@3.34.28.145

# ✅ 올바른 사용자명
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**사용자명 확인 방법:**
- AWS Console → EC2 → Instances → goldauction → Details → AMI 확인
- Ubuntu AMI인 경우 기본 사용자명은 `ubuntu`
- Amazon Linux AMI인 경우 기본 사용자명은 `ec2-user`
- 이 인스턴스는 Ubuntu이므로 `ubuntu` 사용

#### 접속 후 확인 사항 (AWS EC2 서버에서 실행)

> **📍 이 명령어들은 AWS EC2 서버에 접속한 후 실행합니다!**
> 프롬프트가 `ubuntu@ip-xxx-xxx-xxx-xxx:~$`인 상태에서 실행하세요.

```bash
# 현재 사용자 확인 (AWS EC2 서버에서)
whoami
# 출력: ubuntu

# 현재 위치 확인 (AWS EC2 서버에서)
pwd
# 출력: /home/ubuntu

# 시스템 정보 확인 (AWS EC2 서버에서)
uname -a
# Ubuntu 정보 출력

# 디스크 사용량 확인 (AWS EC2 서버에서)
df -h
```

#### 접속 종료 (AWS EC2 서버에서 실행)

```bash
# AWS EC2 서버에서 로컬 컴퓨터로 돌아가기
exit

# 또는 Ctrl + D
# 프롬프트가 다시 Windows PowerShell 또는 Git Bash로 돌아갑니다
```

---

## 📍 명령어 실행 위치 구분 가이드

### 로컬 컴퓨터 (Windows)에서 실행하는 명령어

**표시 방법**: 프롬프트가 다음과 같을 때
- PowerShell: `PS C:\Users\elosy\Downloads>`
- Git Bash: `user@computer MINGW64 ~/Downloads $`
- CMD: `C:\Users\elosy\Downloads>`

**예시:**
```powershell
# 로컬 컴퓨터에서 실행
cd C:\Users\elosy\Downloads
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

### AWS EC2 서버에서 실행하는 명령어

**표시 방법**: 프롬프트가 다음과 같을 때
- `ubuntu@ip-xxx-xxx-xxx-xxx:~$`
- `jadelee@ip-xxx-xxx-xxx-xxx:~$`

**예시:**
```bash
# AWS EC2 서버에 접속한 후 실행
whoami
pwd
sudo apt update
```

### 구분 방법

1. **접속 전**: 로컬 컴퓨터 (Windows)
   - 프롬프트: `PS C:\Users\elosy\Downloads>`
   - 명령어: `ssh -i goldauction-key.pem ubuntu@3.34.28.145`

2. **접속 후**: AWS EC2 서버 (Ubuntu)
   - 프롬프트: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`
   - 명령어: `whoami`, `pwd`, `sudo apt update` 등

3. **접속 종료**: `exit` 입력
   - 다시 로컬 컴퓨터로 돌아옴
   - 프롬프트: `PS C:\Users\elosy\Downloads>`

---

## 🔧 EC2 초기 설정

### 1. 프로젝트 클론

> **📍 이 명령어들은 AWS EC2 서버에 접속한 후 실행합니다!**
> 프롬프트가 `ubuntu@ip-xxx-xxx-xxx-xxx:~$`인 상태에서 실행하세요.

**1단계: 로컬 컴퓨터에서 EC2 접속**
```powershell
# 로컬 컴퓨터 (Windows PowerShell)에서 실행
cd C:\Users\elosy\Downloads
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**2단계: EC2 서버에서 프로젝트 클론**
```bash
# AWS EC2 서버에 접속한 후 (프롬프트: ubuntu@ip-xxx-xxx-xxx-xxx:~$)
# 이제부터는 AWS EC2 서버에서 실행하는 명령어입니다!

git clone https://github.com/snlee1004/goldauction.git
cd goldauction

# 초기 설정 스크립트 실행
chmod +x scripts/setup-aws-ec2.sh
sudo ./scripts/setup-aws-ec2.sh
```

> **⚠️ 중요: "Daemons using outdated libraries" 다이얼로그가 나타나는 경우**
> 
> 스크립트 실행 중 다음과 같은 다이얼로그가 나타날 수 있습니다:
> ```
> Which services should be restarted?
> [] networkd-dispatcher.service
> [*] packagekit.service
> [*] unattended-upgrades.service
> ```
> 
> **처리 방법:**
> 1. **기본 선택된 서비스로 진행 (권장)**
>    - 화살표 키(↑↓)로 이동
>    - 스페이스바로 선택/해제
>    - 기본 선택된 것들(`packagekit.service`)로 **Ok** 선택 (Tab 키로 이동 후 Enter)
> 
> 2. **모든 서비스 재시작 (안전)**
>    - 모든 서비스를 선택하고 **Ok** 클릭
>    - 오래된 라이브러리를 사용하는 서비스를 재시작하여 보안 업데이트 적용
> 
> 3. **나중에 처리**
>    - **Cancel** 선택
>    - 스크립트는 계속 진행되지만, 나중에 수동으로 서비스 재시작 필요
>    ```bash
>    sudo systemctl restart packagekit.service
>    sudo systemctl restart networkd-dispatcher.service
>    sudo systemctl restart unattended-upgrades.service
>    ```
> 
> **권장**: 기본 선택된 서비스로 **Ok**를 선택하세요. 이는 시스템 보안 업데이트를 적용하는 정상적인 과정입니다.

### 2. application.properties 설정

#### 실제 데이터베이스 정보를 사용한 설정

**1단계: 설정 파일 생성**
```bash
# AWS EC2 서버에 접속한 후 실행
# 프롬프트: ubuntu@ip-xxx-xxx-xxx-xxx:~$
sudo mkdir -p /opt/goldauction/backend
sudo nano /opt/goldauction/backend/application.properties
```

**2단계: 아래 내용을 복사하여 붙여넣기**

> **주의**: 아래 설정은 위에서 제공된 실제 데이터베이스 정보를 사용합니다.

```properties
# Oracle DB 연결 (오라클 클라우드 DB)
# TNS 연결 문자열 사용 (SSL/TLS 연결)
spring.datasource.url=jdbc:oracle:thin:@(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-chuncheon-1.oraclecloud.com))(connect_data=(service_name=g175ea3ba887787_dwdtcxph2hgpl0hh_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))
spring.datasource.username=ADMIN
spring.datasource.password=n6$-cB_h&Hib`Mj
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# JPA 설정
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.OracleDialect

# 파일 업로드 경로
file.upload-dir=/opt/goldauction/uploads

# 서버 포트
server.port=8080

# 프로파일
spring.profiles.active=prod

# 로깅 설정
logging.level.com.example.backend=INFO
logging.level.org.springframework.web=INFO
logging.level.org.hibernate=WARN
```

**3단계: 파일 저장**
- `Ctrl + O` → Enter (저장)
- `Ctrl + X` (나가기)

**4단계: 파일 권한 설정**
```bash
# 파일 소유권 변경
sudo chown ubuntu:ubuntu /opt/goldauction/backend/application.properties

# 읽기 권한 확인
cat /opt/goldauction/backend/application.properties
```

---

### ⚠️ 중요: GitHub 인증 정보 보안

**Personal Access Token은 절대 문서나 코드에 포함하지 마세요!**

**안전한 Git 인증 방법:**

#### 방법 1: SSH 키 사용 (권장)

**1단계: 로컬에서 SSH 키 생성 (이미 있다면 생략)**
```bash
# Git Bash에서
ssh-keygen -t ed25519 -C "ec2-goldauction" -f ~/.ssh/goldauction-ec2
```

**2단계: 공개키를 GitHub에 추가**
1. GitHub → Settings → SSH and GPG keys → New SSH key
2. `cat ~/.ssh/goldauction-ec2.pub` 내용 복사하여 추가

**3단계: EC2에서 SSH 키 사용**
```bash
# EC2에 접속한 후
# SSH 키를 EC2에 복사 (로컬에서)
scp -i goldauction-key.pem ~/.ssh/goldauction-ec2 ubuntu@3.34.28.145:~/.ssh/id_ed25519

# EC2에서
chmod 600 ~/.ssh/id_ed25519
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

#### 방법 2: Personal Access Token 사용 (임시)

**EC2에서만 사용하고 즉시 삭제:**

```bash
# EC2에 접속한 후
git clone https://github.com/snlee1004/goldauction.git
# 사용자명: snlee1004
# 비밀번호: Personal Access Token 입력
# ⚠️ 토큰은 화면에 표시되지 않으므로 정확히 입력

# 사용 후 토큰은 GitHub에서 즉시 삭제 권장
```

#### 방법 3: Git Credential Helper 사용

```bash
# EC2에서
git config --global credential.helper store
git clone https://github.com/snlee1004/goldauction.git
# 한 번만 인증 정보 입력하면 ~/.git-credentials에 저장됨
# ⚠️ 이 파일은 보안에 주의 (읽기 권한만 설정)
chmod 600 ~/.git-credentials
```

#### 데이터베이스 연결 테스트

**EC2에서 Oracle DB 연결 테스트:**

**1단계: 네트워크 연결 확인 (포트 접근 가능 여부)**
```bash
# telnet으로 포트 확인 (1522 포트)
telnet adb.ap-chuncheon-1.oraclecloud.com 1522

# 또는 nc (netcat) 사용
nc -zv adb.ap-chuncheon-1.oraclecloud.com 1522
```

**예상 결과:**
```
Trying 146.56.121.170...
Connected to adb.ap-chuncheon-1.oci.oraclecloud.com.
Escape character is '^]'.
Connection closed by foreign host.
```

> **✅ 이것은 정상입니다!**
> - "Connected" 메시지가 나타나면 **네트워크 연결은 성공**한 것입니다
> - "Connection closed by foreign host"는 Oracle DB가 SSL/TLS 연결을 요구하기 때문입니다
> - telnet은 일반 텍스트 연결만 가능하므로 서버가 연결을 종료합니다
> - 실제 애플리케이션에서는 JDBC 드라이버가 SSL/TLS 연결을 자동으로 처리합니다

**2단계: 실제 애플리케이션에서 연결 테스트**

애플리케이션이 실행되면 Spring Boot가 자동으로 데이터베이스 연결을 시도합니다:

**서비스 파일 확인:**
```bash
# 서비스 파일이 있는지 확인
ls -la /etc/systemd/system/goldauction-backend.service

# 서비스 파일이 없으면 생성 필요 (아래 참조)
```

**서비스 파일이 없는 경우 (수동 생성):**
```bash
# Spring Boot 서비스 파일 생성
sudo tee /etc/systemd/system/goldauction-backend.service > /dev/null <<'EOF'
[Unit]
Description=GoldAuction Spring Boot Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/goldauction/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/goldauction/backend/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# systemd 재로드
sudo systemctl daemon-reload

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable goldauction-backend

# 서비스 상태 확인
sudo systemctl status goldauction-backend
```

**서비스 상태 확인:**
```bash
# 서비스가 실행 중인지 확인
sudo systemctl status goldauction-backend

# JAR 파일 존재 확인 (중요!)
ls -lh /opt/goldauction/backend/app.jar

# JAR 파일이 없으면 서비스 시작하지 마세요!
# JAR 파일이 있으면 시작
sudo systemctl start goldauction-backend
```

**⚠️ JAR 파일이 없는 경우:**
```bash
# 서비스 중지 (재시작 반복 방지)
sudo systemctl stop goldauction-backend
sudo systemctl disable goldauction-backend

# 배포 후 다시 활성화
# sudo systemctl enable goldauction-backend
# sudo systemctl start goldauction-backend
```

**로그 확인 (빠른 방법):**
```bash
# 최근 50줄만 확인 (빠름)
sudo journalctl -u goldauction-backend -n 50 --no-pager

# 또는 최근 1분간의 로그만 확인
sudo journalctl -u goldauction-backend --since "1 minute ago" --no-pager
```

**실시간 로그 확인 (필요시):**
```bash
# 실시간 로그 (Ctrl+C로 종료)
sudo journalctl -u goldauction-backend -f

# 연결 성공 시:
# "HikariPool-1 - Starting..."
# "HikariPool-1 - Start completed."

# 연결 실패 시:
# "Connection refused" 또는 "ORA-XXXXX" 오류 메시지
```

**서비스가 실행되지 않은 경우:**
```bash
# 서비스 파일 확인
cat /etc/systemd/system/goldauction-backend.service

# JAR 파일 존재 확인
ls -lh /opt/goldauction/backend/app.jar

# JAR 파일이 없으면 배포 필요
# GitHub Actions로 배포하거나 수동으로 복사
```

**3단계: 연결 문제 해결**

**문제 1: "Connection refused" 오류**
```bash
# Oracle Cloud Security List 확인 필요
# Oracle Cloud Console → Networking → Virtual Cloud Networks
# → Security Lists → Ingress Rules
# → EC2 IP (3.34.28.145)에서 1522 포트 허용 추가
```

**문제 2: "ORA-12541: TNS:no listener" 오류**
```bash
# TNS 연결 문자열 확인
# application.properties의 spring.datasource.url 확인
# 포트가 1522인지 확인 (SSL/TLS 포트)
```

**문제 3: "ORA-01017: invalid username/password" 오류**
```bash
# application.properties의 사용자명/비밀번호 확인
# Oracle Cloud Console에서 DB 사용자 정보 확인
```

#### 설정 파일 검증

```bash
# 설정 파일 문법 확인
cat /opt/goldauction/backend/application.properties | grep -v "^#" | grep -v "^$"

# 중요한 설정 확인
grep "spring.datasource" /opt/goldauction/backend/application.properties
```

### 3. Security Group 확인

**EC2 → Security Groups → 인스턴스의 Security Group**

다음 규칙이 있는지 확인:

| Type | Protocol | Port Range | Source |
|------|----------|------------|--------|
| SSH | TCP | 22 | My IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 8080 | 127.0.0.1/32 (로컬만) |

---

## 🚀 빠른 테스트 배포 (GitHub Actions 없이)

> **테스트 목적이라면 이 방법이 더 간단합니다!**  
> GitHub Secrets 설정 없이 바로 배포할 수 있습니다.

### 방법 1: EC2에서 직접 빌드 (가장 간단)

**1단계: EC2에 접속**
```bash
# 로컬 컴퓨터에서
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**2단계: 프로젝트 클론 (아직 안 했다면)**
```bash
cd ~
git clone https://github.com/snlee1004/goldauction.git
cd goldauction
```

**3단계: Backend 빌드**
```bash
cd backend
chmod +x ./gradlew
./gradlew bootJar
```

**4단계: JAR 파일 배포**
```bash
# JAR 파일 복사
sudo cp build/libs/*.jar /opt/goldauction/backend/app.jar
sudo chown ubuntu:ubuntu /opt/goldauction/backend/app.jar

# 서비스 시작
sudo systemctl enable goldauction-backend
sudo systemctl start goldauction-backend
sudo systemctl status goldauction-backend
```

**5단계: Frontend 빌드 (선택사항)**

**Node.js/npm이 설치되어 있지 않은 경우:**
```bash
# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 설치 확인
node -v
npm -v
```

**Frontend 빌드:**
```bash
cd ~/goldauction/frontend
npm install
npm run build

# Frontend 파일 복사
sudo rm -rf /opt/goldauction/frontend/*
sudo cp -r dist/* /opt/goldauction/frontend/
sudo chown -R ubuntu:ubuntu /opt/goldauction/frontend

# Nginx 재시작
sudo systemctl reload nginx
```

### 방법 2: 로컬에서 빌드 후 전송

**1단계: 로컬에서 Backend 빌드**
```powershell
# PowerShell 또는 Git Bash
cd backend
./gradlew bootJar
```

**2단계: JAR 파일을 EC2로 전송**
```powershell
# PowerShell에서
scp -i C:\Users\elosy\Downloads\goldauction-key.pem backend\build\libs\*.jar ubuntu@3.34.28.145:/tmp/app.jar
```

**3단계: EC2에서 배포**
```bash
# EC2에 접속
ssh -i goldauction-key.pem ubuntu@3.34.28.145

# JAR 파일 배포
sudo mv /tmp/app.jar /opt/goldauction/backend/app.jar
sudo chown ubuntu:ubuntu /opt/goldauction/backend/app.jar

# 서비스 시작
sudo systemctl enable goldauction-backend
sudo systemctl start goldauction-backend
sudo systemctl status goldauction-backend
```

---

## 🔧 GitHub Actions 자동 배포 (선택사항)

> **참고**: 프로덕션 환경이나 자동 배포가 필요할 때만 설정하세요.  
> 테스트 목적이라면 위의 "빠른 테스트 배포" 방법을 사용하세요.

### 1. GitHub Secrets 설정

**Repository → Settings → Secrets and variables → Actions → New repository secret**

다음 Secrets를 추가:

| Secret 이름 | 설명 | 실제 값 (예시) |
|------------|------|----------------|
| `AWS_HOST` | EC2의 Public IP | `3.34.28.145` |
| `AWS_USERNAME` | SSH 사용자명 | `ubuntu` |
| `AWS_SSH_KEY` | SSH 개인키 (전체 내용) | `-----BEGIN RSA PRIVATE KEY-----...` (아래 참고) |
| `AWS_PORT` | SSH 포트 (선택사항) | `22` (기본값) |

**SSH 키 설정 방법 (Windows 환경):**

#### 방법 1: 기존 EC2 키 사용 (간단)

**1단계: PowerShell에서 키 파일 내용 읽기**
```powershell
# PowerShell 열기
cd C:\Users\elosy\Downloads

# 키 파일 내용 확인 (전체 내용 복사)
Get-Content goldauction-key.pem
```

**2단계: GitHub Secret에 추가**
1. GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. **Name**: `AWS_SSH_KEY`
4. **Secret**: 위에서 복사한 전체 키 내용 붙여넣기
   - `-----BEGIN RSA PRIVATE KEY-----` 부터
   - `-----END RSA PRIVATE KEY-----` 까지
   - **전체 내용**을 복사해야 함
5. **Add secret** 클릭

**3단계: 나머지 Secrets 추가**
- `AWS_HOST`: `3.34.28.145`
- `AWS_USERNAME`: `ubuntu`
- `AWS_PORT`: `22` (선택사항)

#### 방법 2: 새 SSH 키 생성 (권장, 보안상 더 안전)

**1단계: Git Bash에서 새 키 생성**
```bash
# Git Bash 열기
cd ~/.ssh

# 새 SSH 키 생성
ssh-keygen -t rsa -b 4096 -C "github-actions" -f github-actions

# 생성 확인
ls -la github-actions*
```

**2단계: 공개키를 EC2에 추가**
```bash
# EC2에 접속 (기존 키 사용)
ssh -i C:/Users/elosy/Downloads/goldauction-key.pem ubuntu@3.34.28.145

# EC2에서 authorized_keys 파일 편집
nano ~/.ssh/authorized_keys

# Git Bash에서 공개키 내용 복사
cat ~/.ssh/github-actions.pub

# EC2의 authorized_keys 파일에 위 내용 추가
# (파일 맨 아래에 붙여넣기)

# 권한 설정
chmod 600 ~/.ssh/authorized_keys
exit
```

**3단계: 새 키로 접속 테스트**
```bash
# Git Bash에서
ssh -i ~/.ssh/github-actions ubuntu@3.34.28.145

# 접속 성공하면 새 키가 작동하는 것
exit
```

**4단계: 개인키를 GitHub Secret에 추가**
```bash
# Git Bash에서
cat ~/.ssh/github-actions

# 전체 내용 복사하여 GitHub Secret에 추가
```

#### 키 파일 내용 확인 방법

**PowerShell:**
```powershell
Get-Content C:\Users\elosy\Downloads\goldauction-key.pem
```

**Git Bash:**
```bash
cat /c/Users/elosy/Downloads/goldauction-key.pem
```

**Windows 메모장:**
1. `goldauction-key.pem` 파일 우클릭 → **연결 프로그램** → **메모장**
2. 전체 내용 복사 (Ctrl + A → Ctrl + C)

**EC2에 공개키 추가 (실제 사용 예시):**

#### Windows에서 EC2 접속 후 공개키 추가

**1단계: EC2 접속**
```powershell
# PowerShell에서
cd C:\Users\elosy\Downloads
ssh -i goldauction-key.pem ubuntu@3.34.28.145
```

**2단계: EC2에서 authorized_keys 확인**
```bash
# EC2에 접속한 상태에서
ls -la ~/.ssh/

# authorized_keys 파일이 없으면 생성
mkdir -p ~/.ssh
touch ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**3단계: 공개키 추가**
```bash
# 방법 1: 직접 편집
nano ~/.ssh/authorized_keys

# 공개키 내용을 파일 맨 아래에 붙여넣기
# (GitHub Actions용 새 키를 생성했다면 그 공개키 사용)
# 또는 기존 키의 공개키 사용

# 방법 2: echo로 추가 (공개키 내용을 직접 입력)
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC..." >> ~/.ssh/authorized_keys

# 권한 재설정
chmod 600 ~/.ssh/authorized_keys
```

**4단계: 접속 테스트**
```bash
# EC2에서 나가기
exit

# Windows에서 새 키로 접속 테스트 (새 키를 생성한 경우)
ssh -i ~/.ssh/github-actions ubuntu@3.34.28.145
```

---

## 📦 필수 패키지 설치 확인

### Node.js/npm 설치 (Frontend 빌드용)

**npm이 설치되어 있지 않은 경우:**
```bash
# Node.js 20.x 설치 (npm 포함)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 설치 확인
node -v   # v20.x.x 형태로 표시되어야 함
npm -v    # 10.x.x 형태로 표시되어야 함
```

**설치 후 Frontend 빌드:**
```bash
cd ~/goldauction/frontend
npm install
npm run build

# Frontend 파일 배포
sudo rm -rf /opt/goldauction/frontend/*
sudo cp -r dist/* /opt/goldauction/frontend/
sudo chown -R ubuntu:ubuntu /opt/goldauction/frontend

# Nginx 재시작
sudo systemctl reload nginx
```

---

## ✅ 배포 성공 확인

### 서비스 상태 확인

**서비스가 정상 실행 중인지 확인:**
```bash
sudo systemctl status goldauction-backend
```

**성공 상태:**
```
Active: active (running)  ← 이것이 보이면 성공!
```

**추가 확인 단계:**

**1단계: 애플리케이션 로그 확인**
```bash
# 최근 로그 확인 (애플리케이션 시작 여부 확인)
sudo journalctl -u goldauction-backend -n 50 --no-pager

# 정상 시작 시 다음과 같은 메시지가 보여야 함:
# - "Started BackendApplication"
# - "HikariPool-1 - Starting..."
# - "HikariPool-1 - Start completed."
```

**2단계: 포트 확인**
```bash
# 8080 포트가 열려있는지 확인
sudo lsof -i :8080

# 또는
netstat -tlnp | grep 8080
```

**3단계: API 테스트**
```bash
# 로컬에서 테스트 (EC2에서)
curl http://localhost:8080/api/health

# 또는 외부에서 테스트 (로컬 컴퓨터에서)
curl http://3.34.28.145:8080/api/health
```

**4단계: 웹 브라우저에서 확인**
```
http://3.34.28.145
```

**문제가 있는 경우:**
```bash
# 로그에서 오류 확인
sudo journalctl -u goldauction-backend -n 100 --no-pager | grep -i error

# 데이터베이스 연결 오류 확인
sudo journalctl -u goldauction-backend -n 100 --no-pager | grep -i "ORA\|database\|connection"
```

---

## 🚀 자동 배포 실행 (GitHub Actions)

### 1. 코드 Push

```bash
# main 브랜치에 push하면 자동 배포
git add .
git commit -m "AWS 배포 준비"
git push origin main
```

### 2. GitHub Actions 확인

1. **GitHub Repository → Actions** 탭 이동
2. **Deploy to AWS EC2** 워크플로우 확인
3. 실행 상태 모니터링

### 3. 배포 확인

```bash
# EC2에 SSH 접속
ssh -i goldauction-key.pem ubuntu@3.34.28.145

# Backend 서비스 상태 확인
sudo systemctl status goldauction-backend

# Nginx 상태 확인
sudo systemctl status nginx

# 서비스 로그 확인
sudo journalctl -u goldauction-backend -f
```

### 4. 웹사이트 접속

브라우저에서 EC2 Public IP로 접속:
```
http://3.34.28.145
```

---

## 💰 비용 최적화

### 1. Free Tier 활용

**AWS Free Tier (12개월):**
- EC2 t2.micro: 750시간/월
- Elastic IP: 무료 (인스턴스와 연결 시)
- 데이터 전송: 15GB/월

### 2. 비용 절감 팁

1. **Reserved Instances**: 1년 약정 시 최대 72% 할인
2. **Spot Instances**: 최대 90% 할인 (단, 중단 가능)
3. **Auto Scaling**: 트래픽에 따라 자동 조정
4. **CloudWatch 모니터링**: 사용량 추적

### 3. 예상 비용 (Free Tier 이후)

- **t2.micro (1년 약정)**: 약 $3-5/월
- **t3.micro (1년 약정)**: 약 $5-7/월
- **데이터 전송**: 15GB 초과 시 $0.09/GB

---

## 🔍 문제 해결

### EC2 접속 불가

```bash
# Security Group 확인
# - SSH (22) 포트가 My IP에서 허용되어 있는지 확인

# 키 파일 권한 확인 (로컬 컴퓨터에서)
chmod 400 goldauction-key.pem
```

### Backend 서비스 오류

**1단계: 서비스 파일 확인**
```bash
# 서비스 파일 존재 확인
ls -la /etc/systemd/system/goldauction-backend.service

# 서비스 파일이 없으면 생성 (아래 참조)
```

**서비스 파일이 없는 경우:**
```bash
# Spring Boot 서비스 파일 수동 생성
sudo tee /etc/systemd/system/goldauction-backend.service > /dev/null <<'EOF'
[Unit]
Description=GoldAuction Spring Boot Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/goldauction/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/goldauction/backend/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# systemd 재로드
sudo systemctl daemon-reload

# 서비스 활성화
sudo systemctl enable goldauction-backend
```

**2단계: 서비스 상태 확인 (빠른 확인)**
```bash
# 서비스 상태 확인
sudo systemctl status goldauction-backend

# 실행 중이 아니면 시작 (JAR 파일이 있어야 함)
sudo systemctl start goldauction-backend

# 부팅 시 자동 시작 설정
sudo systemctl enable goldauction-backend
```

**3단계: 최근 로그 확인 (빠른 방법)**
```bash
# 최근 100줄만 확인 (빠름, 권장)
sudo journalctl -u goldauction-backend -n 100 --no-pager

# 최근 5분간의 로그만 확인
sudo journalctl -u goldauction-backend --since "5 minutes ago" --no-pager

# 오류만 필터링하여 확인
sudo journalctl -u goldauction-backend -n 100 --no-pager | grep -i error
```

**3단계: 실시간 로그 확인 (필요시)**
```bash
# 실시간 로그 (Ctrl+C로 종료)
sudo journalctl -u goldauction-backend -f
```

**4단계: 서비스 재시작**
```bash
# 서비스 재시작
sudo systemctl restart goldauction-backend

# 재시작 후 상태 확인
sudo systemctl status goldauction-backend
```

**5단계: 포트 및 프로세스 확인**
```bash
# 8080 포트 사용 확인
sudo lsof -i :8080

# Java 프로세스 확인
ps aux | grep java

# JAR 파일 존재 확인
ls -lh /opt/goldauction/backend/app.jar
```

**⚠️ JAR 파일이 없는 경우 (현재 상황):**

**오류 메시지:**
```
Error: Unable to access jarfile /opt/goldauction/backend/app.jar
```

**해결 방법:**

**1단계: 서비스 일시 중지 (재시작 반복 방지)**
```bash
# 서비스 중지 (JAR 파일이 없으면 계속 실패하므로 중지)
sudo systemctl stop goldauction-backend

# 서비스 비활성화 (부팅 시 자동 시작 방지)
sudo systemctl disable goldauction-backend
```

**2단계: JAR 파일 배포**

**방법 A: GitHub Actions로 자동 배포 (권장)**
1. GitHub Secrets 설정 확인 (AWS_HOST, AWS_USERNAME, AWS_SSH_KEY)
2. GitHub에서 main 브랜치에 push하거나 Actions 탭에서 수동 실행
3. 배포 완료 후 서비스 시작:
   ```bash
   sudo systemctl enable goldauction-backend
   sudo systemctl start goldauction-backend
   ```

**방법 B: 로컬에서 수동 배포**
```bash
# 로컬 컴퓨터에서 (Windows PowerShell 또는 Git Bash)
# 1. Backend 빌드
cd backend
./gradlew bootJar

# 2. JAR 파일을 EC2로 전송
scp -i goldauction-key.pem backend/build/libs/*.jar ubuntu@3.34.28.145:/tmp/app.jar

# EC2에서 실행:
sudo mv /tmp/app.jar /opt/goldauction/backend/app.jar
sudo chown ubuntu:ubuntu /opt/goldauction/backend/app.jar
sudo systemctl enable goldauction-backend
sudo systemctl start goldauction-backend
```

**방법 C: EC2에서 직접 빌드 (임시 방법)**
```bash
# EC2에 접속한 후
cd ~/goldauction

# Backend 빌드
cd backend
chmod +x ./gradlew
./gradlew bootJar

# JAR 파일 복사
sudo cp build/libs/*.jar /opt/goldauction/backend/app.jar
sudo chown ubuntu:ubuntu /opt/goldauction/backend/app.jar

# 서비스 시작
sudo systemctl enable goldauction-backend
sudo systemctl start goldauction-backend
sudo systemctl status goldauction-backend
```

### Nginx 502 Bad Gateway

```bash
# Backend 서비스 실행 확인
sudo systemctl status goldauction-backend

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# Nginx 설정 테스트
sudo nginx -t
```

### 데이터베이스 연결 오류

**1단계: 네트워크 연결 확인**
```bash
# EC2에서 Oracle DB 포트 접근 확인
telnet adb.ap-chuncheon-1.oraclecloud.com 1522

# "Connected" 메시지가 나타나면 네트워크 연결은 정상
# "Connection closed"는 정상 (SSL/TLS 요구 때문)
```

**2단계: Oracle Cloud Security List 확인**
```bash
# Oracle Cloud Console에서 확인 필요:
# 1. Oracle Cloud Console → Networking → Virtual Cloud Networks
# 2. 해당 VCN 선택 → Security Lists
# 3. Ingress Rules 확인:
#    - Source: EC2 Public IP (3.34.28.145) 또는 CIDR
#    - Destination Port: 1522
#    - Protocol: TCP
# 4. 없으면 Add Ingress Rule 추가
```

**3단계: 애플리케이션 로그 확인**
```bash
# Backend 서비스 로그에서 상세 오류 확인
sudo journalctl -u goldauction-backend -n 100

# 일반적인 오류:
# - ORA-12541: TNS:no listener → 포트/호스트 확인
# - ORA-01017: invalid username/password → 인증 정보 확인
# - ORA-12170: TNS:Connect timeout → 네트워크/방화벽 확인
```

**4단계: application.properties 확인**
```bash
# 설정 파일 확인
cat /opt/goldauction/backend/application.properties | grep spring.datasource

# TNS 연결 문자열 형식 확인
# SSL/TLS 연결이 올바르게 설정되어 있는지 확인
```

---

## 📝 추가 설정

### 1. 도메인 연결

1. **Route 53**에서 도메인 구매 또는 연결
2. **A 레코드** 생성: `@` → EC2 Elastic IP
3. **Nginx 설정 수정**:
   ```bash
   sudo nano /etc/nginx/sites-available/goldauction
   # server_name _; → server_name your-domain.com www.your-domain.com;
   ```

### 2. HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갌신 설정
sudo certbot renew --dry-run
```

### 3. CloudWatch 모니터링

```bash
# CloudWatch Agent 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# 설정 파일 생성
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

---

## ✅ 배포 체크리스트

- [ ] AWS 계정 생성 및 EC2 인스턴스 생성
- [ ] Security Group 설정 (SSH, HTTP, HTTPS)
- [ ] Elastic IP 할당 (선택사항)
- [ ] EC2 초기 설정 스크립트 실행
- [ ] application.properties 설정
- [ ] GitHub Secrets 설정
- [ ] SSH 키 설정
- [ ] GitHub Actions 워크플로우 테스트
- [ ] Backend 서비스 실행 확인
- [ ] Frontend 정적 파일 서빙 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 테스트

---

## 🔄 배포 아키텍처

```
GitHub Repository
    ↓ (Push)
GitHub Actions
    ↓ (빌드)
Backend JAR + Frontend Build
    ↓ (SSH)
AWS EC2
    ↓
Nginx (Frontend) + Spring Boot (Backend)
    ↓
Oracle Cloud Database
```

---

## 🚀 백엔드/프론트엔드 시작 방법

### 백엔드 시작/중지/재시작

```bash
# 백엔드 시작
sudo systemctl start goldauction-backend

# 백엔드 중지
sudo systemctl stop goldauction-backend

# 백엔드 재시작
sudo systemctl restart goldauction-backend

# 백엔드 상태 확인
sudo systemctl status goldauction-backend

# 백엔드 로그 확인 (최근 50줄)
sudo journalctl -u goldauction-backend -n 50 --no-pager

# 백엔드 실시간 로그 확인 (Ctrl+C로 종료)
sudo journalctl -u goldauction-backend -f
```

### 프론트엔드 (Nginx) 시작/중지/재시작

```bash
# Nginx 시작
sudo systemctl start nginx

# Nginx 중지
sudo systemctl stop nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 설정 테스트
sudo nginx -t

# Nginx 설정 변경 후 재시작 (권장)
sudo nginx -t && sudo systemctl reload nginx
```

### 전체 서비스 상태 확인

```bash
# 백엔드와 Nginx 모두 확인
sudo systemctl status goldauction-backend nginx

# 포트 확인
sudo lsof -i :8080  # 백엔드 (8080 포트)
sudo lsof -i :80    # Nginx (80 포트)

# 웹사이트 접속 테스트
curl http://localhost:8080  # 백엔드 직접 접속
curl http://localhost        # Nginx를 통한 접속
```

### 서버 재시작 후 자동 시작 확인

```bash
# 백엔드 자동 시작 활성화
sudo systemctl enable goldauction-backend

# Nginx 자동 시작 활성화
sudo systemctl enable nginx

# 자동 시작 설정 확인
sudo systemctl is-enabled goldauction-backend
sudo systemctl is-enabled nginx
```

### 문제 해결

**백엔드가 시작되지 않는 경우:**
```bash
# JAR 파일 확인
ls -lh /opt/goldauction/backend/app.jar

# 로그에서 오류 확인
sudo journalctl -u goldauction-backend -n 100 --no-pager | grep -i error
```

**Nginx가 시작되지 않는 경우:**
```bash
# 설정 파일 문법 확인
sudo nginx -t

# 에러 로그 확인
sudo tail -n 50 /var/log/nginx/error.log
```

---

## 📞 지원

문제가 발생하면:
1. GitHub Issues에 등록
2. AWS CloudWatch 로그 확인
3. EC2 시스템 로그 확인
4. 서비스 상태 확인

