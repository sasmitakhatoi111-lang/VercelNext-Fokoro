import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { TopicHeader } from '@/components/topic-header'
import { QuestionFeed } from '@/components/question-feed'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

async function getTopic(slug: string) {
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

  return result.rows[0] || null
}

async function getTopContributors(topicId: number) {
  const result = await query(
    `
    SELECT 
      u.id,
      u.username,
      u.display_name,
      u.avatar_url,
      u.reputation,
      ta.authority_score,
      ta.answer_count
    FROM topic_authorities ta
    JOIN users u ON ta.user_id = u.id
    WHERE ta.topic_id = $1
    ORDER BY ta.authority_score DESC
    LIMIT 5
  `,
    [topicId]
  )

  return result.rows
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const topic = await getTopic(slug)

  if (!topic) {
    return { title: 'Topic Not Found' }
  }

  return {
    title: `${topic.name} Questions`,
    description:
      topic.description ||
      `Browse questions and answers about ${topic.name} on Fokoro`,
    openGraph: {
      title: `${topic.name} - Fokoro`,
      description:
        topic.description ||
        `Browse questions and answers about ${topic.name}`,
    },
  }
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { sort = 'latest' } = await searchParams
  const topic = await getTopic(slug)

  if (!topic) {
    notFound()
  }

  const topContributors = await getTopContributors(topic.id)

  return (
    <div className="min-h-screen bg-background">
      <TopicHeader topic={topic} topContributors={topContributors} />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <QuestionFeed topicSlug={slug} initialSort={sort} />
      </div>
    </div>
  )
}
