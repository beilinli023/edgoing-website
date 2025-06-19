import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')

    const where = countryId ? { countryId } : {}

    const cities = await prisma.cities.findMany({
      where,
      include: {
        countries: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
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
    const { name, nameEn, countryId, isActive = true } = data

    if (!name || !countryId) {
      return NextResponse.json(
        { error: 'Name and country are required' },
        { status: 400 }
      )
    }

    // Check if city already exists in this country
    const existingCity = await prisma.cities.findFirst({
      where: {
        name,
        countryId
      },
      include: {
        countries: true
      }
    })

    if (existingCity) {
      return NextResponse.json(
        { error: `城市 "${name}" 在 "${existingCity.countries.name}" 中已存在` },
        { status: 400 }
      )
    }

    const city = await prisma.cities.create({
      data: {
        id: `city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        nameEn,
        countryId,
        isActive,
        updatedAt: new Date()
      },
      include: {
        countries: true
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error('Error creating city:', error)

    // Handle Prisma unique constraint error
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: '该城市在此国家中已存在' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    )
  }
}
