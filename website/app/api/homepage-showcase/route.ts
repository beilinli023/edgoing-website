import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Homepage showcase API called')
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'
    const limit = parseInt(searchParams.get('limit') || '6')

    console.log('Parameters:', { language, limit })

    // Get active homepage showcase items
    console.log('Fetching showcases...')
    const showcases = await prisma.homepage_showcases.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { position: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    })

    console.log('Found showcases:', showcases.length)

    // Fetch program details for each showcase item
    const showcasePrograms = await Promise.all(
      showcases.map(async (showcase) => {
        let program = null

        if (showcase.programType === 'china') {
          // Fetch China program with translations
          const chinaProgram = await prisma.china_programs.findFirst({
            where: {
              slug: showcase.programSlug,
              status: 'PUBLISHED',
            },
            include: {
              china_program_translations: {
                where: {
                  language: language
                }
              }
            }
          })

          if (chinaProgram) {
            const translation = chinaProgram.china_program_translations[0]

            program = {
              id: chinaProgram.id,
              title: translation?.title
                || (language === 'zh' ? showcase.titleZh : showcase.titleEn)
                || chinaProgram.title,
              description: translation?.description || chinaProgram.description,
              image: chinaProgram.featuredImage || '/placeholder-program.jpg',
              type: language === 'zh'
                ? (showcase.programTypeZh || '游学中国')
                : (showcase.programTypeEn || 'Study China'),
              city: language === 'zh'
                ? (showcase.cityZh || '')
                : (showcase.cityEn || ''),
              link: `/study-china/${chinaProgram.slug}`,
            }
          }
        } else if (showcase.programType === 'international') {
          // Fetch International program with translations
          const internationalProgram = await prisma.international_programs.findFirst({
            where: {
              slug: showcase.programSlug,
              status: 'PUBLISHED',
            },
            include: {
              international_program_translations: {
                where: {
                  language: language
                }
              }
            }
          })

          if (internationalProgram) {
            const translation = internationalProgram.international_program_translations[0]

            program = {
              id: internationalProgram.id,
              title: translation?.title
                || (language === 'zh' ? showcase.titleZh : showcase.titleEn)
                || internationalProgram.title,
              description: translation?.description || internationalProgram.description,
              image: internationalProgram.featuredImage || '/placeholder-program.jpg',
              type: language === 'zh'
                ? (showcase.programTypeZh || '游学国际')
                : (showcase.programTypeEn || 'Study International'),
              city: language === 'zh'
                ? (showcase.cityZh || '')
                : (showcase.cityEn || ''),
              link: `/programs/${internationalProgram.slug}`,
            }
          }
        }

        return {
          position: showcase.position,
          program,
        }
      })
    )

    // Filter out showcases where program was not found and sort by position
    const validShowcases = showcasePrograms
      .filter(item => item.program !== null)
      .sort((a, b) => a.position - b.position)
      .map(item => item.program)

    return NextResponse.json({
      programs: validShowcases,
    })
  } catch (error) {
    console.error('Get homepage showcase error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
