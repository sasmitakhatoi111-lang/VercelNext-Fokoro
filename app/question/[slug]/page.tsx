import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { QuestionDetail } from '@/components/question-detail'
import { AnswerList } from '@/components/answer-list'
import { AnswerForm } from '@/components/answer-form'
import { RelatedQuestions } from '@/components/related-questions'

interface Props {
  params: Promise<{ slug: string }>
}

async function getQuestion(slug: string) {
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

  return result.rows[0] || null
}

async function getRelatedQuestions(questionId: number, topicIds: number[]) {
  if (topicIds.length === 0) return []

  const placeholders = topicIds.map((_, i) => `$${i + 2}`).join(', ')
  const result = await query(
    `
    SELECT DISTINCT
      q.id,
      q.title,
      q.slug,
      q.answer_count,
      q.vote_count
    FROM questions q
    JOIN question_topics qt ON q.id = qt.question_id
    WHERE qt.topic_id IN (${placeholders})
    AND q.id != $1
    ORDER BY q.vote_count DESC
    LIMIT 5
  `,
    [questionId, ...topicIds]
  )

  return result.rows
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const question = await getQuestion(slug)

  if (!question) {
    return { title: 'Question Not Found' }
  }

  const description =
    question.content.slice(0, 160) + (question.content.length > 160 ? '...' : '')

  return {
    title: question.title,
    description,
    openGraph: {
      title: question.title,
      description,
      type: 'article',
      publishedTime: question.created_at,
      modifiedTime: question.updated_at,
      authors: [question.author.display_name || question.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: question.title,
      description,
    },
  }
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params
  const question = await getQuestion(slug)

  if (!question) {
    notFound()
  }

  // Increment view count
  await query(
    `UPDATE questions SET view_count = view_count + 1 WHERE slug = $1`,
    [slug]
  )

  const topicIds = question.topics.map((t: { id: number }) => t.id)
  const relatedQuestions = await getRelatedQuestions(question.id, topicIds)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QuestionDetail question={question} />
            <AnswerList questionSlug={slug} answerCount={question.answer_count} />
            <AnswerForm questionSlug={slug} />
          </div>
          <aside className="space-y-6">
            <RelatedQuestions questions={relatedQuestions} />
          </aside>
        </div>
      </div>
    </div>
  )
}
