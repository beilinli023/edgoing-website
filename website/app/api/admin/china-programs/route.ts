import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

// Helper function to parse JSON fields
function parseJsonFields(program: any) {
  const jsonFields = ['gallery', 'highlights', 'academics', 'itinerary', 'requirements', 'type', 'gradeLevel', 'sessions']

  const parsed = { ...program }

  jsonFields.forEach(field => {
    if (parsed[field]) {
      try {
        parsed[field] = JSON.parse(parsed[field])
      } catch (error) {
        console.error(`Error parsing ${field}:`, error)
        parsed[field] = []
      }
    } else {
      parsed[field] = []
    }
  })

  // 🛡️ 重命名cities为city，符合前端期望的字段名
  if (parsed.cities) {
    parsed.city = parsed.cities
    delete parsed.cities
  }

  return parsed
}

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

    const where: any = {
      language: 'zh', // 始终从主记录（中文）获取基础数据
    }

    if (status) {
      where.status = status
    }

    const [programs, total] = await Promise.all([
      prisma.china_programs.findMany({
        where,
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
            }
          },
          _count: {
            select: {
              china_applications: true,
            }
          }
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
      const translation = program.china_program_translations.find(t => t.language === language)

      // Merge main program data with translation data
      let finalProgram = { ...program }

      if (language !== 'zh') {
        if (translation) {
          // Use translation data for non-Chinese languages
          finalProgram.title = translation.title
          finalProgram.description = translation.description
          finalProgram.duration = translation.duration || finalProgram.duration
        } else {
          // If no translation exists, return empty fields for text content
          finalProgram.title = ''
          finalProgram.description = ''
          finalProgram.duration = ''
        }
      }

      return parseJsonFields(finalProgram)
    })

    // Filter programs based on language:
    // - For Chinese: show all programs
    // - For other languages: only show programs that have translations OR have content
    const filteredPrograms = language === 'zh'
      ? parsedPrograms
      : parsedPrograms.filter(program => {
          const hasTranslation = program.china_program_translations.some(t => t.language === language)
          const hasContent = program.title && program.title.trim() !== ''
          return hasTranslation || hasContent
        })

    return NextResponse.json({
      programs: filteredPrograms,
      pagination: {
        page,
        limit,
        total: filteredPrograms.length,
        pages: Math.ceil(filteredPrograms.length / limit),
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
      country,
      cityId,
      duration,
      deadline,
      featuredImage,
      gallery,
      highlights,
      academics,
      itinerary,
      requirements,
      type,
      gradeLevel,
      sessions,
      status = 'DRAFT',
      language = 'zh',
    } = data

    // Validate required fields
    if (!title || !slug || !description || !cityId || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingProgram = await prisma.china_programs.findUnique({
      where: { slug },
    })

    if (existingProgram) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // 🛡️ 处理开发模式下的用户ID问题
    let authorId = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // 直接查找任何现有用户，优先选择管理员
      const existingUser = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      }) || await prisma.users.findFirst()

      if (existingUser) {
        authorId = existingUser.id
        console.log('🔧 DEBUG: Using existing user for china program:', existingUser.id, 'Role:', existingUser.role)
      } else {
        throw new Error('No users found in database. Please create a user first.')
      }
    }

    // 🛡️ 生成安全的中国项目ID
    const programId = `china_prog_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Create the main program record (always in Chinese as base)
    const program = await prisma.china_programs.create({
      data: {
        id: programId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
        title,
        slug,
        description,
        country,
        cityId,
        duration,
        deadline: deadline ? new Date(deadline) : null,
        featuredImage,
        gallery: gallery ? JSON.stringify(gallery) : null,
        highlights: highlights ? JSON.stringify(highlights) : null,
        academics: academics ? JSON.stringify(academics) : null,
        itinerary: itinerary ? JSON.stringify(itinerary) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        type: type ? JSON.stringify(type) : null,
        gradeLevel: gradeLevel ? JSON.stringify(gradeLevel) : null,
        sessions: sessions ? JSON.stringify(sessions) : null,
        status,
        language: 'zh', // 主记录始终为中文
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId, // 🛡️ 使用安全的authorId
        updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
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
        china_program_translations: true,
      },
    })

    // If the language is not Chinese, create a translation record
    if (language !== 'zh') {
      // 🛡️ 生成安全的翻译记录ID
      const translationId = `${program.id}_trans_${language}_${Date.now()}`

      await prisma.china_program_translations.create({
        data: {
          id: translationId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
          programId: program.id,
          language,
          title,
          description,
          duration,
          highlights: highlights ? JSON.stringify(highlights) : null,
          academics: academics ? JSON.stringify(academics) : null,
          itinerary: itinerary ? JSON.stringify(itinerary) : null,
          requirements: requirements ? JSON.stringify(requirements) : null,
        }
      })
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error('Create china program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
