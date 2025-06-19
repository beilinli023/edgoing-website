/**
 * 🔍 开发环境性能监控
 * 
 * 功能:
 * - 监控编译时间
 * - 跟踪字体加载状态
 * - 检测性能瓶颈
 * - 提供优化建议
 */

interface PerformanceMetrics {
  compileTime?: number
  fontLoadTime?: number
  pageLoadTime?: number
  apiResponseTime?: number
}

class DevPerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private startTime: number = Date.now()
  
  constructor() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.initBrowserMonitoring()
    }
  }

  /**
   * 浏览器端性能监控
   */
  private initBrowserMonitoring() {
    // 监控字体加载
    this.monitorFontLoading()
    
    // 监控页面加载
    this.monitorPageLoad()
    
    // 监控API响应
    this.monitorApiCalls()
  }

  /**
   * 监控字体加载性能
   */
  private monitorFontLoading() {
    const fontLoadStart = performance.now()
    
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        const fontLoadTime = performance.now() - fontLoadStart
        this.metrics.fontLoadTime = fontLoadTime
        
        if (fontLoadTime > 3000) {
          console.warn(`🔤 字体加载时间过长: ${fontLoadTime.toFixed(2)}ms`)
          this.suggestFontOptimization()
        } else {
          console.log(`✅ 字体加载完成: ${fontLoadTime.toFixed(2)}ms`)
        }
      }).catch((error) => {
        console.warn('🔤 字体加载失败:', error)
        this.suggestFontFallback()
      })
    }
  }

  /**
   * 监控页面加载性能
   */
  private monitorPageLoad() {
    window.addEventListener('load', () => {
      const pageLoadTime = performance.now()
      this.metrics.pageLoadTime = pageLoadTime
      
      if (pageLoadTime > 3000) {
        console.warn(`📄 页面加载时间过长: ${pageLoadTime.toFixed(2)}ms`)
        this.suggestPageOptimization()
      } else {
        console.log(`✅ 页面加载完成: ${pageLoadTime.toFixed(2)}ms`)
      }
    })
  }

  /**
   * 监控API调用性能
   */
  private monitorApiCalls() {
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const start = performance.now()
      const response = await originalFetch(...args)
      const duration = performance.now() - start
      
      const url = typeof args[0] === 'string' ? args[0] : args[0].url
      
      if (duration > 1000) {
        console.warn(`🐌 API响应缓慢: ${url} - ${duration.toFixed(2)}ms`)
      } else if (duration > 500) {
        console.log(`⚠️ API响应较慢: ${url} - ${duration.toFixed(2)}ms`)
      }
      
      return response
    }
  }

  /**
   * 字体优化建议
   */
  private suggestFontOptimization() {
    console.group('🔤 字体优化建议')
    console.log('1. 考虑使用本地字体文件')
    console.log('2. 启用字体预加载: <link rel="preload" as="font">')
    console.log('3. 使用font-display: swap')
    console.log('4. 配置字体降级策略')
    console.groupEnd()
  }

  /**
   * 字体降级建议
   */
  private suggestFontFallback() {
    console.group('🔤 字体降级建议')
    console.log('1. 检查网络连接')
    console.log('2. 验证Google Fonts URL')
    console.log('3. 配置本地字体备选')
    console.log('4. 使用系统字体作为降级')
    console.groupEnd()
  }

  /**
   * 页面优化建议
   */
  private suggestPageOptimization() {
    console.group('📄 页面优化建议')
    console.log('1. 启用代码分割和懒加载')
    console.log('2. 优化图片大小和格式')
    console.log('3. 减少不必要的JavaScript')
    console.log('4. 使用服务端渲染(SSR)')
    console.groupEnd()
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceMetrics & { uptime: number } {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    }
  }

  /**
   * 记录编译时间
   */
  recordCompileTime(duration: number) {
    this.metrics.compileTime = duration
    
    if (duration > 10000) {
      console.warn(`🐌 编译时间过长: ${duration}ms`)
      this.suggestCompileOptimization()
    }
  }

  /**
   * 编译优化建议
   */
  private suggestCompileOptimization() {
    console.group('⚡ 编译优化建议')
    console.log('1. 启用增量编译')
    console.log('2. 配置Webpack缓存')
    console.log('3. 减少不必要的依赖')
    console.log('4. 考虑使用Turbopack')
    console.groupEnd()
  }
}

// 导出单例实例
export const devPerformanceMonitor = new DevPerformanceMonitor()

/**
 * 性能监控Hook (仅开发环境)
 */
export function useDevPerformanceMonitor() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return {
    getReport: () => devPerformanceMonitor.getPerformanceReport(),
    recordCompileTime: (duration: number) => devPerformanceMonitor.recordCompileTime(duration)
  }
}
