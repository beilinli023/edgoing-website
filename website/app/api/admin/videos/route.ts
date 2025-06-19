import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


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
    const language = searchParams.get('language') || 'zh'

    const where: any = {}
    if (search) {
      if (language === 'zh') {
        where.OR = [
          { titleZh: { contains: search, mode: 'insensitive' } },
          { categoryZh: { contains: search, mode: 'insensitive' } },
          { descriptionZh: { contains: search, mode: 'insensitive' } },
        ]
      } else {
        where.OR = [
          { titleEn: { contains: search, mode: 'insensitive' } },
          { categoryEn: { contains: search, mode: 'insensitive' } },
          { descriptionEn: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    const [videos, total] = await Promise.all([
      prisma.videos.findMany({
        where,
        include: {
          media: true,
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
      prisma.videos.count({ where }),
    ])

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get videos error:', error)
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
    const {
      categoryZh,
      categoryEn,
      titleZh,
      titleEn,
      descriptionZh,
      descriptionEn,
      thumbnailId,
      videoFile,
      videoUrl,
      isPublished = false,
      order = 0
    } = body

    // 验证必填字段
    if (!categoryZh || !categoryEn || !titleZh || !titleEn || !descriptionZh || !descriptionEn) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证视频源（文件或链接至少有一个）
    if (!videoFile && !videoUrl) {
      return NextResponse.json(
        { error: 'Either video file or video URL is required' },
        { status: 400 }
      )
    }

    // 生成slug
    const baseSlug = titleEn.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1
    while (await prisma.videos.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Handle development mode where mock user might not exist in database
    let uploadedBy = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // In development mode, use the existing admin user
      const existingAdmin = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      })

      if (existingAdmin) {
        uploadedBy = existingAdmin.id
      } else {
        throw new Error('No admin user found in database')
      }
    }

    // 🛡️ 生成安全的视频ID
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    const video = await prisma.videos.create({
      data: {
        id: videoId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        slug,
        categoryZh,
        categoryEn,
        titleZh,
        titleEn,
        descriptionZh,
        descriptionEn,
        thumbnailId,
        videoFile,
        videoUrl,
        isPublished,
        order,
        uploadedBy,
        updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
      },
      include: {
        media: true,
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
      video,
    })
  } catch (error) {
    console.error('Create video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
