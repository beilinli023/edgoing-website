# 🗂️ 共享字段管理说明

## 📋 概述

共享字段（程序类型、年级、国家、城市）现在通过管理员界面进行管理，不再使用初始化脚本。

## 🛠️ 管理方式

### 1. 管理员界面
- **访问路径**: `/admin/shared-fields`
- **功能**: 创建、编辑、删除、排序共享字段
- **权限**: 需要管理员登录

### 2. API接口
- **获取数据**: `GET /api/shared-fields`
- **管理接口**: `/api/admin/shared-fields/*`

## 📊 当前字段数据

### 程序类型 (Program Types)
- 商务 (Business)
- 学术拓展 (Academic Enrichment)
- 传统与艺术探索 (Heritage & Arts Exploration)
- 表演艺术 (Performing Arts)
- 语言与生活 (Language & Lifestyle)
- 语言强化 (Language Intensive)
- 历史与公民 (History & Civic)
- STEM与科学创新 (STEM & Science)
- 宗教与信仰 (Religion & Belief)
- 社区服务 (Community Service)
- 体育 (Sports)
- 专业发展 (Academic Courses)
- 学习考察 (Learning expedition)
- 其他 (Others)

### 年级 (Grade Levels)
- 小学 (Primary School)
- 初中 (Middle School)
- 高中 (High School)
- 本科 (Undergraduate)
- 研究生 (Graduate)
- 成人 (Adult)

## ⚠️ 重要说明

### 已删除的文件
- `scripts/init-shared-fields.js` - 已删除，因为包含过时的字段定义

### 原因
1. **数据不一致**: 脚本中的字段与实际使用的字段不匹配
2. **覆盖风险**: 运行脚本会覆盖正确的共享字段数据
3. **管理方式**: 现在通过管理员界面管理更安全

## 🔧 维护建议

### 添加新字段
1. 通过管理员界面添加
2. 确保中英文名称都正确
3. 设置合适的排序顺序

### 修改现有字段
1. 谨慎修改，可能影响现有项目
2. 建议先备份数据库
3. 通知相关开发人员

### 数据备份
定期备份共享字段数据，避免意外丢失。

## 📝 历史记录

- **2025-01-XX**: 删除 `init-shared-fields.js` 脚本
- **原因**: 防止覆盖正确的共享字段数据
- **影响**: 无，所有功能通过管理员界面实现
