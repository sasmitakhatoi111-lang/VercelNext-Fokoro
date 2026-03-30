import { cookies } from 'next/headers'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

// Session duration: 30 days in milliseconds
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await query(
    `INSERT INTO sessions (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  )

  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

export async function verifySession(token: string): Promise<number | null> {
  const result = await query(
    `SELECT user_id FROM sessions
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  )

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0].user_id
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token])
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const userId = await verifySession(sessionToken)
  if (!userId) {
    return null
  }

  const result = await query(
    `SELECT id, username, email, display_name, avatar_url, reputation
     FROM users WHERE id = $1`,
    [userId]
  )

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0]
}

// Returns session with user data for authentication checks
export async function getSession() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }
  return { user }
}
