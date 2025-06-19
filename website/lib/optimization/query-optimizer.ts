/**
 * 🚀 安全的查询优化器
 * 
 * 功能:
 * - 优化复杂查询的执行策略
 * - 减少N+1查询问题
 * - 提供查询结果缓存
 * - 保持API接口不变
 */

import { PrismaClient } from '@prisma/client'
import { performanceMonitor } from '../monitoring/performance-monitor'

// 简单的内存缓存（生产环境应使用Redis）
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5分钟

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export class QueryOptimizer {
  private cache = new SimpleCache()
  
  constructor(private prisma: PrismaClient) {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cache.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(prefix: string, params: any): string {
    // 🔧 使用更简单直接的键生成方式，确保page参数被正确包含
    const keyParts = [
      prefix,
      `page:${params.page || 1}`,
      `limit:${params.limit || 6}`,
      `lang:${params.language || 'zh'}`,
      `where:${JSON.stringify(params.where || {})}`
    ]

    const key = keyParts.join('|')

    console.log('🔑 Cache key generation:', {
      prefix,
      params,
      keyParts,
      finalKey: key
    })

    return key
  }

  /**
   * 优化的博客查询 - 减少关联查询
   */
  async findOptimizedBlogs(options: {
    where?: any
    page?: number
    limit?: number
    language?: string
    useCache?: boolean
  }) {
    const {
      where = {},
      page = 1,
      limit = 6,
      language = 'zh',
      useCache = true
    } = options

    const cacheKey = this.generateCacheKey('blogs', { where, page, limit, language })
    
    console.log('🔍 Blog query debug:', { page, limit, language, cacheKey })
    
    // 检查缓存
    if (useCache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.log('📦 Cache HIT for key:', cacheKey, 'page:', page)
        return cached
      } else {
        console.log('❌ Cache MISS for key:', cacheKey, 'page:', page)
      }
    }

    return performanceMonitor.trackQuery(
      'blogs.findMany.optimized',
      async () => {
        // 第一步：获取基础博客数据
        const [blogs, total] = await Promise.all([
          this.prisma.blogs.findMany({
            where,
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
              author: true,
              program: true,
              grade: true,
              status: true,
              language: true,
              imageId: true,
              order: true,
              publishedAt: true,
              createdAt: true,
              updatedAt: true,
              authorId: true,
            },
            orderBy: [
              { order: 'asc' },
              { publishedAt: 'desc' },
              { createdAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.blogs.count({ where }),
        ])

        if (blogs.length === 0) {
          const result = { blogs: [], total, pagination: { page, limit, total, pages: 0 } }
          if (useCache) this.cache.set(cacheKey, result, 2 * 60 * 1000) // 2分钟缓存
          return result
        }

        // 第二步：批量获取关联数据
        const blogIds = blogs.map(blog => blog.id)
        const imageIds = blogs.map(blog => blog.imageId).filter(Boolean) as string[]
        const authorIds = blogs.map(blog => blog.authorId)

        const [media, authors, translations, carousels] = await Promise.all([
          // 批量获取媒体文件
          imageIds.length > 0 ? this.prisma.media.findMany({
            where: { id: { in: imageIds } },
            select: { id: true, url: true, alt: true, filename: true }
          }) : [],
          
          // 批量获取作者信息
          this.prisma.users.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, username: true }
          }),
          
          // 批量获取翻译
          this.prisma.blog_translations.findMany({
            where: { blogId: { in: blogIds } },
            select: {
              id: true,
              blogId: true,
              language: true,
              title: true,
              slug: true,
              content: true,
              author: true,
              program: true,
              grade: true,
            }
          }),
          
          // 批量获取轮播图
          this.prisma.blog_carousels.findMany({
            where: { blogId: { in: blogIds } },
            include: {
              media: {
                select: { id: true, url: true, alt: true, filename: true }
              }
            },
            orderBy: { order: 'asc' }
          })
        ])

        // 第三步：组装数据
        const mediaMap = new Map(media.map(m => [m.id, m]))
        const authorMap = new Map(authors.map(a => [a.id, a]))
        const translationsMap = new Map<string, any[]>()
        const carouselsMap = new Map<string, any[]>()

        // 组织翻译数据
        translations.forEach(t => {
          if (!translationsMap.has(t.blogId)) {
            translationsMap.set(t.blogId, [])
          }
          translationsMap.get(t.blogId)!.push(t)
        })

        // 组织轮播图数据
        carousels.forEach(c => {
          if (!carouselsMap.has(c.blogId)) {
            carouselsMap.set(c.blogId, [])
          }
          carouselsMap.get(c.blogId)!.push(c)
        })

        // 组装最终结果
        const optimizedBlogs = blogs.map(blog => ({
          ...blog,
          media: blog.imageId ? mediaMap.get(blog.imageId) || null : null,
          users: authorMap.get(blog.authorId) || null,
          blog_translations: translationsMap.get(blog.id) || [],
          blog_carousels: carouselsMap.get(blog.id) || [],
        }))

        const result = {
          blogs: optimizedBlogs,
          total,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          cacheInfo: {
            cacheKey,
            usedCache: false,
            pageRequested: page
          }
        }

        // 缓存结果
        if (useCache) {
          this.cache.set(cacheKey, result, 3 * 60 * 1000) // 3分钟缓存
        }

        return result
      },
      { warnThreshold: 150, errorThreshold: 500 }
    )
  }

  /**
   * 优化的项目查询 - 减少嵌套关联
   */
  async findOptimizedPrograms(options: {
    where?: any
    page?: number
    limit?: number
    language?: string
    type?: 'international' | 'china'
    useCache?: boolean
  }) {
    const {
      where = {},
      page = 1,
      limit = 10,
      language = 'zh',
      type = 'international',
      useCache = true
    } = options

    const cacheKey = this.generateCacheKey(`programs_${type}`, { where, page, limit, language })
    
    if (useCache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    return performanceMonitor.trackQuery(
      `${type}_programs.findMany.optimized`,
      async () => {
        const table = type === 'international' ? 'international_programs' : 'china_programs'
        const translationTable = type === 'international' ? 'international_program_translations' : 'china_program_translations'
        
        // 第一步：获取基础项目数据
        const [programs, total] = await Promise.all([
          this.prisma[table].findMany({
            where,
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              status: true,
              language: true,
              country: true,
              cityId: true,
              duration: true,
              deadline: true,
              featuredImage: true,
              type: true,
              gradeLevel: true,
              sessions: true,
              publishedAt: true,
              createdAt: true,
              updatedAt: true,
              authorId: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma[table].count({ where }),
        ])

        if (programs.length === 0) {
          const result = { programs: [], total, pagination: { page, limit, total, pages: 0 } }
          if (useCache) this.cache.set(cacheKey, result, 2 * 60 * 1000)
          return result
        }

        // 第二步：批量获取关联数据
        const programIds = programs.map(p => p.id)
        const cityIds = programs.map(p => p.cityId).filter(Boolean) as string[]
        const authorIds = programs.map(p => p.authorId)

        const [cities, authors, translations] = await Promise.all([
          // 批量获取城市和国家信息
          cityIds.length > 0 ? this.prisma.cities.findMany({
            where: { id: { in: cityIds } },
            include: {
              countries: {
                select: { name: true, nameEn: true }
              }
            },
            select: {
              id: true,
              name: true,
              nameEn: true,
              countries: true
            }
          }) : [],
          
          // 批量获取作者信息
          this.prisma.users.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, username: true }
          }),
          
          // 批量获取翻译
          this.prisma[translationTable].findMany({
            where: { 
              programId: { in: programIds },
              language: language
            }
          })
        ])

        // 第三步：组装数据
        const cityMap = new Map(cities.map(c => [c.id, c]))
        const authorMap = new Map(authors.map(a => [a.id, a]))
        const translationsMap = new Map(translations.map(t => [t.programId, t]))

        const optimizedPrograms = programs.map(program => ({
          ...program,
          cities: program.cityId ? cityMap.get(program.cityId) || null : null,
          users: authorMap.get(program.authorId) || null,
          [`${type}_program_translations`]: translationsMap.get(program.id) ? [translationsMap.get(program.id)] : [],
        }))

        const result = {
          programs: optimizedPrograms,
          total,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          cacheInfo: {
            cacheKey,
            usedCache: false,
            pageRequested: page
          }
        }

        if (useCache) {
          this.cache.set(cacheKey, result, 5 * 60 * 1000) // 5分钟缓存
        }

        return result
      },
      { warnThreshold: 200, errorThreshold: 800 }
    )
  }

  /**
   * 清除相关缓存
   */
  invalidateCache(patterns: string[]): void {
    patterns.forEach(pattern => {
      for (const key of this.cache['cache'].keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    })
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    const keys = Array.from(this.cache['cache'].keys())
    return {
      size: keys.length,
      keys: keys.slice(0, 10) // 只返回前10个键作为示例
    }
  }
}

// 导出单例实例
export const queryOptimizer = new QueryOptimizer(
  new (require('@prisma/client').PrismaClient)()
)
