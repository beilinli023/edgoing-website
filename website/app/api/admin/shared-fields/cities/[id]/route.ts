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
    const { name, nameEn, countryId, isActive } = data

    if (!name || !countryId) {
      return NextResponse.json(
        { error: 'Name and country are required' },
        { status: 400 }
      )
    }

    const city = await prisma.cities.update({
      where: { id },
      data: {
        name,
        nameEn,
        countryId,
        isActive,
        updatedAt: new Date() // 🛡️ 手动提供updatedAt
      },
      include: {
        countries: true
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error('Error updating city:', error)
    return NextResponse.json(
      { error: 'Failed to update city' },
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

    await prisma.cities.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    )
  }
}
