import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

// GET - 获取所有合作伙伴Logo
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) {
      where.companyName = { contains: search, mode: 'insensitive' }
    }

    const [partnerLogos, total] = await Promise.all([
      prisma.partner_logos.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.partner_logos.count({ where }),
    ])

    return NextResponse.json({
      partnerLogos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get partner logos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - 创建新的合作伙伴Logo
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { companyName, logoUrl, websiteUrl, order, isActive } = body

    // 验证必填字段
    if (!companyName || !logoUrl) {
      return NextResponse.json(
        { error: '公司名称和Logo图片是必填字段' },
        { status: 400 }
      )
    }

    // 处理开发模式下的用户ID问题
    let uploadedBy = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      const existingAdmin = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      })
      
      if (existingAdmin) {
        uploadedBy = existingAdmin.id
      } else {
        throw new Error('No admin user found in database')
      }
    }

    // 🛡️ 生成安全的合作伙伴Logo ID
    const partnerLogoId = `partner_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    const partnerLogo = await prisma.partner_logos.create({
      data: {
        id: partnerLogoId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        companyName,
        logoUrl,
        websiteUrl: websiteUrl || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        uploadedBy,
        updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      partnerLogo,
    })
  } catch (error) {
    console.error('Create partner logo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
