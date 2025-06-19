import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'

    // 首先尝试通过主记录的slug查找
    let blog = await prisma.blogs.findFirst({
      where: {
        slug: slug,
        status: 'PUBLISHED',
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
        users: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        blog_translations: true,
      },
    })

    // 如果没找到，尝试通过翻译记录的slug查找
    if (!blog) {
      const translation = await prisma.blog_translations.findFirst({
        where: {
          slug: slug,
        },
        include: {
          blogs: {
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
          },
        },
      })

      if (translation && translation.blogs.status === 'PUBLISHED') {
        blog = translation.blogs
      }
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    // 根据请求的语言格式化数据
    const translation = blog.blog_translations.find((t: any) => t.language === language)

    let formattedBlog
    if (language === 'en' && translation) {
      // 如果请求英文且有英文翻译，返回英文内容作为主内容
      formattedBlog = {
        ...blog,
        title: translation.title,
        slug: ensureSlug(translation.title, translation.slug),
        content: translation.content,
        author: translation.author,
        program: translation.program,
        grade: translation.grade,
        language: 'en', // 标记为英文
        blog_translations: blog.blog_translations,
        image: blog.media, // 为前端兼容性添加image字段
        carouselImages: blog.blog_carousels, // 统一命名
      }
    } else {
      // 返回中文内容，确保slug存在
      const zhTranslation = blog.blog_translations.find((t: any) => t.language === 'zh')
      formattedBlog = {
        ...blog,
        slug: ensureSlug(blog.title, zhTranslation?.slug || blog.slug),
        blog_translations: blog.blog_translations,
        image: blog.media, // 为前端兼容性添加image字段
        carouselImages: blog.blog_carousels, // 统一命名
      }
    }

    return NextResponse.json({ blog: formattedBlog })
  } catch (error) {
    console.error('Fetch blog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
