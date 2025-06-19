import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'
    const limit = parseInt(searchParams.get('limit') || '0') // 0 means no limit

    // 获取已发布的学员故事，按order排序
    // 我们总是从中文主记录开始，然后根据需要的语言返回相应内容
    const queryOptions: any = {
      where: {
        status: 'PUBLISHED',
        language: 'zh', // 总是查询中文主记录
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
        testimonial_translations: true, // 获取所有翻译
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    }

    // 只有当limit大于0时才应用限制
    if (limit > 0) {
      queryOptions.take = limit
    }

    const testimonials = await prisma.testimonials.findMany(queryOptions)

    // 格式化数据以匹配前端期望的结构
    const formattedTestimonials = testimonials.map((testimonial) => {
      // 查找对应语言的翻译
      const translation = testimonial.testimonial_translations.find(t => t.language === language)

      if (language === 'en' && translation) {
        // 如果请求英文且有英文翻译，返回英文内容作为主内容，中文作为翻译
        return {
          id: testimonial.id,
          content: translation.content,
          author: translation.author,
          role: translation.role,
          program: translation.program,
          image: testimonial.media?.url || null,
          order: testimonial.order,
          translation: {
            content: testimonial.content,
            author: testimonial.author,
            role: testimonial.role,
            program: testimonial.program,
          },
        }
      } else {
        // 返回中文内容作为主内容，英文作为翻译（如果有的话）
        const englishTranslation = testimonial.testimonial_translations.find(t => t.language === 'en')
        return {
          id: testimonial.id,
          content: testimonial.content,
          author: testimonial.author,
          role: testimonial.role,
          program: testimonial.program,
          image: testimonial.media?.url || null,
          order: testimonial.order,
          translation: englishTranslation ? {
            content: englishTranslation.content,
            author: englishTranslation.author,
            role: englishTranslation.role,
            program: englishTranslation.program,
          } : null,
        }
      }
    })

    return NextResponse.json({
      testimonials: formattedTestimonials,
      total: formattedTestimonials.length,
    })
  } catch (error) {
    console.error('Get public testimonials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
