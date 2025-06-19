# 🐳 EdGoing Next.js Docker 部署文件
# 支持 x86_64 (AMD64) 架构的生产环境部署

# ==========================================
# 阶段 1: 依赖安装阶段
# ==========================================
FROM node:20-slim AS deps
# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 复制包管理文件
COPY package*.json ./
# 安装依赖（使用 npm install 而不是 npm ci 来处理版本冲突）
RUN npm install --legacy-peer-deps

# ==========================================
# 阶段 2: 构建阶段
# ==========================================
FROM node:20-slim AS builder
# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true

# 生成 Prisma 客户端（使用预安装的二进制文件）
RUN npx prisma generate --generator client

# 构建应用
RUN npm run build

# ==========================================
# 阶段 3: 运行阶段
# ==========================================
FROM node:20-slim AS runner
# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public

# 复制 standalone 构建输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma 相关文件
COPY --from=builder /app/prisma ./prisma

# 创建数据库目录和启动脚本
RUN mkdir -p /app/data

# 创建启动脚本
RUN echo '#!/bin/bash\n\
echo "🔧 生成 Prisma 客户端..."\n\
npx prisma generate\n\
echo "✅ Prisma 客户端生成完成"\n\
echo "🚀 启动应用..."\n\
exec node server.js' > /app/start.sh && chmod +x /app/start.sh

# 设置文件权限
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["/app/start.sh"]
