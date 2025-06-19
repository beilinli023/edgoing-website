import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

// Helper function to parse JSON fields
function parseJsonFields(program: any) {
  const jsonFields = ['gallery', 'highlights', 'academics', 'itinerary', 'requirements', 'type', 'gradeLevel', 'sessions']

  const parsed = { ...program }

  jsonFields.forEach(field => {
    if (parsed[field]) {
      try {
        parsed[field] = JSON.parse(parsed[field])
      } catch (error) {
        console.error(`Error parsing ${field}:`, error)
        parsed[field] = []
      }
    } else {
      parsed[field] = []
    }
  })

  return parsed
}

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

    const program = await prisma.china_programs.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            name: true,
            username: true,
          }
        },
        cities: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            countries: {
              select: {
                name: true,
                nameEn: true,
              }
            }
          }
        },
        china_program_translations: {
          select: {
            id: true,
            language: true,
            title: true,
            description: true,
            duration: true,
            highlights: true,
            academics: true,
            itinerary: true,
            requirements: true,
            sessions: true,
          }
        },
        _count: {
          select: {
            china_applications: true,
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

    // Find the translation for the requested language
    const translation = program.china_program_translations.find(t => t.language === language)

    // Merge main program data with translation data
    let finalProgram = { ...program }

    if (language !== 'zh') {
      if (translation) {
        // Use translation data for non-Chinese languages
        finalProgram.title = translation.title
        finalProgram.description = translation.description
        finalProgram.duration = translation.duration || finalProgram.duration
        finalProgram.highlights = translation.highlights
        finalProgram.academics = translation.academics
        finalProgram.itinerary = translation.itinerary
        finalProgram.requirements = translation.requirements
        finalProgram.sessions = translation.sessions
      } else {
        // If no translation exists, return empty fields for text content
        finalProgram.title = ''
        finalProgram.description = ''
        finalProgram.duration = ''
        finalProgram.highlights = null
        finalProgram.academics = null
        finalProgram.itinerary = null
        finalProgram.requirements = null
        finalProgram.sessions = null
      }
    }

    // Parse JSON fields
    const parsedProgram = parseJsonFields(finalProgram)

    return NextResponse.json(parsedProgram)
  } catch (error) {
    console.error('Get china program error:', error)
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
      title,
      slug,
      description,
      country,
      cityId,
      duration,
      deadline,
      featuredImage,
      gallery,
      highlights,
      academics,
      itinerary,
      requirements,
      type,
      gradeLevel,
      sessions,
      status,
      language,
    } = data

    // Check if program exists
    const existingProgram = await prisma.china_programs.findUnique({
      where: { id },
    })

    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it conflicts
    if (slug !== undefined && slug !== existingProgram.slug) {
      // Only check for conflicts if slug is not empty
      if (slug && slug.trim() !== '') {
        const slugConflict = await prisma.china_programs.findUnique({
          where: { slug },
        })

        if (slugConflict) {
          return NextResponse.json(
            { error: 'Slug already exists' },
            { status: 400 }
          )
        }
      }
    }

    // If updating the main program (Chinese), update the main record
    if (!language || language === 'zh') {
      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (slug !== undefined) updateData.slug = slug
      if (description !== undefined) updateData.description = description
      if (country !== undefined) updateData.country = country
      if (cityId !== undefined) updateData.cityId = cityId
      if (duration !== undefined) updateData.duration = duration
      if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
      if (featuredImage !== undefined) updateData.featuredImage = featuredImage
      if (gallery !== undefined) updateData.gallery = gallery ? JSON.stringify(gallery) : null
      if (highlights !== undefined) updateData.highlights = highlights ? JSON.stringify(highlights) : null
      if (academics !== undefined) updateData.academics = academics ? JSON.stringify(academics) : null
      if (itinerary !== undefined) updateData.itinerary = itinerary ? JSON.stringify(itinerary) : null
      if (requirements !== undefined) updateData.requirements = requirements ? JSON.stringify(requirements) : null
      if (type !== undefined) updateData.type = type ? JSON.stringify(type) : null
      if (gradeLevel !== undefined) updateData.gradeLevel = gradeLevel ? JSON.stringify(gradeLevel) : null
      if (sessions !== undefined) updateData.sessions = sessions ? JSON.stringify(sessions) : null
      if (status !== undefined) {
        updateData.status = status
        if (status === 'PUBLISHED' && existingProgram.status !== 'PUBLISHED') {
          updateData.publishedAt = new Date()
        }
      }

      // Check if slug is being updated and sync homepage showcases
      const isSlugUpdated = slug !== undefined && slug !== existingProgram.slug

      const program = await prisma.china_programs.update({
        where: { id },
        data: updateData,
        include: {
          users: {
            select: {
              name: true,
              username: true,
            }
          },
          cities: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              countries: {
                select: {
                  name: true,
                  nameEn: true,
                }
              }
            }
          },
          china_program_translations: {
            select: {
              id: true,
              language: true,
              title: true,
              description: true,
              duration: true,
              highlights: true,
              academics: true,
              itinerary: true,
              requirements: true,
              sessions: true,
            }
          },
        },
      })

      // If slug was updated, sync all related homepage showcases
      if (isSlugUpdated && slug) {
        try {
          const updateResult = await prisma.homepage_showcases.updateMany({
            where: {
              programType: 'china',
              programSlug: existingProgram.slug, // Find showcases with old slug
            },
            data: {
              programSlug: slug, // Update to new slug
              updatedAt: new Date(),
            },
          })

          console.log(`Updated ${updateResult.count} homepage showcase(s) for China program slug change: ${existingProgram.slug} -> ${slug}`)
        } catch (error) {
          console.error('Error updating homepage showcases for China program slug change:', error)
          // Don't fail the main update if showcase sync fails
        }
      }

      return NextResponse.json({ program })
    } else {
      // If updating a translation, update or create the translation record
      const translationData = {
        title: title || '',
        description: description || '',
        duration: duration || '',
        highlights: highlights ? JSON.stringify(highlights) : null,
        academics: academics ? JSON.stringify(academics) : null,
        itinerary: itinerary ? JSON.stringify(itinerary) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        sessions: sessions ? JSON.stringify(sessions) : null,
      }

      // 🛡️ 生成安全的翻译记录ID
      const translationId = `${id}_trans_${language}_${Date.now()}`

      await prisma.china_program_translations.upsert({
        where: {
          programId_language: {
            programId: id,
            language,
          }
        },
        update: translationData,
        create: {
          id: translationId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
          programId: id,
          language,
          ...translationData,
        }
      })

      // Return the updated program with translations
      const program = await prisma.china_programs.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              name: true,
              username: true,
            }
          },
          cities: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              countries: {
                select: {
                  name: true,
                  nameEn: true,
                }
              }
            }
          },
          china_program_translations: {
            select: {
              id: true,
              language: true,
              title: true,
              description: true,
              duration: true,
              highlights: true,
              academics: true,
              itinerary: true,
              requirements: true,
              sessions: true,
            }
          },
        },
      })

      // Apply the translation data to the program object for the response
      if (program) {
        const translation = program.china_program_translations.find(t => t.language === language)
        let finalProgram = { ...program }

        if (translation) {
          // Use translation data for the response
          finalProgram.title = translation.title
          finalProgram.description = translation.description
          finalProgram.duration = translation.duration || finalProgram.duration
          finalProgram.highlights = translation.highlights
          finalProgram.academics = translation.academics
          finalProgram.itinerary = translation.itinerary
          finalProgram.requirements = translation.requirements
          finalProgram.sessions = translation.sessions
        }

        // Parse JSON fields
        const parsedProgram = parseJsonFields(finalProgram)
        return NextResponse.json({ program: parsedProgram })
      }

      return NextResponse.json({ program })
    }
  } catch (error) {
    console.error('Update china program error:', error)
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

    // Check if program exists
    const existingProgram = await prisma.china_programs.findUnique({
      where: { id },
    })

    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    await prisma.china_programs.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete china program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
