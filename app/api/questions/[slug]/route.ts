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
      `SELECT 
        q.id, q.title, q.slug, q.content, q.upvotes, q.downvotes, 
        q.answer_count, q.view_count, q.is_answered, q.created_at, q.updated_at,
        u.id as author_id, u.username as author_username, 
        u.display_name as author_display_name, u.avatar_url as author_avatar,
        u.reputation as author_reputation,
        t.id as topic_id, t.name as topic_name, t.slug as topic_slug,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'slug', tg.slug)
          ) FILTER (WHERE tg.id IS NOT NULL), '[]'
        ) as tags
      FROM questions q
      JOIN users u ON q.author_id = u.id
      LEFT JOIN topics t ON q.topic_id = t.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags tg ON qt.tag_id = tg.id
      WHERE q.slug = $1
      GROUP BY q.id, u.id, t.id`,
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
