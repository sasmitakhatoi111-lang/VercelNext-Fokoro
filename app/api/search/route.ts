import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ questions: [], topics: [] })
    }

    const searchTerm = `%${q.trim()}%`

    // Search questions
    const questionsResult = await query(
      `SELECT 
        q.id, q.title, q.slug, q.description, q.view_count, q.answer_count, 
        q.vote_count, q.is_answered, q.created_at,
        json_build_object('id', u.id, 'username', u.username, 'display_name', u.display_name, 'avatar_url', u.avatar_url) as author,
        json_build_object('id', t.id, 'name', t.name, 'slug', t.slug) as topic
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN topics t ON q.topic_id = t.id
      WHERE q.title ILIKE $1 OR q.description ILIKE $1
      ORDER BY 
        CASE WHEN q.title ILIKE $2 THEN 1 ELSE 2 END,
        q.vote_count DESC,
        q.created_at DESC
      LIMIT $3`,
      [searchTerm, `${q.trim()}%`, limit]
    )

    // Search topics
    const topicsResult = await query(
      `SELECT id, name, slug, description, question_count, follower_count
      FROM topics
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY 
        CASE WHEN name ILIKE $2 THEN 1 ELSE 2 END,
        question_count DESC
      LIMIT $3`,
      [searchTerm, `${q.trim()}%`, limit]
    )

    return NextResponse.json({
      questions: questionsResult.rows,
      topics: topicsResult.rows,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'An error occurred during search' },
      { status: 500 }
    )
  }
}
