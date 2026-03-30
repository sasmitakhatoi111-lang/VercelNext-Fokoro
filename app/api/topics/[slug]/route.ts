import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getCurrentUser()

    const result = await query(
      `
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.icon,
        t.color,
        t.question_count,
        t.follower_count,
        t.is_featured,
        t.created_at
      FROM topics t
      WHERE t.slug = $1
    `,
      [slug]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const topic = result.rows[0]

    // Check if user follows this topic
    let isFollowing = false
    if (user) {
      const followResult = await query(
        `SELECT 1 FROM topic_follows WHERE user_id = $1 AND topic_id = $2`,
        [user.id, topic.id]
      )
      isFollowing = followResult.rows.length > 0
    }

    // Get top contributors
    const contributorsResult = await query(
      `
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.reputation,
        ta.authority_score,
        ta.answer_count,
        ta.accepted_answer_count
      FROM topic_authorities ta
      JOIN users u ON ta.user_id = u.id
      WHERE ta.topic_id = $1
      ORDER BY ta.authority_score DESC
      LIMIT 5
    `,
      [topic.id]
    )

    return NextResponse.json({
      topic: {
        ...topic,
        isFollowing,
        topContributors: contributorsResult.rows,
      },
    })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}
