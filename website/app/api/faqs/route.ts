import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'
    const search = searchParams.get('search') || ''

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ]
    }

    const faqs = await prisma.faqs.findMany({
      where,
      include: {
        faq_translations: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // 根据语言格式化数据
    const formattedFaqs = faqs.map(faq => {
      const translation = faq.faq_translations.find((t: any) => t.language === language)

      if (language === 'en' && translation) {
        // 如果请求英文且有英文翻译，返回英文内容
        return {
          id: faq.id,
          question: translation.question,
          answer: translation.answer,
          order: faq.order,
          createdAt: faq.createdAt,
          updatedAt: faq.updatedAt,
        }
      } else {
        // 返回中文内容
        return {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          createdAt: faq.createdAt,
          updatedAt: faq.updatedAt,
        }
      }
    })

    return NextResponse.json({ faqs: formattedFaqs })
  } catch (error) {
    console.error('Fetch FAQs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
