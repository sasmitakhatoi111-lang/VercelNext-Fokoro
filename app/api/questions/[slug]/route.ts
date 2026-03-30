import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Increment view count
    await query(
      `UPDATE questions SET view_count = view_count + 1 WHERE slug = $1`,
      [slug]
    )

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
          'reputation', u.reputation,
          'bio', u.bio
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
      WHERE q.slug = $1
      GROUP BY q.id, u.id
    `,
      [slug]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ question: result.rows[0] })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}
