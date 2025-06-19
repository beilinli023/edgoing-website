import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    // First try to get basic testimonial data
    const testimonial = await prisma.testimonials.findUnique({
      where: { id },
    })

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Then get related data separately to avoid relation issues
    const [media, user, translations] = await Promise.all([
      testimonial.imageId ? prisma.media.findUnique({
        where: { id: testimonial.imageId },
        select: {
          id: true,
          url: true,
          alt: true,
          filename: true,
        },
      }) : null,
      prisma.users.findUnique({
        where: { id: testimonial.authorId },
        select: {
          id: true,
          name: true,
          username: true,
        },
      }),
      prisma.testimonial_translations.findMany({
        where: { testimonialId: id },
      }),
    ])

    // Construct the response object
    const responseTestimonial = {
      ...testimonial,
      media,
      users: user,
      testimonial_translations: translations,
    }

    return NextResponse.json({ testimonial: responseTestimonial })
  } catch (error) {
    console.error('Get testimonial error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const {
      content,
      author,
      role,
      program,
      status,
      imageId,
      order,
      translations = [],
    } = data

    // Validate required fields - at least one language should have content
    const hasMainContent = content && author && role && program
    const hasTranslationContent = Array.isArray(translations) && translations.length > 0 && translations.some((t: any) =>
      t && t.content && t.author && t.role && t.program
    )

    if (!hasMainContent && !hasTranslationContent) {
      return NextResponse.json(
        { error: 'At least one language must have complete content (content, author, role, and program)' },
        { status: 400 }
      )
    }

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonials.findUnique({
      where: { id },
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Update testimonial
    const now = new Date()
    const testimonial = await prisma.testimonials.update({
      where: { id },
      data: {
        content,
        author,
        role,
        program,
        status,
        imageId,
        order,
        publishedAt: status === 'PUBLISHED' && !existingTestimonial.publishedAt
          ? now
          : existingTestimonial.publishedAt,
        updatedAt: now, // 🛡️ 手动提供updatedAt，因为模型没有@updatedAt装饰器
      },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            alt: true,
            filename: true,
          },
        },
        testimonial_translations: true,
      },
    })

    // Update translations
    if (Array.isArray(translations) && translations.length > 0) {
      // Delete existing translations
      await prisma.testimonial_translations.deleteMany({
        where: { testimonialId: id },
      })

      // Create new translations one by one (createMany doesn't auto-generate id)
      const validTranslations = translations.filter((t: any) => t && t.language && t.content && t.author && t.role && t.program)
      for (const translation of validTranslations) {
        // Generate a unique ID for the translation
        const translationId = `${id}_${translation.language}_${Date.now()}`
        await prisma.testimonial_translations.create({
          data: {
            id: translationId,
            testimonialId: id,
            language: translation.language,
            content: translation.content,
            author: translation.author,
            role: translation.role,
            program: translation.program,
          },
        })
      }
    }

    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error('Update testimonial error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if testimonial exists
    const testimonial = await prisma.testimonials.findUnique({
      where: { id },
    })

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Delete testimonial (translations will be deleted automatically due to cascade)
    await prisma.testimonials.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete testimonial error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
