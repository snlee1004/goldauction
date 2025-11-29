#!/bin/bash

# AWS EC2 초기 설정 스크립트
# EC2 인스턴스 생성 후 한 번만 실행

set -e

echo "=== AWS EC2 초기 설정 ==="

# 시스템 업데이트
echo "시스템 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
echo "필수 패키지 설치 중..."
sudo apt install -y \
    openjdk-17-jdk \
    nginx \
    git \
    unzip \
    curl \
    wget \
    awscli

# Java 버전 확인
echo "Java 버전 확인:"
java -version

# Node.js 설치 (Frontend 빌드용, 선택사항)
echo "Node.js 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js 버전 확인
echo "Node.js 버전 확인:"
node -v
npm -v

# 디렉토리 생성
echo "애플리케이션 디렉토리 생성 중..."
sudo mkdir -p /opt/goldauction/backend
sudo mkdir -p /opt/goldauction/frontend
sudo mkdir -p /opt/goldauction/uploads
sudo chown -R ubuntu:ubuntu /opt/goldauction

# 배포 스크립트 복사 및 실행 권한 부여
echo "배포 스크립트 설정 중..."
sudo cp scripts/deploy.sh /home/ubuntu/deploy.sh
sudo chmod +x /home/ubuntu/deploy.sh

# Spring Boot 서비스 파일 생성
echo "Spring Boot 서비스 설정 중..."
sudo tee /etc/systemd/system/goldauction-backend.service > /dev/null <<EOF
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

# Nginx 설정 파일 생성
echo "Nginx 설정 중..."
sudo tee /etc/nginx/sites-available/goldauction > /dev/null <<EOF
# Frontend (React)
server {
    listen 80;
    server_name _;  # 도메인 설정 시 변경

    root /opt/goldauction/frontend;
    index index.html;

    # Frontend 라우팅
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API 프록시
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Nginx 설정 활성화
sudo ln -sf /etc/nginx/sites-available/goldauction /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# 방화벽 설정 (UFW)
echo "방화벽 설정 중..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable goldauction-backend
sudo systemctl enable nginx

echo "=== 초기 설정 완료 ==="
echo "다음 단계:"
echo "1. application.properties 파일을 /opt/goldauction/backend/에 복사"
echo "2. GitHub Secrets 설정 (AWS_HOST, AWS_USERNAME, AWS_SSH_KEY)"
echo "3. AWS Security Group에서 80, 443 포트 허용 확인"
echo "4. GitHub Actions로 배포 시작"

