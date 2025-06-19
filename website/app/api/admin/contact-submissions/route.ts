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

    const [contactSubmissions, total, gradeLevels, countries, programTypes, provinces] = await Promise.all([
      prisma.contact_submissions.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact_submissions.count({ where }),
      prisma.grade_levels.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.countries.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.program_types.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.china_provinces.findMany({
        include: {
          china_cities: {
            select: { id: true, nameZh: true, nameEn: true }
          }
        }
      })
    ])

    // Create lookup maps for efficient ID to name conversion
    const gradeLevelMap = new Map(gradeLevels.map(g => [g.id, g]))
    const countryMap = new Map(countries.map(c => [c.id, c]))
    const programTypeMap = new Map(programTypes.map(p => [p.id, p]))
    const provinceMap = new Map(provinces.map(p => [p.id, p]))
    const cityMap = new Map()
    provinces.forEach(province => {
      province.china_cities.forEach(city => {
        cityMap.set(city.id, { ...city, province: province.nameZh })
      })
    })

    // Parse JSON fields and convert IDs to readable names
    const processedSubmissions = contactSubmissions.map(submission => {
      const destinations = submission.destinations ? JSON.parse(submission.destinations) : []
      const learningInterests = submission.learningInterests ? JSON.parse(submission.learningInterests) : []

      return {
        ...submission,
        grade: submission.grade ? gradeLevelMap.get(submission.grade)?.name || submission.grade : null,
        province: submission.province ? provinceMap.get(submission.province)?.nameZh || submission.province : null,
        city: submission.city ? cityMap.get(submission.city)?.nameZh || submission.city : null,
        destinations: destinations.map((id: string) => countryMap.get(id)?.name || id),
        learningInterests: learningInterests.map((id: string) => programTypeMap.get(id)?.name || id),
      }
    })

    return NextResponse.json({
      contactSubmissions: processedSubmissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get contact submissions error:', error)
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

    const [contactSubmission, gradeLevels, countries, programTypes, provinces] = await Promise.all([
      prisma.contact_submissions.update({
        where: { id },
        data: {
          status,
          notes,
          updatedAt: new Date(),
        },
      }),
      prisma.grade_levels.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.countries.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.program_types.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.china_provinces.findMany({
        include: {
          china_cities: {
            select: { id: true, nameZh: true, nameEn: true }
          }
        }
      })
    ])

    // Create lookup maps for efficient ID to name conversion
    const gradeLevelMap = new Map(gradeLevels.map(g => [g.id, g]))
    const countryMap = new Map(countries.map(c => [c.id, c]))
    const programTypeMap = new Map(programTypes.map(p => [p.id, p]))
    const provinceMap = new Map(provinces.map(p => [p.id, p]))
    const cityMap = new Map()
    provinces.forEach(province => {
      province.china_cities.forEach(city => {
        cityMap.set(city.id, { ...city, province: province.nameZh })
      })
    })

    // Parse JSON fields and convert IDs to readable names
    const destinations = contactSubmission.destinations ? JSON.parse(contactSubmission.destinations) : []
    const learningInterests = contactSubmission.learningInterests ? JSON.parse(contactSubmission.learningInterests) : []

    const processedSubmission = {
      ...contactSubmission,
      grade: contactSubmission.grade ? gradeLevelMap.get(contactSubmission.grade)?.name || contactSubmission.grade : null,
      province: contactSubmission.province ? provinceMap.get(contactSubmission.province)?.nameZh || contactSubmission.province : null,
      city: contactSubmission.city ? cityMap.get(contactSubmission.city)?.nameZh || contactSubmission.city : null,
      destinations: destinations.map((id: string) => countryMap.get(id)?.name || id),
      learningInterests: learningInterests.map((id: string) => programTypeMap.get(id)?.name || id),
    }

    return NextResponse.json(processedSubmission)
  } catch (error) {
    console.error('Update contact submission error:', error)
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
        { error: 'No IDs provided' },
        { status: 400 }
      )
    }

    const deletedSubmissions = await prisma.contact_submissions.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      message: 'Contact submissions deleted successfully',
      deletedCount: deletedSubmissions.count,
    })
  } catch (error) {
    console.error('Delete contact submissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
