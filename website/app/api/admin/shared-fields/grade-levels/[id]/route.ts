import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const data = await request.json()
    const { name, nameEn, description, isActive } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const gradeLevel = await prisma.grade_levels.update({
      where: { id },
      data: {
        name,
        nameEn,
        description,
        isActive
      }
    })

    return NextResponse.json(gradeLevel)
  } catch (error) {
    console.error('Error updating grade level:', error)
    return NextResponse.json(
      { error: 'Failed to update grade level' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    await prisma.grade_levels.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting grade level:', error)
    return NextResponse.json(
      { error: 'Failed to delete grade level' },
      { status: 500 }
    )
  }
}
