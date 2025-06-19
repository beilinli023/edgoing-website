/**
 * 简化的性能监控系统 - Vercel兼容版本
 * 用于跟踪数据库查询性能和系统指标
 */

interface QueryMetric {
  queryName: string
  duration: number
  timestamp: number
  status: 'success' | 'error'
}

interface SystemMetric {
  memoryUsage: number
  timestamp: number
  activeConnections?: number
}

interface PerformanceStats {
  queryName: string
  count: number
  avgDuration: number
  maxDuration: number
  minDuration: number
  errorRate: number
  lastExecuted: number
}

export class SafePerformanceMonitor {
  private static instance: SafePerformanceMonitor
  private queryMetrics: Map<string, QueryMetric[]> = new Map()
  private systemMetrics: SystemMetric[] = []

  // 简化的限制
  private readonly MAX_METRICS_PER_QUERY = 50
  private readonly MAX_SYSTEM_METRICS = 100
  private readonly SLOW_QUERY_THRESHOLD = 100 // 100ms

  private constructor() {
    // 私有构造函数
  }

  static getInstance(): SafePerformanceMonitor {
    if (!this.instance) {
      this.instance = new SafePerformanceMonitor()
    }
    return this.instance
  }

  /**
   * 简化的查询跟踪
   */
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    options: { warnThreshold?: number } = {}
  ): Promise<T> {
    const { warnThreshold = this.SLOW_QUERY_THRESHOLD } = options
    const startTime = Date.now()

    try {
      const result = await queryFn()
      const duration = Date.now() - startTime

      // 简单记录
      this.recordQueryMetric({
        queryName: queryName.substring(0, 50), // 简单截断
        duration,
        timestamp: Date.now(),
        status: 'success'
      })

      // 简单警告
      if (duration > warnThreshold) {
        console.warn(`Slow query: ${queryName} took ${duration}ms`)
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      this.recordQueryMetric({
        queryName: queryName.substring(0, 50),
        duration,
        timestamp: Date.now(),
        status: 'error'
      })

      throw error
    }
  }

  /**
   * 简化的系统指标记录
   */
  recordSystemMetric(metric: Omit<SystemMetric, 'timestamp'>): void {
    try {
      this.systemMetrics.push({
        ...metric,
        timestamp: Date.now()
      })

      // 简单限制
      if (this.systemMetrics.length > this.MAX_SYSTEM_METRICS) {
        this.systemMetrics.shift()
      }
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 简化的查询统计
   */
  getQueryStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {}

    try {
      this.queryMetrics.forEach((metrics, queryName) => {
        if (metrics.length === 0) return

        const durations = metrics.map(m => m.duration)
        const errors = metrics.filter(m => m.status === 'error').length

        stats[queryName] = {
          queryName,
          count: metrics.length,
          avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          maxDuration: Math.round(Math.max(...durations)),
          minDuration: Math.round(Math.min(...durations)),
          errorRate: Math.round((errors / metrics.length) * 100),
          lastExecuted: Math.max(...metrics.map(m => m.timestamp))
        }
      })
    } catch (error) {
      // 忽略错误
    }

    return stats
  }

  /**
   * 简化的系统概览
   */
  getSystemOverview() {
    try {
      let totalQueries = 0
      let errorQueries = 0

      this.queryMetrics.forEach(metrics => {
        totalQueries += metrics.length
        errorQueries += metrics.filter(m => m.status === 'error').length
      })

      return {
        totalQueries,
        slowQueries: 0,
        errorQueries,
        avgMemoryUsage: 0,
        monitoringStatus: 'healthy' as const
      }
    } catch (error) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        errorQueries: 0,
        avgMemoryUsage: 0,
        monitoringStatus: 'healthy' as const
      }
    }
  }

  /**
   * 简化的清理方法
   */
  cleanup(): void {
    try {
      // 简单清理：只保留最近的指标
      this.queryMetrics.forEach((metrics, queryName) => {
        if (metrics.length > this.MAX_METRICS_PER_QUERY) {
          this.queryMetrics.set(queryName, metrics.slice(-this.MAX_METRICS_PER_QUERY))
        }
      })

      if (this.systemMetrics.length > this.MAX_SYSTEM_METRICS) {
        this.systemMetrics = this.systemMetrics.slice(-this.MAX_SYSTEM_METRICS)
      }
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 简化的指标记录
   */
  private recordQueryMetric(metric: QueryMetric): void {
    try {
      if (!this.queryMetrics.has(metric.queryName)) {
        this.queryMetrics.set(metric.queryName, [])
      }

      const metrics = this.queryMetrics.get(metric.queryName)!
      metrics.push(metric)

      if (metrics.length > this.MAX_METRICS_PER_QUERY) {
        metrics.shift()
      }
    } catch (error) {
      // 忽略错误
    }
  }
}

// 导出单例实例
export const performanceMonitor = SafePerformanceMonitor.getInstance()
