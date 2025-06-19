import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  email: string
  username: string
  role: string
  name?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function createSession(userId: string, token: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  // Generate a unique ID for the session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await prisma.sessions.create({
    data: {
      id: sessionId,
      userId,
      token,
      expiresAt,
    },
  })
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.sessions.deleteMany({
    where: { token },
  })
}

export async function validateSession(token: string): Promise<AuthUser | null> {
  const session = await prisma.sessions.findUnique({
    where: { token },
    include: { users: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await deleteSession(token)
    }
    return null
  }

  return {
    id: session.users.id,
    email: session.users.email,
    username: session.users.username,
    role: session.users.role,
    name: session.users.name || undefined,
  }
}

export async function createDefaultAdmin(): Promise<void> {
  const existingAdmin = await prisma.users.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123')
    await prisma.users.create({
      data: {
        email: 'admin@edgoing.com',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Administrator',
      },
    })
    console.log('Default admin user created: admin@edgoing.com / admin123')
  }
}
