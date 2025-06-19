#!/bin/bash

# 🔧 Docker 镜像源配置脚本
# 解决 Docker 镜像拉取问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 配置 Docker 镜像源${NC}"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 检查 Docker Desktop 配置目录
DOCKER_CONFIG_DIR="$HOME/.docker"
DAEMON_JSON="$DOCKER_CONFIG_DIR/daemon.json"

echo -e "${YELLOW}📋 当前 Docker 配置:${NC}"
if [ -f "$DAEMON_JSON" ]; then
    echo "配置文件存在: $DAEMON_JSON"
    cat "$DAEMON_JSON"
else
    echo "配置文件不存在: $DAEMON_JSON"
fi

echo ""
echo -e "${BLUE}🌐 可选的解决方案:${NC}"
echo ""
echo "1. 重置 Docker 镜像源为官方源"
echo "2. 配置国内镜像源"
echo "3. 手动拉取镜像"
echo "4. 跳过配置，直接构建"
echo ""

read -p "请选择解决方案 (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}🔄 重置为官方 Docker Hub...${NC}"
        mkdir -p "$DOCKER_CONFIG_DIR"
        cat > "$DAEMON_JSON" << EOF
{
  "registry-mirrors": [],
  "insecure-registries": []
}
EOF
        echo -e "${GREEN}✅ 已重置为官方源${NC}"
        echo -e "${YELLOW}⚠️  请重启 Docker Desktop 使配置生效${NC}"
        ;;
    2)
        echo -e "${YELLOW}🔄 配置国内镜像源...${NC}"
        mkdir -p "$DOCKER_CONFIG_DIR"
        cat > "$DAEMON_JSON" << EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "insecure-registries": []
}
EOF
        echo -e "${GREEN}✅ 已配置国内镜像源${NC}"
        echo -e "${YELLOW}⚠️  请重启 Docker Desktop 使配置生效${NC}"
        ;;
    3)
        echo -e "${YELLOW}📥 手动拉取镜像...${NC}"
        echo "正在拉取 node:18-alpine..."
        docker pull --platform linux/amd64 node:18-alpine
        echo -e "${GREEN}✅ 镜像拉取完成${NC}"
        ;;
    4)
        echo -e "${BLUE}⏭️  跳过配置，继续构建...${NC}"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}🚀 现在可以尝试重新构建:${NC}"
echo -e "${YELLOW}./build-docker.sh${NC}"
echo ""
echo -e "${BLUE}💡 如果仍有问题，可以尝试:${NC}"
echo "1. 重启 Docker Desktop"
echo "2. 清理 Docker 缓存: docker system prune -a"
echo "3. 检查网络连接"
