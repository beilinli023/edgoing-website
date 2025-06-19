import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
// 🛡️ 暂时移除next-auth依赖，使用自定义认证
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
import { validateSession } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取所有Hero页面
export async function GET() {
  try {
    // 临时移除身份验证用于调试
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const heroPages = await prisma.hero_pages.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: [
        { pageType: 'asc' }, // PRIMARY first, then SECONDARY
        { order: 'asc' },
        { pageName: 'asc' }
      ]
    })

    return NextResponse.json(heroPages)
  } catch (error) {
    console.error('Error fetching hero pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 创建新的Hero页面
export async function POST(request: NextRequest) {
  try {
    // 🛡️ 安全的认证检查
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(authToken)
    if (!user) {
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

    // 检查页面名称是否已存在
    const existingPage = await prisma.hero_pages.findUnique({
      where: { pageName }
    })

    if (existingPage) {
      return NextResponse.json({ error: 'Page name already exists' }, { status: 400 })
    }

    // 验证数据格式
    if (pageType === 'PRIMARY' && !slides) {
      return NextResponse.json({ error: 'Slides are required for PRIMARY page type' }, { status: 400 })
    }

    if (pageType === 'SECONDARY' && (!titleZh && !titleEn)) {
      return NextResponse.json({ error: 'At least one title (Chinese or English) is required for SECONDARY page type' }, { status: 400 })
    }

    // 🛡️ 处理开发模式下的用户ID问题
    let authorId = user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // 直接查找任何现有用户，优先选择管理员
      const existingUser = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      }) || await prisma.users.findFirst()

      if (existingUser) {
        authorId = existingUser.id
        console.log('🔧 DEBUG: Using existing user for hero page:', existingUser.id, 'Role:', existingUser.role)
      } else {
        throw new Error('No users found in database. Please create a user first.')
      }
    }

    // 🛡️ 生成安全的英雄页面ID
    const heroPageId = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    const heroPage = await prisma.hero_pages.create({
      data: {
        id: heroPageId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        pageName,
        pageType,
        slides: slides ? JSON.stringify(slides) : null,
        titleZh,
        titleEn,
        subtitleZh,
        subtitleEn,
        imageUrl,
        isActive: isActive ?? true,
        order: order ?? 0,
        authorId, // 🛡️ 使用安全的authorId
        updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(heroPage, { status: 201 })
  } catch (error) {
    console.error('Error creating hero page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 批量更新Hero页面
export async function PUT(request: NextRequest) {
  try {
    // 临时移除身份验证用于调试
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { heroPages } = body

    if (!Array.isArray(heroPages)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // 批量更新
    const updatePromises = heroPages.map(page => {
      const updateData: any = {
        pageType: page.pageType,
        titleZh: page.titleZh,
        titleEn: page.titleEn,
        subtitleZh: page.subtitleZh,
        subtitleEn: page.subtitleEn,
        imageUrl: page.imageUrl,
        isActive: page.isActive,
        order: page.order
      }

      if (page.slides) {
        updateData.slides = JSON.stringify(page.slides)
      }

      return prisma.hero_pages.update({
        where: { id: page.id },
        data: updateData
      })
    })

    await Promise.all(updatePromises)

    // 返回更新后的数据
    const updatedHeroPages = await prisma.hero_pages.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: [
        { pageType: 'asc' },
        { order: 'asc' },
        { pageName: 'asc' }
      ]
    })

    return NextResponse.json(updatedHeroPages)
  } catch (error) {
    console.error('Error updating hero pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
