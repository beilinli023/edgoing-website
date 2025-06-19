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

    const programType = await prisma.program_types.update({
      where: { id },
      data: {
        name,
        nameEn,
        description,
        isActive
      }
    })

    return NextResponse.json(programType)
  } catch (error) {
    console.error('Error updating program type:', error)
    return NextResponse.json(
      { error: 'Failed to update program type' },
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

    await prisma.program_types.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting program type:', error)
    return NextResponse.json(
      { error: 'Failed to delete program type' },
      { status: 500 }
    )
  }
}
