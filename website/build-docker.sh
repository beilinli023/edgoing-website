#!/bin/bash

# 🐳 EdGoing Docker 构建脚本
# 用于构建 x86_64 (AMD64) 架构的 Docker 镜像

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="edgoing"
TAG="latest"
PLATFORM="linux/amd64"

echo -e "${BLUE}🐳 开始构建 EdGoing Docker 镜像${NC}"
echo -e "${YELLOW}📋 构建信息:${NC}"
echo -e "   镜像名称: ${IMAGE_NAME}:${TAG}"
echo -e "   目标平台: ${PLATFORM}"
echo -e "   构建时间: $(date)"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 检查必要文件
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ 未找到 Dockerfile 文件${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 未找到 package.json 文件${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 开始构建镜像...${NC}"

# 构建 Docker 镜像
docker build \
    --platform ${PLATFORM} \
    --tag ${IMAGE_NAME}:${TAG} \
    --tag ${IMAGE_NAME}:x86-linux \
    --progress=plain \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 镜像构建成功！${NC}"
    echo ""
    echo -e "${BLUE}📊 镜像信息:${NC}"
    docker images | grep ${IMAGE_NAME}
    echo ""
    echo -e "${BLUE}🚀 运行命令:${NC}"
    echo -e "   ${YELLOW}docker run -p 3000:3000 ${IMAGE_NAME}:${TAG}${NC}"
    echo ""
    echo -e "${BLUE}💾 保存镜像:${NC}"
    echo -e "   ${YELLOW}docker save ${IMAGE_NAME}:${TAG} | gzip > ${IMAGE_NAME}-${TAG}.tar.gz${NC}"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi
