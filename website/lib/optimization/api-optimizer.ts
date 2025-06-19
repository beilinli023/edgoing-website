/**
 * 🛡️ 安全的API优化包装器
 * 
 * 功能:
 * - 提供向后兼容的API优化
 * - 自动降级到原始查询（如果优化失败）
 * - 保持原有API接口不变
 * - 添加性能监控和错误处理
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryOptimizer } from './query-optimizer'
import { performanceMonitor } from '../monitoring/performance-monitor'
import fs from 'fs'
import path from 'path'

// 验证图片文件是否存在的辅助函数
function validateImageUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false
  }

  try {
    // 从URL中提取文件路径
    const urlPath = url.replace('/uploads/', '')
    const filePath = path.join(process.cwd(), 'public', 'uploads', urlPath)
    return fs.existsSync(filePath)
  } catch (error) {
    console.warn('Error validating image URL:', url, error)
    return false
  }
}

// 过滤有效图片的辅助函数
function filterValidImages(media: any): any | null {
  if (!media || !media.url) {
    return null
  }

  // 在开发环境中验证文件是否存在，但不过滤掉博客
  if (process.env.NODE_ENV === 'development' && !validateImageUrl(media.url)) {
    console.warn('🖼️ Invalid image detected:', media.url, 'File does not exist')
    // 返回一个占位符图片对象，而不是null
    return {
      ...media,
      url: '/images/placeholder-blog.jpg', // 使用占位符图片
      alt: media.alt || 'Blog image placeholder'
    }
  }

  return media
}

export class SafeApiOptimizer {
  /**
   * 安全的博客API优化
   */
  static async optimizedBlogsHandler(
    request: NextRequest,
    fallbackHandler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '6')
      const language = searchParams.get('language') || 'zh'
      const status = searchParams.get('status') || 'PUBLISHED'

      // 构建where条件（与原始API保持一致）
      const where: any = {
        language: 'zh', // 总是查询中文主记录
        status: 'PUBLISHED'
      }

      console.log('🚀 Using optimized blogs query')
      
      const result = await queryOptimizer.findOptimizedBlogs({
        where,
        page,
        limit,
        language,
        useCache: true // 🔧 重新启用缓存，使用修复后的键生成
      })

      // 🛡️ 应用图片过滤逻辑
      const formattedBlogs = result.blogs.map((blog: any) => {
        const translation = blog.blog_translations.find((t: any) => t.language === language)

        // 过滤有效的图片
        const validMainImage = filterValidImages(blog.media)
        const validCarouselImages = blog.blog_carousels
          .map((carousel: any) => ({
            ...carousel,
            media: filterValidImages(carousel.media)
          }))
          .filter((carousel: any) => carousel.media !== null)

        if (language === 'en' && translation) {
          // 如果请求英文且有英文翻译，返回英文内容作为主内容
          return {
            ...blog,
            title: translation.title,
            slug: translation.slug,
            content: translation.content,
            author: translation.author,
            program: translation.program,
            grade: translation.grade,
            language: 'en', // 标记为英文
            blog_translations: blog.blog_translations,
            image: validMainImage, // 🛡️ 使用验证过的图片
            carouselImages: validCarouselImages, // 🛡️ 使用验证过的轮播图
          }
        } else {
          // 返回中文内容
          return {
            ...blog,
            blog_translations: blog.blog_translations,
            image: validMainImage, // 🛡️ 使用验证过的图片
            carouselImages: validCarouselImages, // 🛡️ 使用验证过的轮播图
          }
        }
      })

      // 确保返回格式与原始API一致
      return NextResponse.json({
        blogs: formattedBlogs,
        pagination: result.pagination,
        total: result.total,
        debug: { // 🔍 添加调试信息
          page: page,
          requestedPage: page,
          actualPage: result.pagination.page,
          cacheUsed: true
        }
      })

    } catch (error) {
      console.warn('⚠️ Optimized blogs query failed, falling back to original:', error)
      
      // 安全降级：如果优化查询失败，使用原始处理器
      return performanceMonitor.trackQuery(
        'blogs.fallback',
        () => fallbackHandler(),
        { warnThreshold: 300, errorThreshold: 1000 }
      )
    }
  }

  /**
   * 安全的项目API优化
   */
  static async optimizedProgramsHandler(
    request: NextRequest,
    type: 'international' | 'china',
    fallbackHandler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const language = searchParams.get('language') || 'zh'
      const status = searchParams.get('status') || 'PUBLISHED'
      const city = searchParams.get('city')
      const programType = searchParams.get('type')
      const gradeLevel = searchParams.get('gradeLevel')

      // 构建where条件
      const where: any = { status }
      
      if (type === 'china') {
        where.language = 'zh' // 中国项目始终从主记录获取
      }

      if (city) {
        if (type === 'international') {
          where.cities = { name: city }
        } else {
          where.city = city
        }
      }

      if (programType) {
        where.type = { contains: programType }
      }

      if (gradeLevel) {
        where.gradeLevel = { contains: gradeLevel }
      }

      console.log(`🚀 Using optimized ${type} programs query`)
      
      const result = await queryOptimizer.findOptimizedPrograms({
        where,
        page,
        limit,
        language,
        type,
        useCache: true
      })

      // 处理JSON字段解析（保持与原始API一致）
      const processedPrograms = result.programs.map(program => {
        const processed = { ...program }
        
        // 解析JSON字段
        if (processed.type && typeof processed.type === 'string') {
          try {
            processed.type = JSON.parse(processed.type)
          } catch {
            processed.type = []
          }
        }
        
        if (processed.gradeLevel && typeof processed.gradeLevel === 'string') {
          try {
            processed.gradeLevel = JSON.parse(processed.gradeLevel)
          } catch {
            processed.gradeLevel = []
          }
        }
        
        if (processed.sessions && typeof processed.sessions === 'string') {
          try {
            processed.sessions = JSON.parse(processed.sessions)
          } catch {
            processed.sessions = []
          }
        }

        return processed
      })

      return NextResponse.json({
        programs: processedPrograms,
        pagination: result.pagination,
        total: result.total
      })

    } catch (error) {
      console.warn(`⚠️ Optimized ${type} programs query failed, falling back to original:`, error)
      
      return performanceMonitor.trackQuery(
        `${type}_programs.fallback`,
        () => fallbackHandler(),
        { warnThreshold: 300, errorThreshold: 1000 }
      )
    }
  }

  /**
   * 缓存失效处理
   */
  static invalidateRelatedCache(entityType: string, entityId?: string): void {
    try {
      const patterns: string[] = []
      
      switch (entityType) {
        case 'blog':
          patterns.push('blogs')
          break
        case 'international_program':
          patterns.push('programs_international')
          break
        case 'china_program':
          patterns.push('programs_china')
          break
        case 'user':
          patterns.push('blogs', 'programs_international', 'programs_china')
          break
        case 'media':
          patterns.push('blogs')
          break
        default:
          console.warn(`Unknown entity type for cache invalidation: ${entityType}`)
      }
      
      if (patterns.length > 0) {
        queryOptimizer.invalidateCache(patterns)
        console.log(`🗑️ Invalidated cache for patterns: ${patterns.join(', ')}`)
      }
    } catch (error) {
      console.warn('Failed to invalidate cache:', error)
    }
  }

  /**
   * 获取优化统计信息
   */
  static getOptimizationStats(): {
    cacheStats: { size: number; keys: string[] }
    timestamp: string
  } {
    return {
      cacheStats: queryOptimizer.getCacheStats(),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: any
  }> {
    try {
      const stats = this.getOptimizationStats()
      
      return {
        status: 'healthy',
        details: {
          cacheSize: stats.cacheStats.size,
          timestamp: stats.timestamp,
          optimizerActive: true
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          optimizerActive: false
        }
      }
    }
  }
}

/**
 * 中间件：自动缓存失效
 */
export function createCacheInvalidationMiddleware() {
  return {
    /**
     * 在数据修改后自动失效相关缓存
     */
    afterCreate: (entityType: string, entityId: string) => {
      SafeApiOptimizer.invalidateRelatedCache(entityType, entityId)
    },
    
    afterUpdate: (entityType: string, entityId: string) => {
      SafeApiOptimizer.invalidateRelatedCache(entityType, entityId)
    },
    
    afterDelete: (entityType: string, entityId: string) => {
      SafeApiOptimizer.invalidateRelatedCache(entityType, entityId)
    }
  }
}

// 导出缓存失效中间件实例
export const cacheInvalidation = createCacheInvalidationMiddleware()
