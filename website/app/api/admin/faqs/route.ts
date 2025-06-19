import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [faqs, total] = await Promise.all([
      prisma.faqs.findMany({
        where,
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
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.faqs.count({ where }),
    ])

    return NextResponse.json({
      faqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Fetch FAQs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // 🛡️ 处理开发模式下的用户ID问题
    let authorId = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // 直接查找任何现有用户，优先选择管理员
      const existingUser = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      }) || await prisma.users.findFirst()

      if (existingUser) {
        authorId = existingUser.id
        console.log('🔧 DEBUG: Using existing user for FAQ:', existingUser.id, 'Role:', existingUser.role)
      } else {
        throw new Error('No users found in database. Please create a user first.')
      }
    }

    // 🛡️ 生成安全的FAQ ID
    const faqId = `faq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    const faq = await prisma.faqs.create({
      data: {
        id: faqId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        question,
        answer,
        category: null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        updatedAt: new Date(), // 🛡️ 添加必需的updatedAt字段
        authorId, // 🛡️ 使用安全的authorId
        faq_translations: questionEn && answerEn ? {
          create: {
            id: `${faqId}_trans_en_${Date.now()}`, // 🛡️ 手动提供翻译ID
            language: 'en',
            question: questionEn,
            answer: answerEn,
          }
        } : undefined,
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

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Create FAQ error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
