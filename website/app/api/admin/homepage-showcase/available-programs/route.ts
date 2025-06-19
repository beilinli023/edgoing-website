import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


const prisma = new PrismaClient()

// GET - 获取可用于首页展示的项目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'

    // 获取已发布的中国项目
    const chinaPrograms = await prisma.china_programs.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        cities: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            countries: {
              select: {
                name: true,
                nameEn: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // 获取已发布的国际项目
    const internationalPrograms = await prisma.international_programs.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        cities: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            countries: {
              select: {
                name: true,
                nameEn: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // 格式化中国项目数据
    const formattedChinaPrograms = chinaPrograms.map(program => ({
      id: program.id,
      title: program.title,
      slug: program.slug,
      description: program.description,
      featuredImage: program.featuredImage,
      type: 'china',
      typeLabel: language === 'zh' ? '游学中国' : 'Study China',
      city: program.cities ? (language === 'zh' ? program.cities.name : (program.cities.nameEn || program.cities.name)) : '',
      cityDisplay: program.cities
        ? `${language === 'zh' ? program.cities.name : (program.cities.nameEn || program.cities.name)}, ${language === 'zh' ? program.cities.countries?.name : (program.cities.countries?.nameEn || program.cities.countries?.name)}`
        : '',
      link: `/study-china/${program.slug}`,
      createdAt: program.createdAt
    }))

    // 格式化国际项目数据
    const formattedInternationalPrograms = internationalPrograms.map(program => ({
      id: program.id,
      title: program.title,
      slug: program.slug,
      description: program.description,
      featuredImage: program.featuredImage,
      type: 'international',
      typeLabel: language === 'zh' ? '游学国际' : 'Study International',
      city: program.cities ? (language === 'zh' ? program.cities.name : (program.cities.nameEn || program.cities.name)) : '',
      cityDisplay: program.cities
        ? `${language === 'zh' ? program.cities.name : (program.cities.nameEn || program.cities.name)}, ${language === 'zh' ? program.cities.countries?.name : (program.cities.countries?.nameEn || program.cities.countries?.name)}`
        : '',
      link: `/programs/${program.slug}`,
      createdAt: program.createdAt
    }))

    // 合并所有项目并按创建时间排序
    const allPrograms = [
      ...formattedChinaPrograms,
      ...formattedInternationalPrograms
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      programs: allPrograms,
      chinaPrograms: formattedChinaPrograms,
      internationalPrograms: formattedInternationalPrograms
    })
  } catch (error) {
    console.error('Error fetching available programs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
