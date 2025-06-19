import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [applications, total] = await Promise.all([
      prisma.applications.findMany({
        where,
        include: {
          programs: {
            select: {
              id: true,
              title: true,
              slug: true,
              country: true,
              city: true,
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.applications.count({ where }),
    ])

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const data = await request.json()
    const { id, status, notes } = data

    const application = await prisma.applications.update({
      where: { id },
      data: {
        status,
        notes,
        updatedAt: new Date(),
      },
      include: {
        programs: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const data = await request.json()
    const { ids } = data

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs are required' },
        { status: 400 }
      )
    }

    // 删除选中的申请
    const deletedCount = await prisma.applications.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return NextResponse.json({
      message: `Successfully deleted ${deletedCount.count} application(s)`,
      deletedCount: deletedCount.count
    })
  } catch (error) {
    console.error('Delete applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
