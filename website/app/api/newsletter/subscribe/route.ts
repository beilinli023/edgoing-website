import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendNewsletterSubscriptionNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, language = 'zh' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: language === 'zh' ? '邮箱地址是必填项' : 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletters.findUnique({
      where: { email },
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: language === 'zh' ? '该邮箱已订阅' : 'Email is already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        const updated = await prisma.newsletters.update({
          where: { email },
          data: {
            isActive: true,
            name,
            language,
            unsubscribedAt: null,
          },
        })
        // Send email notification for reactivation
        sendNewsletterSubscriptionNotification(updated).catch(error => {
          console.error('Failed to send newsletter subscription notification:', error)
        })

        return NextResponse.json({
          message: language === 'zh' ? '感谢您的订阅' : 'Successfully subscribed!',
          subscription: updated
        })
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletters.create({
      data: {
        id: nanoid(),
        email,
        name,
        language,
        isActive: true,
      },
    })

    // Send email notification for new subscription
    sendNewsletterSubscriptionNotification(subscription).catch(error => {
      console.error('Failed to send newsletter subscription notification:', error)
    })

    return NextResponse.json({
      message: language === 'zh' ? '感谢您的订阅' : 'Successfully subscribed!',
      subscription
    }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
