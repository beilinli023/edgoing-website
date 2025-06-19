# 🚀 EdGoing 部署指南

本文档提供了 EdGoing Next.js 应用的完整部署指南，支持 Docker 容器化部署。

## 📋 部署文件说明

### 核心文件
- `Dockerfile` - Docker 镜像构建文件
- `docker-compose.yml` - Docker Compose 配置
- `nginx.conf` - Nginx 反向代理配置
- `.dockerignore` - Docker 构建忽略文件

### 脚本文件
- `build-docker.sh` - Docker 镜像构建脚本
- `deploy.sh` - 部署管理脚本

### API 端点
- `/api/health` - 健康检查端点

## 🛠️ 快速开始

### 1. 构建 Docker 镜像

```bash
# 方法 1: 使用构建脚本（推荐）
chmod +x build-docker.sh
./build-docker.sh

# 方法 2: 直接使用 Docker 命令
docker build --platform linux/amd64 -t edgoing:latest .
```

### 2. 运行应用

```bash
# 方法 1: 使用部署脚本（推荐）
chmod +x deploy.sh
./deploy.sh run

# 方法 2: 直接使用 Docker 命令
docker run -d \
  --name edgoing-app \
  --platform linux/amd64 \
  -p 3000:3000 \
  -v $(pwd)/dev.db:/app/dev.db \
  edgoing:latest
```

### 3. 使用 Docker Compose

```bash
# 启动应用
docker-compose up -d

# 启动应用 + Nginx 反向代理
docker-compose --profile with-nginx up -d

# 查看日志
docker-compose logs -f

# 停止应用
docker-compose down
```

## 📊 部署脚本使用

`deploy.sh` 脚本提供了完整的部署管理功能：

```bash
# 构建镜像
./deploy.sh build

# 运行容器
./deploy.sh run

# 停止容器
./deploy.sh stop

# 重启容器
./deploy.sh restart

# 查看日志
./deploy.sh logs

# 查看状态
./deploy.sh status

# 清理资源
./deploy.sh clean

# 显示帮助
./deploy.sh help
```

## 🌐 访问应用

部署成功后，可以通过以下地址访问：

- **主应用**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **Nginx 代理** (如果启用): http://localhost:80

## 🔧 环境配置

### 环境变量

在生产环境中，建议设置以下环境变量：

```bash
# 基本配置
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# 数据库配置
DATABASE_URL=file:./dev.db

# 认证配置（如果使用）
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://your-domain.com

# 其他配置
NEXT_TELEMETRY_DISABLED=1
```

### 数据持久化

重要数据需要挂载到宿主机：

```bash
# 数据库文件
-v $(pwd)/dev.db:/app/dev.db

# 上传文件
-v $(pwd)/public/uploads:/app/public/uploads
```

## 🏥 健康检查

应用提供了健康检查端点：

```bash
# 检查应用状态
curl http://localhost:3000/api/health

# 简单存活检查
curl -I http://localhost:3000/api/health
```

健康检查返回的信息包括：
- 应用状态
- 运行时间
- 内存使用情况
- 环境信息

## 🔒 生产环境注意事项

### 安全配置
1. 设置强密码和密钥
2. 使用 HTTPS
3. 配置防火墙
4. 定期更新依赖

### 性能优化
1. 启用 Nginx 缓存
2. 配置 CDN
3. 监控资源使用
4. 定期清理日志

### 备份策略
1. 定期备份数据库
2. 备份上传文件
3. 备份配置文件

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3000
   
   # 使用不同端口
   docker run -p 3001:3000 edgoing:latest
   ```

2. **权限问题**
   ```bash
   # 给脚本执行权限
   chmod +x *.sh
   ```

3. **镜像构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   docker build --no-cache -t edgoing:latest .
   ```

4. **容器无法启动**
   ```bash
   # 查看详细日志
   docker logs edgoing-app
   
   # 进入容器调试
   docker exec -it edgoing-app sh
   ```

## 📞 支持

如果遇到部署问题，请检查：
1. Docker 版本是否兼容
2. 系统架构是否为 x86_64
3. 端口是否被占用
4. 文件权限是否正确
