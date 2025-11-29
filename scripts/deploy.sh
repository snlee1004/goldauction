#!/bin/bash

# 골드옥션 배포 스크립트
# AWS EC2에서 실행되는 배포 스크립트

set -e  # 에러 발생 시 스크립트 중단

echo "=== 골드옥션 배포 시작 ==="

# 변수 설정
APP_DIR="/opt/goldauction"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DEPLOY_DIR="/tmp/goldauction-deploy"
SERVICE_NAME="goldauction-backend"

# 디렉토리 생성
echo "디렉토리 생성 중..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $FRONTEND_DIR

# Backend 배포
echo "Backend 배포 중..."
if [ -f "$DEPLOY_DIR/backend/build/libs/"*.jar ]; then
    sudo cp $DEPLOY_DIR/backend/build/libs/*.jar $BACKEND_DIR/app.jar
    echo "Backend JAR 파일 복사 완료"
else
    echo "경고: Backend JAR 파일을 찾을 수 없습니다."
fi

# Frontend 배포
echo "Frontend 배포 중..."
if [ -d "$DEPLOY_DIR/frontend/dist" ]; then
    sudo rm -rf $FRONTEND_DIR/*
    sudo cp -r $DEPLOY_DIR/frontend/dist/* $FRONTEND_DIR/
    echo "Frontend 빌드 파일 복사 완료"
else
    echo "경고: Frontend 빌드 파일을 찾을 수 없습니다."
fi

# Backend 서비스 재시작
echo "Backend 서비스 재시작 중..."
if systemctl is-active --quiet $SERVICE_NAME; then
    sudo systemctl restart $SERVICE_NAME
    echo "Backend 서비스 재시작 완료"
else
    echo "Backend 서비스가 실행 중이 아닙니다. 시작합니다..."
    sudo systemctl start $SERVICE_NAME
fi

# Nginx 재시작 (Frontend 서빙)
echo "Nginx 재시작 중..."
sudo systemctl reload nginx

# 배포 파일 정리
echo "임시 파일 정리 중..."
rm -rf $DEPLOY_DIR

echo "=== 배포 완료 ==="
echo "Backend: $BACKEND_DIR/app.jar"
echo "Frontend: $FRONTEND_DIR"

