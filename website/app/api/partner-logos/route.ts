import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


// GET - 获取启用的合作伙伴Logo（用于前端显示）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const partnerLogos = await prisma.partner_logos.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        websiteUrl: true,
        order: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    })

    return NextResponse.json({
      success: true,
      partnerLogos,
    })
  } catch (error) {
    console.error('Get partner logos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
