import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaginationParams, getLanguageParam, getStatusParam, getQueryParam, buildErrorResponse } from '@/lib/api-utils'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 🛡️ 使用安全的参数获取方法，避免静态生成时的动态服务器使用
    const { page, limit, skip } = getPaginationParams(request)
    const language = getLanguageParam(request)
    const status = getStatusParam(request)
    const country = getQueryParam(request, 'country')
    const city = getQueryParam(request, 'city')
    const type = getQueryParam(request, 'type')
    const gradeLevel = getQueryParam(request, 'gradeLevel')

    const where: any = {
      status,
    }

    // Build where conditions
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
        orderBy: { publishedAt: 'desc' },
        skip: skip,
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
        country: program.cities?.countries?.name || program.country,
        city: program.cities ? {
          id: program.cities.id,
          name: program.cities.name,
          nameEn: program.cities.nameEn,
          country: program.cities.countries ? {
            name: program.cities.countries.name,
            nameEn: program.cities.countries.nameEn
          } : undefined
        } : undefined,
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
        applicationsCount: program._count.international_applications,
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
    const errorResponse = buildErrorResponse(error, 'International Programs API')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
