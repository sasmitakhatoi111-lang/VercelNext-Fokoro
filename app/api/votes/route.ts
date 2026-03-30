import { NextRequest, NextResponse } from 'next/server'
import { query, withConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetType, targetId, value } = body

    if (!['question', 'answer'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
    }

    if (![-1, 0, 1].includes(value)) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 })
    }

    const result = await withConnection(async (client) => {
      // Check for existing vote
      const existingVote = await client.query(
        `SELECT id, value FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
        [user.id, targetType, targetId]
      )

      let voteChange = value
      const table = targetType === 'question' ? 'questions' : 'answers'

      if (existingVote.rows.length > 0) {
        const oldValue = existingVote.rows[0].value
        voteChange = value - oldValue

        if (value === 0) {
          // Remove vote
          await client.query(`DELETE FROM votes WHERE id = $1`, [
            existingVote.rows[0].id,
          ])
        } else {
          // Update vote
          await client.query(`UPDATE votes SET value = $1 WHERE id = $2`, [
            value,
            existingVote.rows[0].id,
          ])
        }
      } else if (value !== 0) {
        // Create new vote
        await client.query(
          `INSERT INTO votes (user_id, target_type, target_id, value) VALUES ($1, $2, $3, $4)`,
          [user.id, targetType, targetId, value]
        )
      }

      // Update vote count
      if (voteChange !== 0) {
        await client.query(
          `UPDATE ${table} SET vote_count = vote_count + $1 WHERE id = $2`,
          [voteChange, targetId]
        )

        // Update author reputation
        const targetResult = await client.query(
          `SELECT author_id FROM ${table} WHERE id = $1`,
          [targetId]
        )
        if (targetResult.rows.length > 0) {
          const reputationChange = voteChange * (value > 0 ? 10 : -2)
          await client.query(
            `UPDATE users SET reputation = GREATEST(1, reputation + $1) WHERE id = $2`,
            [reputationChange, targetResult.rows[0].author_id]
          )
        }
      }

      // Get new vote count
      const countResult = await client.query(
        `SELECT vote_count FROM ${table} WHERE id = $1`,
        [targetId]
      )

      return {
        voteCount: countResult.rows[0]?.vote_count || 0,
        userVote: value,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ votes: {} })
    }

    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('targetType')
    const targetIds = searchParams.get('targetIds')?.split(',').map(Number)

    if (!targetType || !targetIds || targetIds.length === 0) {
      return NextResponse.json({ votes: {} })
    }

    const placeholders = targetIds.map((_, i) => `$${i + 3}`).join(', ')
    const result = await query(
      `SELECT target_id, value FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id IN (${placeholders})`,
      [user.id, targetType, ...targetIds]
    )

    const votes: Record<number, number> = {}
    for (const row of result.rows) {
      votes[row.target_id] = row.value
    }

    return NextResponse.json({ votes })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json({ votes: {} })
  }
}
