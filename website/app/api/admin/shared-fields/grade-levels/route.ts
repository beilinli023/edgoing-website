import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const gradeLevels = await prisma.grade_levels.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(gradeLevels)
  } catch (error) {
    console.error('Error fetching grade levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grade levels' },
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
    const { name, nameEn, description, isActive = true } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if grade level already exists
    const existingLevel = await prisma.grade_levels.findFirst({
      where: { name }
    })

    if (existingLevel) {
      return NextResponse.json(
        { error: `年级 "${name}" 已存在` },
        { status: 400 }
      )
    }

    const gradeLevel = await prisma.grade_levels.create({
      data: {
        id: `grade_level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        nameEn,
        description,
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(gradeLevel)
  } catch (error) {
    console.error('Error creating grade level:', error)
    return NextResponse.json(
      { error: 'Failed to create grade level' },
      { status: 500 }
    )
  }
}
