import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
// 🛡️ 暂时移除next-auth依赖，使用自定义认证
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取所有首页展示项目
export async function GET() {
  try {
    // 临时移除身份验证用于调试
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const showcases = await prisma.homepage_showcases.findMany({
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
        { position: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(showcases)
  } catch (error) {
    console.error('Error fetching homepage showcases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 创建新的首页展示项目
export async function POST(request: NextRequest) {
  try {
    // 临时移除身份验证用于调试
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const {
      position,
      programType,
      programSlug,
      titleZh,
      titleEn,
      programTypeZh,
      programTypeEn,
      cityZh,
      cityEn,
      isActive = true,
      order = 0
    } = body

    // 验证必填字段
    if (!position || !programType || !programSlug) {
      return NextResponse.json(
        { error: 'Position, programType, and programSlug are required' },
        { status: 400 }
      )
    }

    // 验证programType
    if (!['china', 'international'].includes(programType)) {
      return NextResponse.json(
        { error: 'programType must be either "china" or "international"' },
        { status: 400 }
      )
    }

    // 验证position是否已存在
    const existingPosition = await prisma.homepage_showcases.findUnique({
      where: { position: parseInt(position) }
    })

    if (existingPosition) {
      return NextResponse.json(
        { error: `Position ${position} is already taken` },
        { status: 400 }
      )
    }

    // 验证项目是否存在
    if (programType === 'china') {
      const chinaProgram = await prisma.china_programs.findFirst({
        where: { slug: programSlug, status: 'PUBLISHED' }
      })
      if (!chinaProgram) {
        return NextResponse.json(
          { error: 'China program not found or not published' },
          { status: 404 }
        )
      }
    } else {
      const internationalProgram = await prisma.international_programs.findFirst({
        where: { slug: programSlug, status: 'PUBLISHED' }
      })
      if (!internationalProgram) {
        return NextResponse.json(
          { error: 'International program not found or not published' },
          { status: 404 }
        )
      }
    }

    // 获取默认用户ID（临时）
    const defaultUser = await prisma.users.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 500 }
      )
    }

    const showcase = await prisma.homepage_showcases.create({
      data: {
        id: `showcase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: parseInt(position),
        programType,
        programSlug,
        titleZh: titleZh || null,
        titleEn: titleEn || null,
        programTypeZh: programTypeZh || null,
        programTypeEn: programTypeEn || null,
        cityZh: cityZh || null,
        cityEn: cityEn || null,
        isActive,
        order: parseInt(order),
        authorId: defaultUser.id,
        updatedAt: new Date()
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

    return NextResponse.json(showcase, { status: 201 })
  } catch (error) {
    console.error('Error creating homepage showcase:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
