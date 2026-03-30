import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    let whereClause = ''
    if (featured) {
      whereClause = 'WHERE is_featured = true'
    }

    const result = await query(
      `
      SELECT 
        id,
        name,
        slug,
        description,
        icon,
        color,
        question_count,
        follower_count,
        is_featured
      FROM topics
      ${whereClause}
      ORDER BY follower_count DESC, question_count DESC
      LIMIT $1
    `,
      [limit]
    )

    return NextResponse.json({ topics: result.rows })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}
