import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'

    const provinces = await prisma.china_provinces.findMany({
      orderBy: { order: 'asc' },
      include: {
        china_cities: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Format response based on language
    const formattedProvinces = provinces.map(province => ({
      id: province.id,
      name: language === 'en' ? province.nameEn : province.nameZh,
      code: province.code,
      cities: province.china_cities.map(city => ({
        id: city.id,
        name: language === 'en' ? city.nameEn : city.nameZh,
        code: city.code,
        provinceId: city.provinceId
      }))
    }))

    return NextResponse.json({
      provinces: formattedProvinces
    })
  } catch (error) {
    console.error('Get provinces error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
