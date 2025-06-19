import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const faq = await prisma.faqs.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        faq_translations: true,
      },
    })

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Fetch FAQ error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { question, answer, isActive, order, questionEn, answerEn } = body

    // 验证必填字段
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // 检查FAQ是否存在
    const existingFaq = await prisma.faqs.findUnique({
      where: { id: params.id },
      include: { faq_translations: true },
    })

    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    // 更新FAQ
    const faq = await prisma.faqs.update({
      where: { id: params.id },
      data: {
        question,
        answer,
        category: null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        updatedAt: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        faq_translations: true,
      },
    })

    // 处理英文翻译
    if (questionEn && answerEn) {
      const existingTranslation = existingFaq.faq_translations.find(t => t.language === 'en')

      if (existingTranslation) {
        // 更新现有翻译
        await prisma.faq_translations.update({
          where: { id: existingTranslation.id },
          data: {
            question: questionEn,
            answer: answerEn,
          },
        })
      } else {
        // 创建新翻译
        const translationId = `${params.id}_trans_en_${Date.now()}`
        await prisma.faq_translations.create({
          data: {
            id: translationId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
            faqId: params.id,
            language: 'en',
            question: questionEn,
            answer: answerEn,
          },
        })
      }
    } else {
      // 如果没有提供英文内容，删除现有的英文翻译
      const existingTranslation = existingFaq.faq_translations.find(t => t.language === 'en')
      if (existingTranslation) {
        await prisma.faq_translations.delete({
          where: { id: existingTranslation.id },
        })
      }
    }

    // 重新获取更新后的FAQ
    const updatedFaq = await prisma.faqs.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        faq_translations: true,
      },
    })

    return NextResponse.json(updatedFaq)
  } catch (error) {
    console.error('Update FAQ error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 检查FAQ是否存在
    const existingFaq = await prisma.faqs.findUnique({
      where: { id: params.id },
    })

    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    // 删除FAQ（翻译会自动级联删除）
    await prisma.faqs.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'FAQ deleted successfully' })
  } catch (error) {
    console.error('Delete FAQ error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
