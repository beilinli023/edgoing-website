import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'
import { SafeApiOptimizer } from '@/lib/optimization/api-optimizer'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const language = searchParams.get('language') || 'zh'
    const status = searchParams.get('status')

    // 修改查询逻辑：总是查询中文主记录，然后根据语言返回相应内容
    const where: any = { language: 'zh' } // 总是查询中文主记录
    if (status) {
      where.status = status
    }

    const [blogs, total] = await Promise.all([
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
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogs.count({ where }),
    ])

    // 根据请求的语言格式化数据
    const formattedBlogs = blogs.map(blog => {
      const translation = blog.blog_translations.find(t => t.language === language)

      if (language === 'en' && translation) {
        // 如果请求英文且有英文翻译，返回英文内容作为主内容
        return {
          ...blog,
          title: translation.title,
          slug: translation.slug,
          excerpt: translation.excerpt,
          content: translation.content,
          language: 'en', // 标记为英文
          translations: blog.blog_translations,
          image: blog.media, // 为前端兼容性添加image字段
          carouselImages: blog.blog_carousels, // 统一命名
        }
      } else {
        // 返回中文内容
        return {
          ...blog,
          translations: blog.blog_translations,
          image: blog.media, // 为前端兼容性添加image字段
          carouselImages: blog.blog_carousels, // 统一命名
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
    console.error('Fetch blogs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    // 尝试从标题中提取一些有意义的信息
    const titleHash = title.replace(/\s+/g, '').substring(0, 3)
    return `blog-${timestamp}`
  }

  return slug
}

// 确保slug唯一性的辅助函数
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.blogs.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    })

    if (!existing) {
      // 同时检查翻译表中的slug
      const existingTranslation = await prisma.blog_translations.findFirst({
        where: {
          slug,
          ...(excludeId && { blogId: { not: excludeId } })
        }
      })

      if (!existingTranslation) {
        return slug
      }
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const data = await request.json()
    const {
      title,
      slug: providedSlug,
      content,
      author,
      program,
      grade,
      status = 'PUBLISHED',
      language = 'zh',
      imageId,
      carouselImageIds = [],
      order = 0,
      translations = [],
    } = data

    // Validate required fields - at least one language should have content
    const hasMainContent = title && content && author && program && grade
    const hasTranslationContent = translations.some((t: any) =>
      t.title && t.content && t.author && t.program && t.grade
    )

    if (!hasMainContent && !hasTranslationContent) {
      return NextResponse.json(
        { error: 'At least one language must have complete content (title, content, author, program, grade)' },
        { status: 400 }
      )
    }

    // 自动生成并确保slug唯一性
    const baseSlug = generateSlug(title)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    // 为翻译也生成唯一的slug
    const processedTranslations = await Promise.all(
      translations.map(async (t: any) => {
        const translationBaseSlug = generateSlug(t.title)
        const translationUniqueSlug = await ensureUniqueSlug(translationBaseSlug)
        return {
          ...t,
          slug: translationUniqueSlug
        }
      })
    )

    // 🛡️ 处理开发模式下的用户ID问题
    let authorId = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // 直接查找任何现有用户，优先选择管理员
      const existingUser = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      }) || await prisma.users.findFirst()

      if (existingUser) {
        authorId = existingUser.id
        console.log('🔧 DEBUG: Using existing user for blog:', existingUser.id, 'Role:', existingUser.role)
      } else {
        throw new Error('No users found in database. Please create a user first.')
      }
    }

    // 🛡️ 生成安全的博客ID
    const blogId = `blog_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Create blog
    const blog = await prisma.blogs.create({
      data: {
        id: blogId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        title,
        slug: uniqueSlug,
        content,
        author,
        program,
        grade,
        status,
        language,
        imageId,
        order,
        authorId, // 🛡️ 使用安全的authorId
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
        blog_translations: {
          create: processedTranslations.map((t: any, index: number) => ({
            id: `${blogId}_trans_${t.language}_${Date.now()}_${index}`, // 🛡️ 使用blogId生成关联的翻译ID
            language: t.language,
            title: t.title,
            slug: t.slug,
            content: t.content,
            author: t.author,
            program: t.program,
            grade: t.grade,
          })),
        },
        blog_carousels: {
          create: carouselImageIds.map((id: string, index: number) => ({
            id: `${blogId}_carousel_${Date.now()}_${index}`, // 🛡️ 使用blogId生成关联的轮播图ID
            mediaId: id,
            order: index,
          })),
        },
      },
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
        blog_translations: true,
      },
    })

    // 🗑️ 清除相关缓存 - 确保前端能看到最新数据
    SafeApiOptimizer.invalidateRelatedCache('blog', blog.id)
    console.log(`🗑️ 已清除新创建博客 ${blog.id} 的相关缓存`)

    // 为前端兼容性添加image字段映射
    const formattedBlog = {
      ...blog,
      image: blog.media,
      carouselImages: blog.blog_carousels,
    }

    return NextResponse.json({ blog: formattedBlog })
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
