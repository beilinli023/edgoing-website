import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [programTypes, gradeLevels, countries, cities] = await Promise.all([
      prisma.program_types.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          nameEn: true,
          order: true,
          isActive: true
        },
        orderBy: { order: 'asc' }
      }),
      prisma.grade_levels.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          nameEn: true,
          order: true,
          isActive: true
        },
        orderBy: { order: 'asc' }
      }),
      prisma.countries.findMany({
        where: { isActive: true },
        include: {
          cities: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }),
      prisma.cities.findMany({
        where: { isActive: true },
        include: {
          countries: true
        },
        orderBy: { name: 'asc' }
      })
    ])

    // 排序函数：确保"其他"选项在最后
    const sortWithOthersLast = (items: any[]) => {
      return items.sort((a, b) => {
        const aName = (a.nameEn || a.name).toLowerCase()
        const bName = (b.nameEn || b.name).toLowerCase()

        // 检查是否为"其他"相关的选项
        const aIsOther = aName.includes('other') || aName.includes('其他') || aName.includes('others')
        const bIsOther = bName.includes('other') || bName.includes('其他') || bName.includes('others')

        if (aIsOther && !bIsOther) return 1
        if (!aIsOther && bIsOther) return -1

        // 如果都不是"其他"或都是"其他"，按order字段排序，然后按名称排序
        if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
          return a.order - b.order
        }
        return aName.localeCompare(bName)
      })
    }

    return NextResponse.json({
      programTypes: sortWithOthersLast(programTypes),
      gradeLevels: sortWithOthersLast(gradeLevels),
      countries: sortWithOthersLast(countries),
      cities
    })
  } catch (error) {
    console.error('Error fetching shared fields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared fields' },
      { status: 500 }
    )
  }
}
