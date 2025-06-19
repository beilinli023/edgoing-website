import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const countries = await prisma.countries.findMany({
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
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
    const { name, nameEn, code, isActive = true } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if country already exists
    const existingCountry = await prisma.countries.findFirst({
      where: { name }
    })

    if (existingCountry) {
      return NextResponse.json(
        { error: `国家 "${name}" 已存在` },
        { status: 400 }
      )
    }

    // Check if country code already exists (if provided)
    if (code) {
      const existingCode = await prisma.countries.findFirst({
        where: { code }
      })

      if (existingCode) {
        return NextResponse.json(
          { error: `国家代码 "${code}" 已存在` },
          { status: 400 }
        )
      }
    }

    const country = await prisma.countries.create({
      data: {
        id: `country_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        nameEn,
        code,
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(country)
  } catch (error) {
    console.error('Error creating country:', error)
    return NextResponse.json(
      { error: 'Failed to create country' },
      { status: 500 }
    )
  }
}
