import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const [programTypes, gradeLevels, countries, cities] = await Promise.all([
      prisma.program_types.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      prisma.grade_levels.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      prisma.countries.findMany({
        where: { isActive: true },
        include: {
          cities: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.cities.findMany({
        where: { isActive: true },
        include: {
          countries: true
        },
        orderBy: { name: 'asc' }
      })
    ])

    return NextResponse.json({
      programTypes,
      gradeLevels,
      countries,
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
