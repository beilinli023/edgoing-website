# 🌟 EdGoing Website

EdGoing 是一个专业的国际教育咨询平台，为学生提供海外留学项目和教育服务。

## 📋 项目概述

这是一个基于 Next.js 14 构建的现代化网站，支持中英文双语，提供完整的内容管理系统和用户交互功能。

### ✨ 主要功能

- 🌍 **多语言支持** - 中文/英文双语切换
- 📚 **项目展示** - 海外留学项目详细介绍
- 📝 **博客系统** - 教育资讯和经验分享
- 🎥 **视频展示** - 项目视频和学生分享
- 💬 **用户评价** - 学生和家长真实反馈
- 📧 **联系表单** - 在线咨询和申请
- 🔧 **管理后台** - 完整的内容管理系统

### 🏗️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: SQLite + Prisma ORM
- **国际化**: react-i18next
- **部署**: Docker + Docker Compose

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- Docker (可选，用于部署)

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/beilinli023/edgoing-website.git
   cd edgoing-website
   ```

2. **安装依赖**
   ```bash
   cd website
   npm install --legacy-peer-deps
   ```

3. **初始化数据库**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   - 前端: http://localhost:3000
   - 管理后台: http://localhost:3000/admin

## 🐳 Docker 部署

### 快速部署

```bash
cd website

# 构建镜像
./build-docker.sh

# 运行容器
./deploy.sh run

# 或使用 Docker Compose
docker-compose up -d
```

### 生产环境部署

```bash
# 构建生产镜像
docker build --platform linux/amd64 -t edgoing:latest .

# 运行生产容器
docker run -d \
  --name edgoing-app \
  -p 3000:3000 \
  -v $(pwd)/dev.db:/app/dev.db \
  --restart unless-stopped \
  edgoing:latest
```

## 📁 项目结构

```
edgoing-website/
├── website/                 # 主应用目录
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # 管理后台
│   │   ├── api/            # API 路由
│   │   └── ...             # 页面组件
│   ├── components/         # React 组件
│   ├── lib/               # 工具库
│   ├── prisma/            # 数据库模型
│   ├── public/            # 静态资源
│   ├── locales/           # 国际化文件
│   ├── Dockerfile         # Docker 配置
│   ├── docker-compose.yml # Docker Compose 配置
│   └── ...
└── README.md              # 项目说明
```

## 🔧 开发指南

### 数据库管理

```bash
# 查看数据库
npx prisma studio

# 重置数据库
npx prisma db push --force-reset

# 生成客户端
npx prisma generate
```

### 多语言开发

- 语言文件位于 `locales/` 目录
- 支持中文 (`zh`) 和英文 (`en`)
- 使用 `useTranslation` Hook 进行翻译

### 组件开发

- 使用 shadcn/ui 组件库
- 遵循 Tailwind CSS 设计规范
- 支持响应式设计

## 📚 API 文档

### 公开 API

- `GET /api/content` - 获取网站内容
- `GET /api/programs` - 获取项目列表
- `GET /api/blogs` - 获取博客文章
- `GET /api/videos` - 获取视频列表
- `POST /api/contact` - 提交联系表单

### 管理 API

- `GET /api/admin/*` - 管理后台 API
- 需要管理员认证

## 🔒 安全配置

- 使用 JWT 进行身份验证
- API 路由保护
- 输入验证和清理
- CORS 配置

## 🌐 部署说明

### 环境变量

```bash
NODE_ENV=production
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com
```

### 健康检查

- 端点: `/api/health`
- 返回应用运行状态和系统信息

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **网站**: [EdGoing Official](https://edgoing.com)
- **邮箱**: info@edgoing.com
- **GitHub**: [@beilinli023](https://github.com/beilinli023)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**EdGoing** - 让教育无国界 🌍
