import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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

    // Get topic ID
    const topicResult = await query(`SELECT id FROM topics WHERE slug = $1`, [
      slug,
    ])

    if (topicResult.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const topicId = topicResult.rows[0].id

    // Add follow
    await query(
      `INSERT INTO topic_follows (user_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, topicId]
    )

    // Update follower count
    await query(
      `UPDATE topics SET follower_count = (SELECT COUNT(*) FROM topic_follows WHERE topic_id = $1) WHERE id = $1`,
      [topicId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error following topic:', error)
    return NextResponse.json(
      { error: 'Failed to follow topic' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // Get topic ID
    const topicResult = await query(`SELECT id FROM topics WHERE slug = $1`, [
      slug,
    ])

    if (topicResult.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const topicId = topicResult.rows[0].id

    // Remove follow
    await query(
      `DELETE FROM topic_follows WHERE user_id = $1 AND topic_id = $2`,
      [user.id, topicId]
    )

    // Update follower count
    await query(
      `UPDATE topics SET follower_count = (SELECT COUNT(*) FROM topic_follows WHERE topic_id = $1) WHERE id = $1`,
      [topicId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing topic:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow topic' },
      { status: 500 }
    )
  }
}
