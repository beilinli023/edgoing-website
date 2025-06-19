import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      programId,
      studentName,
      studentEmail,
      studentPhone,
      studentAge,
      parentName,
      parentEmail,
      parentPhone,
    } = await request.json()

    // Validate required fields
    if (!programId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: 'Program ID, student name, and email are required' },
        { status: 400 }
      )
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Check if student already applied for this program
    const existingApplication = await prisma.application.findFirst({
      where: {
        programId,
        studentEmail,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this program' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        programId,
        studentName,
        studentEmail,
        studentPhone,
        studentAge: studentAge ? parseInt(studentAge) : null,
        parentName,
        parentEmail,
        parentPhone,
        status: 'PENDING',
      },
      include: {
        program: {
          select: {
            title: true,
            slug: true,
          }
        }
      },
    })

    return NextResponse.json({
      message: 'Application submitted successfully!',
      application,
    }, { status: 201 })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
