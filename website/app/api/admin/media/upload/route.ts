import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string || ''
    const caption = formData.get('caption') as string || ''

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime']
    const allowedTypes = [...imageTypes, ...videoTypes]

    // Also check file extension if MIME type is not detected correctly
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov']
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const allowedExtensions = [...videoExtensions, ...imageExtensions]

    const isValidMimeType = allowedTypes.includes(file.type)
    const isValidExtension = allowedExtensions.includes(fileExtension || '')

    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    const isVideo = videoTypes.includes(file.type) || videoExtensions.includes(fileExtension || '')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for videos, 5MB for images
    if (file.size > maxSize) {
      const maxSizeText = isVideo ? '100MB' : '5MB'
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeText}.` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Save to database
    // Handle development mode where mock user might not exist in database
    let uploadedBy = authResult.user.id
    if (process.env.DISABLE_AUTH === 'true') {
      // In development mode, use the existing admin user
      const existingAdmin = await prisma.users.findFirst({
        where: { role: 'ADMIN' }
      })

      if (existingAdmin) {
        uploadedBy = existingAdmin.id
      } else {
        throw new Error('No admin user found in database')
      }
    }

    // Generate a unique ID for the media record
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const media = await prisma.media.create({
      data: {
        id: mediaId,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        alt,
        caption,
        uploadedBy,
        updatedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        url: media.url,
        alt: media.alt,
        caption: media.caption,
        size: media.size,
        mimeType: media.mimeType,
        createdAt: media.createdAt,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
