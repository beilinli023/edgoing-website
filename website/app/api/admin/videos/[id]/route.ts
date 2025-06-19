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

    const video = await prisma.videos.findUnique({
      where: { id: params.id },
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

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Get video error:', error)
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
      isPublished,
      order
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

    // 检查视频是否存在
    const existingVideo = await prisma.videos.findUnique({
      where: { id: params.id },
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // 如果标题改变，需要更新slug
    let slug = existingVideo.slug
    if (titleEn !== existingVideo.titleEn) {
      const baseSlug = titleEn.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      slug = baseSlug
      let counter = 1
      while (await prisma.videos.findFirst({ 
        where: { 
          slug,
          id: { not: params.id }
        } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    const video = await prisma.videos.update({
      where: { id: params.id },
      data: {
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
    console.error('Update video error:', error)
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

    // 检查视频是否存在
    const video = await prisma.videos.findUnique({
      where: { id: params.id },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // 删除视频
    await prisma.videos.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
