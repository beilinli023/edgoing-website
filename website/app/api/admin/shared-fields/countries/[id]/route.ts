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
    const { name, nameEn, code, isActive } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const country = await prisma.countries.update({
      where: { id },
      data: {
        name,
        nameEn,
        code,
        isActive,
        updatedAt: new Date() // 🛡️ 手动提供updatedAt
      }
    })

    return NextResponse.json(country)
  } catch (error) {
    console.error('Error updating country:', error)
    return NextResponse.json(
      { error: 'Failed to update country' },
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

    // Check if country has cities
    const citiesCount = await prisma.cities.count({
      where: { countryId: id }
    })

    if (citiesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete country with existing cities' },
        { status: 400 }
      )
    }

    await prisma.countries.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting country:', error)
    return NextResponse.json(
      { error: 'Failed to delete country' },
      { status: 500 }
    )
  }
}
