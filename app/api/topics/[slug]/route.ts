import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const result = await query(
      `SELECT id, name, slug, description, icon, question_count, follower_count, is_featured, created_at
       FROM topics
       WHERE slug = $1`,
      [slug]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Get top contributors for this topic
    const contributors = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.reputation,
              COUNT(q.id) as question_count, 
              COALESCE(SUM(q.upvotes - q.downvotes), 0) as total_score
       FROM users u
       JOIN questions q ON u.id = q.author_id
       JOIN topics t ON q.topic_id = t.id
       WHERE t.slug = $1
       GROUP BY u.id
       ORDER BY total_score DESC, question_count DESC
       LIMIT 5`,
      [slug]
    )

    return NextResponse.json({
      topic: result.rows[0],
      topContributors: contributors.rows,
    })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}
