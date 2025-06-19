import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const language = searchParams.get('language') || 'zh'

    const [videos, total] = await Promise.all([
      prisma.videos.findMany({
        where: {
          isPublished: true,
        },
        include: {
          media: true,
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.videos.count({ 
        where: { isPublished: true } 
      }),
    ])

    // 根据语言返回相应的字段
    const formattedVideos = videos.map(video => ({
      id: video.id,
      slug: video.slug,
      title: language === 'zh' ? video.titleZh : video.titleEn,
      description: language === 'zh' ? video.descriptionZh : video.descriptionEn,
      category: language === 'zh' ? video.categoryZh : video.categoryEn,
      thumbnail: video.media?.url || null,
      videoUrl: video.videoUrl || video.videoFile,
      order: video.order,
      createdAt: video.createdAt,
    }))

    return NextResponse.json({
      videos: formattedVideos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get public videos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
