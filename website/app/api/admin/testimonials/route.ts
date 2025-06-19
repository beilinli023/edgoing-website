import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'
import { SafeErrorHandler, withSafeErrorHandling } from '@/lib/safe-error-handler'
import { SafeFileHandler } from '@/lib/safe-file-handler'

export async function GET(request: NextRequest) {
  return withSafeErrorHandling(async () => {
    // 🛡️ 安全的认证检查
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const language = searchParams.get('language') || 'zh'
    const status = searchParams.get('status')

    console.log('Fetching testimonials with params:', { page, limit, language, status })

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Test basic database connection first
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection successful')

    const [testimonials, total] = await Promise.all([
      prisma.testimonials.findMany({
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
          users: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          testimonial_translations: {
            select: {
              id: true,
              language: true,
              content: true,
              author: true,
              role: true,
              program: true,
            },
          },
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testimonials.count({ where }),
    ])

    console.log(`Found ${testimonials.length} testimonials, total: ${total}`)

    // 🛡️ 安全地处理文件URL和格式化数据
    const formattedTestimonials = testimonials.map(testimonial => {
      const translation = testimonial.testimonial_translations?.find(t => t.language === language)

      let processedTestimonial = {
        ...testimonial,
        translations: testimonial.testimonial_translations,
      }

      // 应用翻译内容
      if (language === 'en' && translation) {
        processedTestimonial = {
          ...processedTestimonial,
          content: translation.content,
          author: translation.author,
          role: translation.role,
          program: translation.program,
          language: 'en',
        }
      }

      // 安全地处理媒体文件URL
      if (processedTestimonial.media?.url) {
        processedTestimonial.media.url = SafeFileHandler.getSafeFileUrl(processedTestimonial.media.url)
      }

      return processedTestimonial
    })

    return NextResponse.json({
      testimonials: formattedTestimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  }, 'Testimonials GET', {
    customMessage: 'Failed to fetch testimonials'
  })()
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const data = await request.json()
    const {
      content,
      author,
      role,
      program,
      status = 'PUBLISHED',
      language = 'zh',
      imageId,
      order = 0,
      translations = [],
    } = data

    // Validate required fields - at least one language should have content
    const hasMainContent = content && author && role && program
    const hasTranslationContent = translations.some((t: any) =>
      t.content && t.author && t.role && t.program
    )

    if (!hasMainContent && !hasTranslationContent) {
      return NextResponse.json(
        { error: 'At least one language must have complete content (content, author, role, and program)' },
        { status: 400 }
      )
    }

    // 🛡️ 生成安全的唯一ID和时间戳
    const testimonialId = `testimonial_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const now = new Date()

    console.log('🔧 DEBUG: Creating testimonial with data:', {
      id: testimonialId,
      hasUpdatedAt: true,
      timestamp: now.toISOString()
    })

    // 🛡️ 处理开发模式下的用户ID问题
    let authorId = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // 直接查找任何现有用户，优先选择管理员
      const existingUser = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      }) || await prisma.users.findFirst()

      if (existingUser) {
        authorId = existingUser.id
        console.log('🔧 DEBUG: Using existing user:', existingUser.id, 'Role:', existingUser.role)
      } else {
        throw new Error('No users found in database. Please create a user first.')
      }
    }

    // 🔧 DEBUG: 验证外键关系
    console.log('🔧 DEBUG: Final authorId:', authorId)
    if (imageId) {
      const mediaExists = await prisma.media.findUnique({ where: { id: imageId } })
      console.log('🔧 DEBUG: Media exists:', !!mediaExists, 'for imageId:', imageId)
    }
    const userExists = await prisma.users.findUnique({ where: { id: authorId } })
    console.log('🔧 DEBUG: User exists:', !!userExists, 'for authorId:', authorId)

    // Create testimonial
    const testimonial = await prisma.testimonials.create({
      data: {
        id: testimonialId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        content,
        author,
        role,
        program,
        status,
        language,
        imageId,
        order,
        authorId, // 🛡️ 使用安全的authorId
        publishedAt: status === 'PUBLISHED' ? now : null,
        createdAt: now, // 🛡️ 手动提供createdAt
        updatedAt: now, // 🛡️ 手动提供updatedAt，因为模型没有@updatedAt装饰器
        testimonial_translations: {
          create: translations.map((t: any, index: number) => ({
            id: `${testimonialId}_trans_${t.language}_${index}`, // 🛡️ 使用testimonialId确保唯一性
            language: t.language,
            content: t.content,
            author: t.author,
            role: t.role,
            program: t.program,
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
        testimonial_translations: true,
      },
    })

    return NextResponse.json({ testimonial })
  } catch (error: any) {
    console.error('Create testimonial error:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error?.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
