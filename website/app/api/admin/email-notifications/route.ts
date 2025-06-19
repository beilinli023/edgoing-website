import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendTestEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const config = await prisma.email_notifications.findFirst()
    
    if (!config) {
      // Create default config if none exists
      const defaultConfig = await prisma.email_notifications.create({
        data: {
          id: nanoid(),
          isActive: false,
          updatedAt: new Date(),
        },
      })
      return NextResponse.json(defaultConfig)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching email notification config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpSecure,
      fromEmail,
      fromName,
      notificationEmails,
      contactSubmissionEnabled,
      newsletterEnabled,
      isActive,
    } = await request.json()

    // Find existing config or create new one
    let config = await prisma.email_notifications.findFirst()
    
    if (!config) {
      config = await prisma.email_notifications.create({
        data: {
          id: nanoid(),
          smtpHost,
          smtpPort: parseInt(smtpPort) || 587,
          smtpUser,
          smtpPassword,
          smtpSecure: smtpSecure || true,
          fromEmail,
          fromName,
          notificationEmails: JSON.stringify(notificationEmails || []),
          contactSubmissionEnabled: contactSubmissionEnabled || false,
          newsletterEnabled: newsletterEnabled || false,
          isActive: isActive || false,
          updatedAt: new Date(),
        },
      })
    } else {
      config = await prisma.email_notifications.update({
        where: { id: config.id },
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort) || 587,
          smtpUser,
          smtpPassword,
          smtpSecure: smtpSecure || true,
          fromEmail,
          fromName,
          notificationEmails: JSON.stringify(notificationEmails || []),
          contactSubmissionEnabled: contactSubmissionEnabled || false,
          newsletterEnabled: newsletterEnabled || false,
          isActive: isActive || false,
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating email notification config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { action } = await request.json()

    if (action === 'test') {
      // Test email configuration
      const config = await prisma.email_notifications.findFirst()

      if (!config || !config.isActive) {
        return NextResponse.json(
          { error: '邮件配置未激活' },
          { status: 400 }
        )
      }

      // Send test email
      const success = await sendTestEmail(config as any)

      if (success) {
        return NextResponse.json({
          message: '测试邮件发送成功！请检查您的邮箱。'
        })
      } else {
        return NextResponse.json(
          { error: '测试邮件发送失败，请检查SMTP配置。' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error testing email configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
