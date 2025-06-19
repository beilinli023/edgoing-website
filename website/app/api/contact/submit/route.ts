import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendContactSubmissionNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const {
      role,
      schoolName,
      firstName,
      lastName,
      email,
      phone,
      grade,
      province,
      city,
      destinations,
      learningInterests,
      message,
      consent,
      privacyConsent,
    } = await request.json()

    // Validate required fields
    if (!role || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: '身份、姓名、邮箱和电话为必填项' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // Validate consent
    if (!consent) {
      return NextResponse.json(
        { error: '请同意接收项目信息和更新' },
        { status: 400 }
      )
    }

    // Validate privacy consent
    if (!privacyConsent) {
      return NextResponse.json(
        { error: '请阅读并同意隐私政策' },
        { status: 400 }
      )
    }

    // Create contact submission
    const contactSubmission = await prisma.contact_submissions.create({
      data: {
        id: nanoid(),
        role,
        schoolName: schoolName || null,
        firstName,
        lastName,
        email,
        phone,
        grade: grade || null,
        province: province || null,
        city: city || null,
        destinations: destinations && destinations.length > 0 ? JSON.stringify(destinations) : null,
        learningInterests: learningInterests && learningInterests.length > 0 ? JSON.stringify(learningInterests) : null,
        message: message || null,
        consent,
        status: 'NEW',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Send email notification (don't wait for it to complete)
    sendContactSubmissionNotification(contactSubmission).catch(error => {
      console.error('Failed to send contact submission notification:', error)
    })

    return NextResponse.json({
      message: '联系表单提交成功！',
      submission: {
        id: contactSubmission.id,
        submittedAt: contactSubmission.submittedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
