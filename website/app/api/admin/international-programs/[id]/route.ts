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
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'

    const program = await prisma.international_programs.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            name: true,
            username: true,
          }
        },
        cities: {
          include: {
            countries: true
          }
        },
        international_program_translations: {
          where: {
            language
          }
        },
        _count: {
          select: {
            international_applications: true,
          }
        }
      },
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Get translation data
    const translation = program.international_program_translations[0]

    // Format response with translations
    const formattedProgram = {
      ...program,
      title: translation?.title || program.title,
      description: translation?.description || program.description,
      duration: translation?.duration || program.duration,
      country: program.cities?.countries?.name || program.country,
      city: program.cities?.name,
      gallery: program.gallery ? JSON.parse(program.gallery) : [],
      highlights: translation?.highlights ? JSON.parse(translation.highlights) : (program.highlights ? JSON.parse(program.highlights) : []),
      academics: translation?.academics ? JSON.parse(translation.academics) : (program.academics ? JSON.parse(program.academics) : []),
      itinerary: translation?.itinerary ? JSON.parse(translation.itinerary) : (program.itinerary ? JSON.parse(program.itinerary) : []),
      requirements: translation?.requirements ? JSON.parse(translation.requirements) : (program.requirements ? JSON.parse(program.requirements) : []),
      sessions: translation?.sessions ? JSON.parse(translation.sessions) : (program.sessions ? JSON.parse(program.sessions) : []),
      materials: translation?.materials ? JSON.parse(translation.materials) : [],
      type: program.type ? JSON.parse(program.type) : [],
      gradeLevel: program.gradeLevel ? JSON.parse(program.gradeLevel) : [],
      applicationsCount: program._count.international_applications,
    }

    return NextResponse.json({ program: formattedProgram })
  } catch (error) {
    console.error('Get international program error:', error)
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
    const body = await request.json()
    const {
      title,
      slug,
      description,
      duration,
      status,
      language,
      country,
      cityId,
      deadline,
      featuredImage,
      gallery = [],
      highlights = [],
      academics = [],
      itinerary = [],
      requirements = [],
      type = [],
      gradeLevel = [],
      sessions = [],
      translations = {}
    } = body

    // Get existing program to check publishedAt
    const existingProgram = await prisma.international_programs.findUnique({
      where: { id }
    })

    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Check if slug is being updated and sync homepage showcases
    const isSlugUpdated = slug !== undefined && slug !== existingProgram.slug

    // Update the program (including all fields)
    const program = await prisma.international_programs.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        duration,
        status,
        country,
        cityId,
        deadline: deadline ? new Date(deadline) : null,
        featuredImage,
        gallery: JSON.stringify(gallery),
        highlights: JSON.stringify(highlights),
        academics: JSON.stringify(academics),
        itinerary: JSON.stringify(itinerary),
        requirements: JSON.stringify(requirements),
        sessions: JSON.stringify(sessions),
        type: JSON.stringify(type),
        gradeLevel: JSON.stringify(gradeLevel),
        publishedAt: status === 'PUBLISHED' && !existingProgram?.publishedAt ? new Date() : undefined,
      },
      include: {
        cities: {
          include: {
            countries: true
          }
        },
        users: {
          select: {
            name: true,
            username: true,
          }
        },
        international_program_translations: true
      }
    })

    // If slug was updated, sync all related homepage showcases
    if (isSlugUpdated && slug) {
      try {
        const updateResult = await prisma.homepage_showcases.updateMany({
          where: {
            programType: 'international',
            programSlug: existingProgram.slug, // Find showcases with old slug
          },
          data: {
            programSlug: slug, // Update to new slug
            updatedAt: new Date(),
          },
        })

        console.log(`Updated ${updateResult.count} homepage showcase(s) for International program slug change: ${existingProgram.slug} -> ${slug}`)
      } catch (error) {
        console.error('Error updating homepage showcases for International program slug change:', error)
        // Don't fail the main update if showcase sync fails
      }
    }

    // Update or create translation for the current language
    await prisma.international_program_translations.upsert({
      where: {
        programId_language: {
          programId: id,
          language: language
        }
      },
      update: {
        title,
        description,
        duration,
        highlights: JSON.stringify(highlights),
        academics: JSON.stringify(academics),
        itinerary: JSON.stringify(itinerary),
        requirements: JSON.stringify(requirements),
        sessions: JSON.stringify(sessions),
        materials: JSON.stringify([]),
      },
      create: {
        id: `intl_trans_${id}_${language}_${Date.now()}`,
        programId: id,
        language: language,
        title,
        description,
        duration,
        highlights: JSON.stringify(highlights),
        academics: JSON.stringify(academics),
        itinerary: JSON.stringify(itinerary),
        requirements: JSON.stringify(requirements),
        sessions: JSON.stringify(sessions),
        materials: JSON.stringify([]),
      }
    })

    // Update additional translations if provided
    if (Object.keys(translations).length > 0) {
      for (const [lang, data] of Object.entries(translations) as [string, any][]) {
        if (lang !== language) { // Don't duplicate the current language
          await prisma.international_program_translations.upsert({
            where: {
              programId_language: {
                programId: id,
                language: lang
              }
            },
            update: {
              title: data.title || title,
              description: data.description || description,
              duration: data.duration || duration,
              highlights: JSON.stringify(data.highlights || highlights),
              academics: JSON.stringify(data.academics || academics),
              itinerary: JSON.stringify(data.itinerary || itinerary),
              requirements: JSON.stringify(data.requirements || requirements),
              sessions: JSON.stringify(data.sessions || sessions),
              materials: JSON.stringify(data.materials || []),
            },
            create: {
              id: `intl_trans_${id}_${lang}_${Date.now()}`,
              programId: id,
              language: lang,
              title: data.title || title,
              description: data.description || description,
              duration: data.duration || duration,
              highlights: JSON.stringify(data.highlights || highlights),
              academics: JSON.stringify(data.academics || academics),
              itinerary: JSON.stringify(data.itinerary || itinerary),
              requirements: JSON.stringify(data.requirements || requirements),
              sessions: JSON.stringify(data.sessions || sessions),
              materials: JSON.stringify(data.materials || []),
            }
          })
        }
      }
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error('Update international program error:', error)
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

    await prisma.international_programs.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete international program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
