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
    const limit = parseInt(searchParams.get('limit') || '10')
    const language = searchParams.get('language') || 'zh'
    const status = searchParams.get('status')

    const where: any = { language }
    if (status) {
      where.status = status
    }

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, username: true }
          },
          translations: true,
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.program.count({ where }),
    ])

    return NextResponse.json({
      programs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get programs error:', error)
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

    const data = await request.json()
    const {
      title,
      slug,
      description,
      content,
      country,
      city,
      duration,
      price,
      currency = 'CNY',
      maxStudents,
      minAge,
      maxAge,
      startDate,
      endDate,
      deadline,
      featuredImage,
      gallery,
      highlights,
      academics,
      itinerary,
      requirements,
      materials,
      status = 'DRAFT',
      language = 'zh',
      seoTitle,
      seoDescription,
    } = data

    // Check if slug is unique
    const existingProgram = await prisma.program.findUnique({
      where: { slug },
    })

    if (existingProgram) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    const program = await prisma.program.create({
      data: {
        title,
        slug,
        description,
        content,
        country,
        city,
        duration,
        price: price ? parseFloat(price) : null,
        currency,
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        minAge: minAge ? parseInt(minAge) : null,
        maxAge: maxAge ? parseInt(maxAge) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        featuredImage,
        gallery: gallery ? JSON.stringify(gallery) : null,
        highlights: highlights ? JSON.stringify(highlights) : null,
        academics: academics ? JSON.stringify(academics) : null,
        itinerary: itinerary ? JSON.stringify(itinerary) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        materials: materials ? JSON.stringify(materials) : null,
        status,
        language,
        seoTitle,
        seoDescription,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: authResult.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true }
        },
      },
    })

    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    console.error('Create program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
