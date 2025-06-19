# 🚀 EdGoing Vercel 部署指南

本指南将帮助您解决在Vercel上部署EdGoing网站时遇到的404错误问题。

## 🔍 问题分析

您遇到的404 NOT_FOUND错误主要原因：

1. **项目结构问题** - Vercel没有正确识别Next.js应用位置
2. **数据库配置问题** - SQLite在Vercel上不支持
3. **缺少Vercel配置文件**
4. **构建配置问题**

## 🛠️ 解决方案

### 1. 项目结构调整

您的Next.js应用在`website/`子目录中，需要特殊配置：

**选项A: 推荐 - 将website设为根目录**
```bash
# 在Vercel项目设置中设置根目录为 "website"
```

**选项B: 使用配置文件**
- 已创建 `vercel.json` 配置文件
- 已创建 `website/vercel.json` 配置文件

### 2. 数据库配置

**重要：SQLite不支持Vercel部署**

需要切换到PostgreSQL：

```bash
# 1. 创建Vercel PostgreSQL数据库
vercel postgres create

# 2. 连接数据库到项目
vercel postgres connect

# 3. 获取数据库URL并设置环境变量
```

### 3. 环境变量配置

在Vercel项目设置中添加以下环境变量：

```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
DATABASE_URL=postgresql://... (从Vercel PostgreSQL获取)
JWT_SECRET=your-secure-jwt-secret
```

### 4. 修改Prisma配置

更新 `website/prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
  url      = env("DATABASE_URL")  // 使用环境变量
}
```

## 📋 部署步骤

### 步骤1: 准备代码

1. **提交当前更改**
```bash
git add .
git commit -m "Add Vercel configuration files"
git push
```

### 步骤2: 配置Vercel项目

1. **登录Vercel控制台**
2. **导入项目**
3. **⚠️ 重要：设置根目录为 `website`** - 这是解决"No Next.js version detected"错误的关键
4. **配置环境变量**

### 步骤3: 数据库迁移

1. **创建PostgreSQL数据库**
```bash
vercel postgres create edgoing-db
```

2. **更新数据库配置**
```bash
# 更新 schema.prisma
# 运行迁移
npx prisma db push
```

### 步骤4: 部署

1. **触发部署**
2. **检查构建日志**
3. **验证部署结果**

## 🔧 故障排除

### 常见问题

1. **"No Next.js version detected" 错误**
   - ⚠️ **必须设置根目录为 `website`**
   - 在Vercel项目设置 → General → Root Directory 设置为 `website`
   - 确保 `website/package.json` 中有 `next` 依赖

2. **404错误持续**
   - 检查根目录设置
   - 验证vercel.json配置
   - 确认路由配置

3. **数据库连接错误**
   - 验证DATABASE_URL环境变量
   - 检查Prisma配置
   - 运行数据库迁移

4. **构建失败**
   - 检查依赖版本冲突
   - 验证TypeScript配置
   - 查看构建日志

### 调试命令

```bash
# 本地验证构建
npm run build

# 检查Vercel配置
vercel --debug

# 查看部署日志
vercel logs
```

## 📞 支持

如果问题持续存在，请提供：
1. Vercel部署日志
2. 错误截图
3. 项目配置信息

## 🎯 快速修复

**最快的解决方案：**

1. **设置根目录**
   - 在Vercel项目设置中设置根目录为 `website`

2. **配置环境变量**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

3. **运行部署检查**
   ```bash
   cd website
   npm run vercel:check
   ```

4. **重新部署**

## 🚀 一键部署命令

```bash
# 1. 检查部署准备情况
cd website && npm run vercel:check

# 2. 如果使用PostgreSQL，迁移数据
npm run db:migrate-to-postgres

# 3. 部署到Vercel
vercel --prod
```

这应该能解决大部分404问题。
