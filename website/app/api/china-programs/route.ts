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
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const status = searchParams.get('status') || 'PUBLISHED'

    const where: any = {
      status,
      language: 'zh', // 始终从主记录（中文）获取基础数据
    }

    if (city) {
      where.city = city
    }

    if (type) {
      where.type = {
        contains: type
      }
    }

    const [programs, total] = await Promise.all([
      prisma.china_programs.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          country: true,
          cityId: true,
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
          duration: true,
          deadline: true,
          featuredImage: true,
          type: true,
          gradeLevel: true,
          sessions: true,
          createdAt: true,
          updatedAt: true,
          china_program_translations: {
            select: {
              id: true,
              language: true,
              title: true,
              description: true,
              duration: true,
              sessions: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.china_programs.count({ where }),
    ])

    // Parse JSON fields and merge translations
    const parsedPrograms = programs.map(program => {
      // Find translation for the requested language
      const translation = program.china_program_translations.find((t: any) => t.language === language)



      // Merge main program data with translation data
      let finalProgram = { ...program }

      if (language !== 'zh') {
        if (translation) {
          // Use translation data for non-Chinese languages
          finalProgram.title = translation.title
          finalProgram.description = translation.description
          finalProgram.duration = translation.duration || finalProgram.duration
          finalProgram.sessions = translation.sessions || finalProgram.sessions
        } else {
          // If no translation exists, return empty fields for text content
          finalProgram.title = ''
          finalProgram.description = ''
          finalProgram.duration = ''
          finalProgram.sessions = finalProgram.sessions // 保持原始sessions，因为这是结构化数据
        }
      }

      return {
        ...finalProgram,
        city: finalProgram.cities, // 🛡️ 重命名cities为city，符合前端期望的字段名
        cities: undefined, // 移除原始的cities字段
        type: finalProgram.type ? JSON.parse(finalProgram.type) : [],
        gradeLevel: finalProgram.gradeLevel ? JSON.parse(finalProgram.gradeLevel) : [],
        sessions: finalProgram.sessions ? JSON.parse(finalProgram.sessions) : [],
        translations: undefined // Remove translations from response to keep it clean
      }
    })

    return NextResponse.json({
      programs: parsedPrograms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get china programs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
