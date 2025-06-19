import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { performanceMonitor } from '@/lib/monitoring/performance-monitor'
import { SafeApiOptimizer } from '@/lib/optimization/api-optimizer'
import { getPaginationParams, getLanguageParam, getStatusParam, buildErrorResponse } from '@/lib/api-utils'
import fs from 'fs'
import path from 'path'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'

// 生成URL slug的辅助函数
function generateSlug(title: string): string {
  if (!title || title.trim() === '') {
    return `blog-${Date.now()}`
  }

  let slug = title
    .toLowerCase()
    .replace(/[\u4e00-\u9fff]/g, '') // 移除中文字符
    .replace(/[^\w\s-]/g, '') // 移除其他特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符替换为单个
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
    .trim()

  // 如果处理后的slug为空或太短，使用时间戳
  if (!slug || slug.length < 2) {
    const timestamp = Date.now()
    return `blog-${timestamp}`
  }

  return slug
}

// 确保slug存在的辅助函数
function ensureSlug(title: string, existingSlug?: string): string {
  if (existingSlug && existingSlug.trim() !== '') {
    return existingSlug
  }
  return generateSlug(title)
}

// 验证图片文件是否存在的辅助函数
function validateImageUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    console.log('🔍 validateImageUrl: URL为空或无效:', url)
    return false
  }

  try {
    // 从URL中提取文件路径
    const urlPath = url.replace('/uploads/', '')
    const filePath = path.join(process.cwd(), 'public', 'uploads', urlPath)
    const exists = fs.existsSync(filePath)

    console.log('🔍 validateImageUrl:', {
      url,
      urlPath,
      filePath,
      exists,
      cwd: process.cwd()
    })

    return exists
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

  // 在开发环境中验证文件是否存在
  if (process.env.NODE_ENV === 'development' && !validateImageUrl(media.url)) {
    console.warn('🖼️ Invalid image detected:', media.url, 'File does not exist')
    return null
  }

  return media
}

export async function GET(request: NextRequest) {
  // 🚀 尝试使用优化查询，如果失败则安全降级到原始查询
  return SafeApiOptimizer.optimizedBlogsHandler(request, async () => {
    // 原始查询逻辑（作为降级方案）
    try {
      // 🛡️ 使用安全的参数获取方法，避免静态生成时的动态服务器使用
      const { page, limit, skip } = getPaginationParams(request)
      const language = getLanguageParam(request)
      const status = getStatusParam(request)

      // 只查询已发布的博客
      const where: any = {
        language: 'zh', // 总是查询中文主记录
        status: 'PUBLISHED'
      }

      // 🔍 安全地监控数据库查询性能
      const [blogs, total] = await performanceMonitor.trackQuery(
        'blogs.findMany.withTranslations.fallback',
        () => Promise.all([
          prisma.blogs.findMany({
            where,
            include: {
              media: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  filename: true,
                },
              },
              blog_carousels: {
                include: {
                  media: {
                    select: {
                      id: true,
                      url: true,
                      alt: true,
                      filename: true,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
              },
              users: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
              blog_translations: true,
            },
            orderBy: [
              { order: 'asc' },
              { publishedAt: 'desc' },
              { createdAt: 'desc' },
            ],
            skip: skip,
            take: limit,
          }),
          prisma.blogs.count({ where }),
        ]),
        {
          warnThreshold: 200, // 200ms警告阈值
          errorThreshold: 1000 // 1000ms错误阈值
        }
      )

    // 根据请求的语言格式化数据
    const formattedBlogs = blogs.map(blog => {
      const translation = blog.blog_translations.find((t: any) => t.language === language)

      // 🛡️ 过滤有效的图片
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
          slug: ensureSlug(translation.title, translation.slug),
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
          // 返回中文内容，确保slug存在
          const zhTranslation = blog.blog_translations.find((t: any) => t.language === 'zh')
          return {
            ...blog,
            slug: ensureSlug(blog.title, zhTranslation?.slug || blog.slug),
            blog_translations: blog.blog_translations,
            image: validMainImage, // 🛡️ 使用验证过的图片
            carouselImages: validCarouselImages, // 🛡️ 使用验证过的轮播图
          }
        }
    })

      return NextResponse.json({
        blogs: formattedBlogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      const errorResponse = buildErrorResponse(error, 'Blogs API (fallback)')
      return NextResponse.json(errorResponse, { status: 500 })
    }
  })
}
