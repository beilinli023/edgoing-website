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

    const program = await prisma.china_programs.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        language: 'zh', // 始终从主记录（中文）获取基础数据
      },
      include: {
        users: {
          select: {
            name: true,
            username: true,
          }
        },
        cities: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            countries: {
              select: {
                name: true,
                nameEn: true,
              }
            }
          }
        },
        china_program_translations: {
          select: {
            id: true,
            language: true,
            title: true,
            description: true,
            duration: true,
            highlights: true,
            academics: true,
            itinerary: true,
            requirements: true,
            sessions: true,
          }
        },
        _count: {
          select: {
            china_applications: true,
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

    // Find the translation for the requested language
    const translation = program.china_program_translations.find((t: any) => t.language === language)

    // Merge main program data with translation data
    let finalProgram = { ...program }

    if (language !== 'zh') {
      if (translation) {
        // Use translation data for non-Chinese languages
        finalProgram.title = translation.title
        finalProgram.description = translation.description
        finalProgram.duration = translation.duration || finalProgram.duration
        finalProgram.highlights = translation.highlights
        finalProgram.academics = translation.academics
        finalProgram.itinerary = translation.itinerary
        finalProgram.requirements = translation.requirements
        finalProgram.sessions = translation.sessions
      } else {
        // If no translation exists, return empty fields for text content
        finalProgram.title = ''
        finalProgram.description = ''
        finalProgram.duration = ''
        finalProgram.highlights = null
        finalProgram.academics = null
        finalProgram.itinerary = null
        finalProgram.requirements = null
        finalProgram.sessions = null
      }
    }

    // Parse JSON fields
    const parsedProgram = {
      ...finalProgram,
      city: finalProgram.cities, // 🛡️ 重命名cities为city，符合前端期望的字段名
      cities: undefined, // 移除原始的cities字段
      type: finalProgram.type ? JSON.parse(finalProgram.type) : [],
      gradeLevel: finalProgram.gradeLevel ? JSON.parse(finalProgram.gradeLevel) : [],
      sessions: finalProgram.sessions ? JSON.parse(finalProgram.sessions) : [],
      gallery: finalProgram.gallery ? JSON.parse(finalProgram.gallery) : [],
      highlights: finalProgram.highlights ? JSON.parse(finalProgram.highlights) : [],
      academics: finalProgram.academics ? JSON.parse(finalProgram.academics) : [],
      itinerary: finalProgram.itinerary ? JSON.parse(finalProgram.itinerary) : [],
      requirements: finalProgram.requirements ? JSON.parse(finalProgram.requirements) : [],
      translations: undefined, // Remove translations from response to keep it clean
    }

    return NextResponse.json({ program: parsedProgram })
  } catch (error) {
    console.error('Get china program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
