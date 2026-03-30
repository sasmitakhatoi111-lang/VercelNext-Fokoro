import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import type { QuestionWithDetails } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'latest'
    const topic = searchParams.get('topic')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    let orderBy = 'q.created_at DESC'
    if (sort === 'popular') {
      orderBy = 'q.view_count DESC, q.vote_count DESC'
    } else if (sort === 'trending') {
      orderBy = `
        (q.vote_count + q.answer_count * 2) / 
        GREATEST(1, EXTRACT(EPOCH FROM (NOW() - q.created_at)) / 3600) DESC
      `
    } else if (sort === 'unanswered') {
      orderBy = 'q.created_at DESC'
    }

    let whereClause = ''
    const params: (string | number)[] = []
    let paramIndex = 1

    if (topic) {
      whereClause = `
        WHERE q.id IN (
          SELECT qt.question_id FROM question_topics qt
          JOIN topics t ON qt.topic_id = t.id
          WHERE t.slug = $${paramIndex}
        )
      `
      params.push(topic)
      paramIndex++
    }

    if (sort === 'unanswered') {
      whereClause = whereClause
        ? `${whereClause} AND q.answer_count = 0`
        : 'WHERE q.answer_count = 0'
    }

    const result = await query(
      `
      SELECT 
        q.id,
        q.title,
        q.slug,
        q.content,
        q.vote_count,
        q.answer_count,
        q.view_count,
        q.is_answered,
        q.created_at,
        q.updated_at,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'display_name', u.display_name,
          'avatar_url', u.avatar_url,
          'reputation', u.reputation
        ) as author,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'slug', t.slug,
              'color', t.color
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as topics,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tg.id,
              'name', tg.name,
              'slug', tg.slug
            )
          ) FILTER (WHERE tg.id IS NOT NULL),
          '[]'
        ) as tags
      FROM questions q
      JOIN users u ON q.author_id = u.id
      LEFT JOIN question_topics qt ON q.id = qt.question_id
      LEFT JOIN topics t ON qt.topic_id = t.id
      LEFT JOIN question_tags qtg ON q.id = qtg.question_id
      LEFT JOIN tags tg ON qtg.tag_id = tg.id
      ${whereClause}
      GROUP BY q.id, u.id
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
      [...params, limit, offset]
    )

    const questions: QuestionWithDetails[] = result.rows

    return NextResponse.json({ questions })
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, topicIds, tagNames } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const slug = slugify(title) + '-' + Date.now().toString(36)

    // Create the question
    const questionResult = await query(
      `
      INSERT INTO questions (title, slug, content, author_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, slug, content, vote_count, answer_count, view_count, is_answered, created_at
    `,
      [title, slug, content, user.id]
    )

    const question = questionResult.rows[0]

    // Add topics
    if (topicIds && topicIds.length > 0) {
      const topicValues = topicIds
        .map((_: number, i: number) => `($1, $${i + 2})`)
        .join(', ')
      await query(
        `INSERT INTO question_topics (question_id, topic_id) VALUES ${topicValues}`,
        [question.id, ...topicIds]
      )
    }

    // Add tags (create if they don't exist)
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const tagSlug = slugify(tagName)
        const tagResult = await query(
          `
          INSERT INTO tags (name, slug)
          VALUES ($1, $2)
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `,
          [tagName, tagSlug]
        )
        await query(
          `INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [question.id, tagResult.rows[0].id]
        )
      }
    }

    // Update user reputation
    await query(`UPDATE users SET reputation = reputation + 2 WHERE id = $1`, [
      user.id,
    ])

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
