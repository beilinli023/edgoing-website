import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'
import { SafeApiOptimizer } from '@/lib/optimization/api-optimizer'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    const blog = await prisma.blogs.findUnique({
      where: { id },
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

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    // 为前端兼容性添加image字段映射
    const formattedBlog = {
      ...blog,
      image: blog.media,
      carouselImages: blog.blog_carousels,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const data = await request.json()
    const {
      title,
      slug: providedSlug,
      content,
      author,
      program,
      grade,
      status,
      imageId,
      carouselImageIds = [],
      order,
      translations = [],
    } = data

    // 自动生成并确保slug唯一性
    const baseSlug = generateSlug(title)
    const uniqueSlug = await ensureUniqueSlug(baseSlug, id)

    // 为翻译也生成唯一的slug
    const processedTranslations = await Promise.all(
      translations.map(async (t: any) => {
        const translationBaseSlug = generateSlug(t.title)
        const translationUniqueSlug = await ensureUniqueSlug(translationBaseSlug, id)
        return {
          ...t,
          slug: translationUniqueSlug
        }
      })
    )

    // 先删除所有轮播图关联
    await prisma.blog_carousels.deleteMany({
      where: { blogId: id },
    })

    // Update blog
    const blog = await prisma.blogs.update({
      where: { id },
      data: {
        title,
        slug: uniqueSlug,
        content,
        author,
        program,
        grade,
        status,
        imageId,
        order,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        blog_carousels: {
          create: carouselImageIds.map((imageId: string, index: number) => ({
            id: `${id}_carousel_${Date.now()}_${index}`, // 🛡️ 使用blogId生成关联的轮播图ID
            mediaId: imageId,
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



    // Update translations
    if (processedTranslations.length > 0) {
      // Delete existing translations
      await prisma.blog_translations.deleteMany({
        where: { blogId: id },
      })

      // Create new translations
      await prisma.blog_translations.createMany({
        data: processedTranslations.map((t: any, index: number) => ({
          id: `${id}_trans_${t.language}_${Date.now()}_${index}`, // 🛡️ 使用blogId生成关联的翻译ID
          blogId: id,
          language: t.language,
          title: t.title,
          slug: t.slug,
          content: t.content,
          author: t.author,
          program: t.program,
          grade: t.grade,
        })),
      })
    }

    // 🗑️ 清除相关缓存 - 确保前端能看到最新数据
    SafeApiOptimizer.invalidateRelatedCache('blog', id)
    console.log(`🗑️ 已清除博客 ${id} 的相关缓存`)

    // 为前端兼容性添加image字段映射
    const formattedBlog = {
      ...blog,
      image: blog.media,
      carouselImages: blog.blog_carousels,
    }

    return NextResponse.json({ blog: formattedBlog })
  } catch (error) {
    console.error('Update blog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    // Delete blog (translations will be deleted automatically due to cascade)
    await prisma.blogs.delete({
      where: { id },
    })

    // 🗑️ 清除相关缓存 - 确保前端能看到最新数据
    SafeApiOptimizer.invalidateRelatedCache('blog', id)
    console.log(`🗑️ 已清除已删除博客 ${id} 的相关缓存`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete blog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
