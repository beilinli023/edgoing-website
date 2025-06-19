import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
// 🛡️ 暂时移除next-auth依赖，使用自定义认证
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取单个Hero页面
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const heroPage = await prisma.heroPage.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    if (!heroPage) {
      return NextResponse.json({ error: 'Hero page not found' }, { status: 404 })
    }

    return NextResponse.json(heroPage)
  } catch (error) {
    console.error('Error fetching hero page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 更新Hero页面
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      pageName,
      pageType,
      slides,
      titleZh,
      titleEn,
      subtitleZh,
      subtitleEn,
      imageUrl,
      isActive,
      order
    } = body

    // 验证必填字段
    if (!pageName || !pageType) {
      return NextResponse.json({ error: 'Page name and page type are required' }, { status: 400 })
    }

    // 检查页面是否存在
    const existingPage = await prisma.heroPage.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Hero page not found' }, { status: 404 })
    }

    // 检查页面名称是否与其他页面冲突
    if (pageName !== existingPage.pageName) {
      const nameConflict = await prisma.heroPage.findUnique({
        where: { pageName }
      })

      if (nameConflict) {
        return NextResponse.json({ error: 'Page name already exists' }, { status: 400 })
      }
    }

    // 验证数据格式
    if (pageType === 'PRIMARY' && !slides) {
      return NextResponse.json({ error: 'Slides are required for PRIMARY page type' }, { status: 400 })
    }

    if (pageType === 'SECONDARY' && (!titleZh && !titleEn)) {
      return NextResponse.json({ error: 'At least one title (Chinese or English) is required for SECONDARY page type' }, { status: 400 })
    }

    const updateData: any = {
      pageName,
      pageType,
      titleZh,
      titleEn,
      subtitleZh,
      subtitleEn,
      imageUrl,
      isActive: isActive ?? true,
      order: order ?? 0
    }

    if (pageType === 'PRIMARY' && slides) {
      updateData.slides = JSON.stringify(slides)
    } else if (pageType === 'SECONDARY') {
      updateData.slides = null
    }

    const heroPage = await prisma.heroPage.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(heroPage)
  } catch (error) {
    console.error('Error updating hero page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - 删除Hero页面
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查页面是否存在
    const existingPage = await prisma.hero_pages.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Hero page not found' }, { status: 404 })
    }

    await prisma.hero_pages.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Hero page deleted successfully' })
  } catch (error) {
    console.error('Error deleting hero page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
