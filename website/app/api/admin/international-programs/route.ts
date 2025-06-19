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
    const country = searchParams.get('country')
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const gradeLevel = searchParams.get('gradeLevel')
    const status = searchParams.get('status')

    const where: any = {}

    // Build where conditions
    if (status) {
      where.status = status
    }

    if (country) {
      where.country = country
    }

    if (city) {
      where.cities = {
        name: city
      }
    }

    if (type) {
      where.type = {
        contains: type
      }
    }

    if (gradeLevel) {
      where.gradeLevel = {
        contains: gradeLevel
      }
    }

    // Get programs with translations
    const [programs, total] = await Promise.all([
      prisma.international_programs.findMany({
        where,
        include: {
          users: {
            select: {
              name: true,
              username: true,
            }
          },
          cities: {
            include: {
              countries: true
            }
          },
          international_program_translations: {
            where: {
              language
            }
          },
          _count: {
            select: {
              international_applications: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.international_programs.count({ where }),
    ])

    // Format response with translations
    const formattedPrograms = programs.map(program => {
      const translation = program.international_program_translations[0]
      return {
        id: program.id,
        title: translation?.title || program.title,
        slug: program.slug,
        description: translation?.description || program.description,
        duration: translation?.duration || program.duration,
        status: program.status,
        language: program.language,
        country: program.cities?.countries?.name || program.country,
        city: program.cities?.name,
        cityId: program.cityId,
        deadline: program.deadline,
        featuredImage: program.featuredImage,
        gallery: program.gallery ? JSON.parse(program.gallery) : [],
        highlights: translation?.highlights ? JSON.parse(translation.highlights) : (program.highlights ? JSON.parse(program.highlights) : []),
        academics: translation?.academics ? JSON.parse(translation.academics) : (program.academics ? JSON.parse(program.academics) : []),
        itinerary: translation?.itinerary ? JSON.parse(translation.itinerary) : (program.itinerary ? JSON.parse(program.itinerary) : []),
        requirements: translation?.requirements ? JSON.parse(translation.requirements) : (program.requirements ? JSON.parse(program.requirements) : []),
        type: program.type ? JSON.parse(program.type) : [],
        gradeLevel: program.gradeLevel ? JSON.parse(program.gradeLevel) : [],
        sessions: translation?.sessions ? JSON.parse(translation.sessions) : (program.sessions ? JSON.parse(program.sessions) : []),
        publishedAt: program.publishedAt,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        author: program.users,
        _count: {
          applications: program._count.international_applications
        },
      }
    })

    return NextResponse.json({
      programs: formattedPrograms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get international programs error:', error)
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
      title,
      slug,
      description,
      duration,
      status = 'DRAFT',
      language = 'zh',
      country,
      cityId,
      deadline,
      featuredImage,
      gallery = [],
      highlights = [],
      academics = [],
      itinerary = [],
      requirements = [],
      type = [],
      gradeLevel = [],
      sessions = [],
      translations = {}
    } = body

    // 🛡️ 处理开发模式下的用户ID问题
    let authorId = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // 直接查找任何现有用户，优先选择管理员
      const existingUser = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      }) || await prisma.users.findFirst()

      if (existingUser) {
        authorId = existingUser.id
        console.log('🔧 DEBUG: Using existing user for international program:', existingUser.id, 'Role:', existingUser.role)
      } else {
        throw new Error('No users found in database. Please create a user first.')
      }
    }

    // Generate unique ID and current timestamp
    const programId = `intl_prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    // Create the program (including required fields)
    const program = await prisma.international_programs.create({
      data: {
        id: programId,
        title,
        slug,
        description,
        duration,
        status,
        language,
        country,
        cityId,
        deadline: deadline ? new Date(deadline) : null,
        featuredImage,
        gallery: JSON.stringify(gallery),
        highlights: JSON.stringify(highlights),
        academics: JSON.stringify(academics),
        itinerary: JSON.stringify(itinerary),
        requirements: JSON.stringify(requirements),
        sessions: JSON.stringify(sessions),
        type: JSON.stringify(type),
        gradeLevel: JSON.stringify(gradeLevel),
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId, // 🛡️ 使用安全的authorId
        updatedAt: now,
      },
      include: {
        cities: {
          include: {
            countries: true
          }
        },
        users: {
          select: {
            name: true,
            username: true,
          }
        }
      }
    })

    // Create translation for the current language
    const translationId = `intl_trans_${program.id}_${language}_${Date.now()}`
    await prisma.international_program_translations.create({
      data: {
        id: translationId,
        programId: program.id,
        language: language,
        title,
        description,
        duration,
        highlights: JSON.stringify(highlights),
        academics: JSON.stringify(academics),
        itinerary: JSON.stringify(itinerary),
        requirements: JSON.stringify(requirements),
        sessions: JSON.stringify(sessions),
        materials: JSON.stringify([]),
      }
    })

    // Create additional translations if provided
    if (Object.keys(translations).length > 0) {
      const translationEntries = Object.entries(translations)
        .filter(([lang]) => lang !== language) // Don't duplicate the current language

      // Create translations one by one to generate IDs
      for (const [lang, data] of translationEntries as [string, any][]) {
        const additionalTranslationId = `intl_trans_${program.id}_${lang}_${Date.now()}`
        await prisma.international_program_translations.create({
          data: {
            id: additionalTranslationId,
            programId: program.id,
            language: lang,
            title: data.title || title,
            description: data.description || description,
            duration: data.duration || duration,
            highlights: JSON.stringify(data.highlights || highlights),
            academics: JSON.stringify(data.academics || academics),
            itinerary: JSON.stringify(data.itinerary || itinerary),
            requirements: JSON.stringify(data.requirements || requirements),
            sessions: JSON.stringify(data.sessions || sessions),
            materials: JSON.stringify(data.materials || []),
          }
        })
      }
    }

    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    console.error('Create international program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
