import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(null, { status: 401 })
    }

    const userId = await verifySession(sessionToken)
    if (!userId) {
      return NextResponse.json(null, { status: 401 })
    }

    const result = await query(
      `SELECT id, username, email, display_name, avatar_url
       FROM users WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(null, { status: 401 })
    }

    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json(null, { status: 401 })
  }
}
