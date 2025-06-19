import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

// PUT - 更新合作伙伴Logo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const resolvedParams = await params
    const body = await request.json()
    const { companyName, logoUrl, websiteUrl, order, isActive } = body

    // 验证必填字段
    if (!companyName || !logoUrl) {
      return NextResponse.json(
        { error: '公司名称和Logo图片是必填字段' },
        { status: 400 }
      )
    }

    // 检查Logo是否存在
    const existingLogo = await prisma.partner_logos.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existingLogo) {
      return NextResponse.json(
        { error: '合作伙伴Logo不存在' },
        { status: 404 }
      )
    }

    const partnerLogo = await prisma.partner_logos.update({
      where: { id: resolvedParams.id },
      data: {
        companyName,
        logoUrl,
        websiteUrl: websiteUrl || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
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
    console.error('Update partner logo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - 删除合作伙伴Logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const resolvedParams = await params

    // 检查Logo是否存在
    const existingLogo = await prisma.partner_logos.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existingLogo) {
      return NextResponse.json(
        { error: '合作伙伴Logo不存在' },
        { status: 404 }
      )
    }

    await prisma.partner_logos.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      success: true,
      message: '合作伙伴Logo已删除',
    })
  } catch (error) {
    console.error('Delete partner logo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
