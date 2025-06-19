# 🔍 安全性能监控系统使用指南

## 概述

本系统提供了一个轻量级、安全的性能监控解决方案，用于跟踪数据库查询性能和系统指标。

## 🔒 安全特性

- ✅ **数据保护**: 不记录敏感数据（查询参数、用户信息等）
- ✅ **错误隔离**: 监控系统错误不会影响主要功能
- ✅ **内存限制**: 自动清理旧数据，防止内存泄漏
- ✅ **权限控制**: 只允许管理员访问监控数据
- ✅ **自动清理**: 24小时自动清理旧指标

## 📊 功能特性

### 1. 查询性能监控
- 自动跟踪数据库查询执行时间
- 识别慢查询和错误查询
- 提供性能统计和趋势分析

### 2. 系统资源监控
- 内存使用情况
- 系统运行时间
- 错误率统计

### 3. 实时仪表板
- 可视化性能指标
- 实时状态监控
- 历史数据分析

## 🚀 使用方法

### 基本查询监控

```typescript
import { performanceMonitor } from '@/lib/monitoring/performance-monitor'

// 监控单个查询
const result = await performanceMonitor.trackQuery(
  'users.findFirst', // 查询名称（不包含敏感信息）
  () => prisma.users.findFirst({ where: { id: userId } }),
  {
    warnThreshold: 100,  // 100ms警告阈值
    errorThreshold: 500  // 500ms错误阈值
  }
)
```

### 使用监控的Prisma客户端

```typescript
import { monitoredPrisma, monitoredQueries } from '@/lib/monitoring/monitored-prisma'

// 使用预配置的监控查询
const blogs = await monitoredQueries.findBlogs({
  where: { status: 'PUBLISHED' },
  take: 10
})

// 或使用通用监控方法
const result = await monitoredPrisma.$monitoredQuery(
  'custom.query',
  () => monitoredPrisma.users.findMany(),
  { warnThreshold: 200 }
)
```

### 记录系统指标

```typescript
import { performanceMonitor } from '@/lib/monitoring/performance-monitor'

// 记录内存使用情况
const memoryUsage = process.memoryUsage()
performanceMonitor.recordSystemMetric({
  memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
  activeConnections: connectionCount
})
```

## 📈 访问监控数据

### 管理员仪表板
访问 `/admin/monitoring` 查看完整的监控仪表板（需要管理员权限）

### API端点
- `GET /api/admin/monitoring?type=overview` - 系统概览
- `GET /api/admin/monitoring?type=queries` - 查询统计
- `GET /api/admin/monitoring?type=health` - 健康检查
- `HEAD /api/admin/monitoring` - 简单健康检查（无需认证）

### 获取性能统计

```typescript
import { performanceMonitor } from '@/lib/monitoring/performance-monitor'

// 获取查询统计
const queryStats = performanceMonitor.getQueryStats()

// 获取系统概览
const systemOverview = performanceMonitor.getSystemOverview()
```

## ⚠️ 安全注意事项

### 1. 数据隐私
- 查询名称会自动清理，移除敏感信息
- 不记录查询参数或结果
- 不记录用户身份信息

### 2. 性能影响
- 监控开销极小（< 1ms）
- 错误不会影响主要功能
- 自动内存管理

### 3. 访问控制
- 监控API需要管理员权限
- 开发环境可以禁用认证
- 生产环境强制认证

## 🔧 配置选项

### 性能阈值
```typescript
const options = {
  warnThreshold: 100,    // 慢查询警告阈值（毫秒）
  errorThreshold: 1000,  // 严重慢查询阈值（毫秒）
  includeStackTrace: false // 是否包含堆栈跟踪
}
```

### 内存限制
- 每个查询类型最多保留 100 个指标
- 系统指标最多保留 200 个
- 最多跟踪 50 种查询类型
- 24小时自动清理旧数据

## 📝 最佳实践

### 1. 查询命名
```typescript
// ✅ 好的命名
'users.findFirst'
'blogs.findMany.withTranslations'
'applications.aggregate.stats'

// ❌ 避免的命名
'SELECT * FROM users WHERE email = user@example.com'
'findUserById123'
```

### 2. 阈值设置
```typescript
// 简单查询
{ warnThreshold: 50, errorThreshold: 200 }

// 复杂查询（带关联）
{ warnThreshold: 200, errorThreshold: 1000 }

// 聚合查询
{ warnThreshold: 500, errorThreshold: 2000 }
```

### 3. 错误处理
```typescript
try {
  const result = await performanceMonitor.trackQuery(
    'complex.query',
    () => complexDatabaseOperation(),
    { errorThreshold: 5000 }
  )
  return result
} catch (error) {
  // 监控系统会自动记录错误
  // 正常处理业务逻辑错误
  throw error
}
```

## 🚨 故障排除

### 监控数据不显示
1. 检查管理员权限
2. 确认API路由正常工作
3. 查看浏览器控制台错误

### 性能影响过大
1. 检查阈值设置是否合理
2. 确认查询命名不包含敏感数据
3. 验证自动清理是否正常工作

### 内存使用过高
1. 检查是否有内存泄漏
2. 确认清理任务正常运行
3. 调整内存限制参数

## 📊 监控指标说明

### 查询指标
- **count**: 执行次数
- **avgDuration**: 平均执行时间（毫秒）
- **maxDuration**: 最大执行时间（毫秒）
- **minDuration**: 最小执行时间（毫秒）
- **errorRate**: 错误率（百分比）
- **lastExecuted**: 最后执行时间

### 系统指标
- **totalQueries**: 总查询数
- **slowQueries**: 慢查询数
- **errorQueries**: 错误查询数
- **avgMemoryUsage**: 平均内存使用（MB）
- **monitoringStatus**: 监控状态（healthy/warning/critical）

## 🔄 自动化

### 定期清理
系统每小时自动清理旧数据，无需手动干预。

### 健康检查
可以使用 `HEAD /api/admin/monitoring` 进行自动化健康检查。

### 告警集成
可以基于 `monitoringStatus` 集成外部告警系统。

---

**注意**: 本监控系统设计为轻量级解决方案，适合中小型应用。对于大型生产环境，建议考虑专业的APM解决方案。
