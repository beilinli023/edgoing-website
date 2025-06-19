import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'

    const program = await prisma.international_programs.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
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
            language,
          }
        },
        _count: {
          select: {
            international_applications: true,
          }
        }
      },
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Get translation data
    const translation = program.international_program_translations[0]

    // Get shared field translations
    const [programTypes, gradeLevels] = await Promise.all([
      prisma.program_types.findMany(),
      prisma.grade_levels.findMany()
    ])

    // Create translation maps for shared fields
    const getTranslatedValue = (originalValue: string, fieldType: string) => {
      if (fieldType === 'programType') {
        const field = programTypes.find(f =>
          f.name === originalValue || f.nameEn === originalValue
        )
        return language === 'en' && field?.nameEn ? field.nameEn : (field?.name || originalValue)
      }

      if (fieldType === 'gradeLevel') {
        const field = gradeLevels.find(f =>
          f.name === originalValue || f.nameEn === originalValue
        )
        return language === 'en' && field?.nameEn ? field.nameEn : (field?.name || originalValue)
      }

      // If no translation found, return original value
      return originalValue
    }

    // Translate shared field arrays
    const translateArray = (arr: string[], fieldType: string) => {
      return arr.map(item => getTranslatedValue(item, fieldType))
    }

    // Parse and translate shared field data
    const typeArray = program.type ? JSON.parse(program.type) : []
    const gradeLevelArray = program.gradeLevel ? JSON.parse(program.gradeLevel) : []

    // Format response with translations
    const formattedProgram = {
      id: program.id,
      title: translation?.title || program.title,
      slug: program.slug,
      description: translation?.description || program.description,
      duration: translation?.duration || program.duration,
      country: language === 'en' && program.cities?.countries?.nameEn
        ? program.cities.countries.nameEn
        : (program.cities?.countries?.name || program.country),
      city: program.cities ? {
        id: program.cities.id,
        name: language === 'en' && program.cities.nameEn ? program.cities.nameEn : program.cities.name,
        nameEn: program.cities.nameEn,
        country: program.cities.countries ? {
          name: language === 'en' && program.cities.countries.nameEn
            ? program.cities.countries.nameEn
            : program.cities.countries.name,
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
      type: translateArray(typeArray, 'programType'),
      gradeLevel: translateArray(gradeLevelArray, 'gradeLevel'),
      sessions: translation?.sessions ? JSON.parse(translation.sessions) : (program.sessions ? JSON.parse(program.sessions) : []),
      publishedAt: program.publishedAt,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      author: program.users,
      applicationsCount: program._count.international_applications,
    }

    return NextResponse.json({ program: formattedProgram })
  } catch (error) {
    console.error('Get international program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
