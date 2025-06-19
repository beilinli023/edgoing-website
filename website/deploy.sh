#!/bin/bash

# 🚀 EdGoing 部署脚本
# 支持本地和远程服务器部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
IMAGE_NAME="edgoing"
TAG="latest"
CONTAINER_NAME="edgoing-app"
PORT="3000"

# 显示帮助信息
show_help() {
    echo -e "${BLUE}🚀 EdGoing 部署脚本${NC}"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build     构建 Docker 镜像"
    echo "  run       运行容器"
    echo "  stop      停止容器"
    echo "  restart   重启容器"
    echo "  logs      查看日志"
    echo "  clean     清理容器和镜像"
    echo "  status    查看状态"
    echo "  help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 build    # 构建镜像"
    echo "  $0 run      # 运行应用"
    echo "  $0 logs     # 查看日志"
}

# 构建镜像
build_image() {
    echo -e "${BLUE}🔧 构建 Docker 镜像...${NC}"
    
    if [ -f "build-docker.sh" ]; then
        chmod +x build-docker.sh
        ./build-docker.sh
    else
        docker build --platform linux/amd64 -t ${IMAGE_NAME}:${TAG} .
    fi
    
    echo -e "${GREEN}✅ 镜像构建完成${NC}"
}

# 运行容器
run_container() {
    echo -e "${BLUE}🚀 启动容器...${NC}"
    
    # 停止现有容器
    if docker ps -q -f name=${CONTAINER_NAME} | grep -q .; then
        echo -e "${YELLOW}⚠️  停止现有容器...${NC}"
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
    fi
    
    # 启动新容器
    docker run -d \
        --name ${CONTAINER_NAME} \
        --platform linux/amd64 \
        -p ${PORT}:3000 \
        -v $(pwd)/dev.db:/app/dev.db \
        -v $(pwd)/public/uploads:/app/public/uploads \
        --restart unless-stopped \
        ${IMAGE_NAME}:${TAG}
    
    echo -e "${GREEN}✅ 容器启动成功${NC}"
    echo -e "${BLUE}🌐 应用地址: http://localhost:${PORT}${NC}"
}

# 停止容器
stop_container() {
    echo -e "${YELLOW}⏹️  停止容器...${NC}"
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    echo -e "${GREEN}✅ 容器已停止${NC}"
}

# 重启容器
restart_container() {
    echo -e "${BLUE}🔄 重启容器...${NC}"
    stop_container
    run_container
}

# 查看日志
show_logs() {
    echo -e "${BLUE}📋 查看容器日志...${NC}"
    docker logs -f ${CONTAINER_NAME}
}

# 清理资源
clean_resources() {
    echo -e "${YELLOW}🧹 清理 Docker 资源...${NC}"
    
    # 停止并删除容器
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    
    # 删除镜像
    docker rmi ${IMAGE_NAME}:${TAG} 2>/dev/null || true
    docker rmi ${IMAGE_NAME}:x86-linux 2>/dev/null || true
    
    # 清理未使用的资源
    docker system prune -f
    
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 查看状态
show_status() {
    echo -e "${BLUE}📊 系统状态${NC}"
    echo ""
    
    echo -e "${YELLOW}Docker 镜像:${NC}"
    docker images | grep ${IMAGE_NAME} || echo "未找到镜像"
    echo ""
    
    echo -e "${YELLOW}运行中的容器:${NC}"
    docker ps | grep ${CONTAINER_NAME} || echo "容器未运行"
    echo ""
    
    echo -e "${YELLOW}所有容器:${NC}"
    docker ps -a | grep ${CONTAINER_NAME} || echo "未找到容器"
}

# 主逻辑
case "${1:-help}" in
    build)
        build_image
        ;;
    run)
        run_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_resources
        ;;
    status)
        show_status
        ;;
    help|*)
        show_help
        ;;
esac
