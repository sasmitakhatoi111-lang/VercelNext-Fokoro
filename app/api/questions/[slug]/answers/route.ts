import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'votes'

    let orderBy = '(a.upvotes - a.downvotes) DESC, a.created_at ASC'
    if (sort === 'latest') {
      orderBy = 'a.created_at DESC'
    } else if (sort === 'oldest') {
      orderBy = 'a.created_at ASC'
    }

    const result = await query(
      `SELECT 
        a.id, a.content, a.upvotes, a.downvotes, a.is_accepted, 
        a.created_at, a.updated_at,
        u.id as author_id, u.username as author_username, 
        u.display_name as author_display_name, u.avatar_url as author_avatar,
        u.reputation as author_reputation
      FROM answers a
      JOIN users u ON a.author_id = u.id
      JOIN questions q ON a.question_id = q.id
      WHERE q.slug = $1
      ORDER BY a.is_accepted DESC, ${orderBy}`,
      [slug]
    )

    return NextResponse.json({ answers: result.rows })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.length < 20) {
      return NextResponse.json(
        { error: 'Answer must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Get question ID
    const questionResult = await query(
      `SELECT id FROM questions WHERE slug = $1`,
      [slug]
    )

    if (questionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const questionId = questionResult.rows[0].id

    const result = await query(
      `INSERT INTO answers (question_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [questionId, session.userId, content]
    )

    // Update question answer count
    await query(
      `UPDATE questions SET answer_count = answer_count + 1 WHERE id = $1`,
      [questionId]
    )

    // Update user answer count
    await query(
      `UPDATE users SET answer_count = answer_count + 1 WHERE id = $1`,
      [session.userId]
    )

    return NextResponse.json({
      success: true,
      answerId: result.rows[0].id,
    })
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    )
  }
}
