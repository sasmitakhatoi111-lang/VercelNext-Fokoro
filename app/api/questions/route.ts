import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'latest'
    const topicSlug = searchParams.get('topic')
    const tagSlug = searchParams.get('tag')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    let orderBy = 'q.created_at DESC'
    if (sort === 'trending') {
      orderBy = 'q.view_count DESC, q.created_at DESC'
    } else if (sort === 'popular') {
      orderBy = '(q.upvotes - q.downvotes) DESC, q.answer_count DESC'
    }

    let whereClause = ''
    const params: unknown[] = []
    let paramIndex = 1

    if (topicSlug) {
      whereClause = `WHERE t.slug = $${paramIndex}`
      params.push(topicSlug)
      paramIndex++
    }

    if (tagSlug) {
      whereClause = whereClause
        ? `${whereClause} AND EXISTS (SELECT 1 FROM question_tags qt2 JOIN tags tg ON qt2.tag_id = tg.id WHERE qt2.question_id = q.id AND tg.slug = $${paramIndex})`
        : `WHERE EXISTS (SELECT 1 FROM question_tags qt2 JOIN tags tg ON qt2.tag_id = tg.id WHERE qt2.question_id = q.id AND tg.slug = $${paramIndex})`
      params.push(tagSlug)
      paramIndex++
    }

    const result = await query(
      `SELECT 
        q.id, q.title, q.slug, q.content, q.upvotes, q.downvotes, 
        q.answer_count, q.view_count, q.is_answered, q.created_at,
        u.id as author_id, u.username as author_username, 
        u.display_name as author_display_name, u.avatar_url as author_avatar,
        t.id as topic_id, t.name as topic_name, t.slug as topic_slug,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'slug', tg.slug)
          ) FILTER (WHERE tg.id IS NOT NULL), '[]'
        ) as tags
      FROM questions q
      JOIN users u ON q.author_id = u.id
      LEFT JOIN topics t ON q.topic_id = t.id
      LEFT JOIN question_tags qt ON q.question_id = qt.question_id
      LEFT JOIN tags tg ON qt.tag_id = tg.id
      ${whereClause}
      GROUP BY q.id, u.id, t.id
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({ questions: result.rows })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, topicId, tagIds } = body

    if (!title || title.length < 10) {
      return NextResponse.json(
        { error: 'Title must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!content || content.length < 20) {
      return NextResponse.json(
        { error: 'Content must be at least 20 characters' },
        { status: 400 }
      )
    }

    const slug = slugify(title) + '-' + Date.now().toString(36)

    const result = await query(
      `INSERT INTO questions (title, slug, content, author_id, topic_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, slug`,
      [title, slug, content, session.userId, topicId || null]
    )

    const questionId = result.rows[0].id

    // Add tags
    if (tagIds && tagIds.length > 0) {
      const tagValues = tagIds
        .map((_: number, i: number) => `($1, $${i + 2})`)
        .join(', ')
      await query(
        `INSERT INTO question_tags (question_id, tag_id) VALUES ${tagValues}`,
        [questionId, ...tagIds]
      )
    }

    // Update user question count
    await query(
      `UPDATE users SET question_count = question_count + 1 WHERE id = $1`,
      [session.userId]
    )

    return NextResponse.json({
      success: true,
      question: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
