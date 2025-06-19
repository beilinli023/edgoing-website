import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'

// Mock user for development mode
const MOCK_USER = {
  id: 'dev-user-id',
  email: 'dev@edgoing.com',
  username: 'developer',
  role: 'ADMIN',
  name: 'Development User'
}

export async function GET(request: NextRequest) {
  try {
    // Check if authentication is disabled in development mode
    if (process.env.DISABLE_AUTH === 'true') {
      console.log('🔓 Authentication disabled - returning mock user')
      return NextResponse.json({ user: MOCK_USER })
    }

    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
