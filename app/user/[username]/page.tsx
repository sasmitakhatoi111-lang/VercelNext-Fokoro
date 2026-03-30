import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { UserProfile } from '@/components/user-profile'

interface Props {
  params: Promise<{ username: string }>
}

async function getUser(username: string) {
  const result = await query(
    `
    SELECT 
      id,
      username,
      email,
      display_name,
      avatar_url,
      bio,
      location,
      website,
      reputation,
      created_at
    FROM users
    WHERE username = $1
  `,
    [username]
  )

  return result.rows[0] || null
}

async function getUserStats(userId: number) {
  const [questionsResult, answersResult, acceptedResult] = await Promise.all([
    query(`SELECT COUNT(*) as count FROM questions WHERE author_id = $1`, [userId]),
    query(`SELECT COUNT(*) as count FROM answers WHERE author_id = $1`, [userId]),
    query(`SELECT COUNT(*) as count FROM answers WHERE author_id = $1 AND is_accepted = true`, [userId]),
  ])

  return {
    questionCount: parseInt(questionsResult.rows[0].count),
    answerCount: parseInt(answersResult.rows[0].count),
    acceptedAnswerCount: parseInt(acceptedResult.rows[0].count),
  }
}

async function getUserQuestions(userId: number) {
  const result = await query(
    `
    SELECT 
      q.id,
      q.title,
      q.slug,
      q.vote_count,
      q.answer_count,
      q.view_count,
      q.is_answered,
      q.created_at
    FROM questions q
    WHERE q.author_id = $1
    ORDER BY q.created_at DESC
    LIMIT 10
  `,
    [userId]
  )

  return result.rows
}

async function getUserAnswers(userId: number) {
  const result = await query(
    `
    SELECT 
      a.id,
      a.content,
      a.vote_count,
      a.is_accepted,
      a.created_at,
      q.title as question_title,
      q.slug as question_slug
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.author_id = $1
    ORDER BY a.created_at DESC
    LIMIT 10
  `,
    [userId]
  )

  return result.rows
}

async function getTopicAuthorities(userId: number) {
  const result = await query(
    `
    SELECT 
      t.id,
      t.name,
      t.slug,
      t.color,
      ta.authority_score,
      ta.answer_count
    FROM topic_authorities ta
    JOIN topics t ON ta.topic_id = t.id
    WHERE ta.user_id = $1
    ORDER BY ta.authority_score DESC
    LIMIT 5
  `,
    [userId]
  )

  return result.rows
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    return { title: 'User Not Found' }
  }

  const displayName = user.display_name || user.username

  return {
    title: `${displayName} - Profile`,
    description: user.bio || `View ${displayName}'s profile on Fokoro`,
    openGraph: {
      title: `${displayName} - Fokoro`,
      description: user.bio || `View ${displayName}'s questions and answers`,
    },
  }
}

export default async function UserPage({ params }: Props) {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    notFound()
  }

  const [stats, questions, answers, topicAuthorities] = await Promise.all([
    getUserStats(user.id),
    getUserQuestions(user.id),
    getUserAnswers(user.id),
    getTopicAuthorities(user.id),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <UserProfile
          user={user}
          stats={stats}
          questions={questions}
          answers={answers}
          topicAuthorities={topicAuthorities}
        />
      </div>
    </div>
  )
}
