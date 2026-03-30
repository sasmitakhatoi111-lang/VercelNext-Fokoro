import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'votes'

    let orderBy = 'a.is_accepted DESC, a.vote_count DESC'
    if (sort === 'newest') {
      orderBy = 'a.is_accepted DESC, a.created_at DESC'
    } else if (sort === 'oldest') {
      orderBy = 'a.is_accepted DESC, a.created_at ASC'
    }

    const result = await query(
      `
      SELECT 
        a.id,
        a.content,
        a.vote_count,
        a.is_accepted,
        a.created_at,
        a.updated_at,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'display_name', u.display_name,
          'avatar_url', u.avatar_url,
          'reputation', u.reputation
        ) as author
      FROM answers a
      JOIN users u ON a.author_id = u.id
      JOIN questions q ON a.question_id = q.id
      WHERE q.slug = $1
      ORDER BY ${orderBy}
    `,
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Answer must be at least 10 characters' },
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

    // Create answer
    const answerResult = await query(
      `
      INSERT INTO answers (question_id, author_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, vote_count, is_accepted, created_at
    `,
      [questionId, user.id, content]
    )

    // Update question answer count
    await query(
      `UPDATE questions SET answer_count = answer_count + 1 WHERE id = $1`,
      [questionId]
    )

    // Update user reputation
    await query(`UPDATE users SET reputation = reputation + 5 WHERE id = $1`, [
      user.id,
    ])

    const answer = {
      ...answerResult.rows[0],
      author: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        reputation: user.reputation,
      },
    }

    return NextResponse.json({ answer }, { status: 201 })
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    )
  }
}
