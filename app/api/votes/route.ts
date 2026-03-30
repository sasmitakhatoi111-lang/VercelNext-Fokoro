import { NextRequest, NextResponse } from 'next/server'
import { query, withConnection } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentType, contentId, voteType } = body

    if (!['question', 'answer'].includes(contentType)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    const result = await withConnection(async (client) => {
      // Check existing vote
      const existingVote = await client.query(
        `SELECT id, vote_type FROM votes 
         WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
        [session.userId, contentType, contentId]
      )

      const table = contentType === 'question' ? 'questions' : 'answers'
      
      if (existingVote.rows.length > 0) {
        const existing = existingVote.rows[0]
        
        if (existing.vote_type === voteType) {
          // Remove vote
          await client.query(`DELETE FROM votes WHERE id = $1`, [existing.id])
          
          const column = voteType === 'up' ? 'upvotes' : 'downvotes'
          await client.query(
            `UPDATE ${table} SET ${column} = ${column} - 1 WHERE id = $1`,
            [contentId]
          )
          
          return { action: 'removed', voteType: null }
        } else {
          // Change vote
          await client.query(
            `UPDATE votes SET vote_type = $1 WHERE id = $2`,
            [voteType, existing.id]
          )
          
          const addColumn = voteType === 'up' ? 'upvotes' : 'downvotes'
          const removeColumn = voteType === 'up' ? 'downvotes' : 'upvotes'
          await client.query(
            `UPDATE ${table} SET ${addColumn} = ${addColumn} + 1, ${removeColumn} = ${removeColumn} - 1 WHERE id = $1`,
            [contentId]
          )
          
          return { action: 'changed', voteType }
        }
      } else {
        // New vote
        await client.query(
          `INSERT INTO votes (user_id, content_type, content_id, vote_type)
           VALUES ($1, $2, $3, $4)`,
          [session.userId, contentType, contentId, voteType]
        )
        
        const column = voteType === 'up' ? 'upvotes' : 'downvotes'
        await client.query(
          `UPDATE ${table} SET ${column} = ${column} + 1 WHERE id = $1`,
          [contentId]
        )
        
        return { action: 'added', voteType }
      }
    })

    return NextResponse.json({ success: true, ...result })
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ votes: {} })
    }

    const searchParams = request.nextUrl.searchParams
    const contentType = searchParams.get('contentType')
    const contentIds = searchParams.get('contentIds')?.split(',').map(Number)

    if (!contentType || !contentIds?.length) {
      return NextResponse.json({ votes: {} })
    }

    const placeholders = contentIds.map((_, i) => `$${i + 3}`).join(', ')
    const result = await query(
      `SELECT content_id, vote_type FROM votes 
       WHERE user_id = $1 AND content_type = $2 AND content_id IN (${placeholders})`,
      [session.userId, contentType, ...contentIds]
    )

    const votes: Record<number, string> = {}
    result.rows.forEach((row) => {
      votes[row.content_id] = row.vote_type
    })

    return NextResponse.json({ votes })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json({ votes: {} })
  }
}
