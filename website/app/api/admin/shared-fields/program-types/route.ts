import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const programTypes = await prisma.program_types.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(programTypes)
  } catch (error) {
    console.error('Error fetching program types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch program types' },
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

    // Check if program type already exists
    const existingType = await prisma.program_types.findFirst({
      where: { name }
    })

    if (existingType) {
      return NextResponse.json(
        { error: `项目类型 "${name}" 已存在` },
        { status: 400 }
      )
    }

    const programType = await prisma.program_types.create({
      data: {
        id: `prog_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        nameEn,
        description,
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(programType)
  } catch (error) {
    console.error('Error creating program type:', error)
    return NextResponse.json(
      { error: 'Failed to create program type' },
      { status: 500 }
    )
  }
}
