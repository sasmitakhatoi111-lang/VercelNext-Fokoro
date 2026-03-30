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

  return result.rows[0] || null
}

async function getAnswers(questionId: number) {
  const result = await query(
    `SELECT 
      a.id, a.content, a.upvotes, a.downvotes, a.is_accepted, 
      a.created_at, a.updated_at,
      u.id as author_id, u.username as author_username, 
      u.display_name as author_display_name, u.avatar_url as author_avatar,
      u.reputation as author_reputation
    FROM answers a
    JOIN users u ON a.author_id = u.id
    WHERE a.question_id = $1
    ORDER BY a.is_accepted DESC, (a.upvotes - a.downvotes) DESC, a.created_at ASC`,
    [questionId]
  )

  return result.rows
}

async function getRelatedQuestions(questionId: number, topicId: number | null) {
  const result = await query(
    `SELECT q.id, q.title, q.slug, q.answer_count, q.view_count
     FROM questions q
     WHERE q.id != $1 
     ${topicId ? 'AND q.topic_id = $2' : ''}
     ORDER BY q.view_count DESC
     LIMIT 5`,
    topicId ? [questionId, topicId] : [questionId]
  )

  return result.rows
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const question = await getQuestion(slug)

  if (!question) {
    return { title: 'Question Not Found' }
  }

  const description = question.content.substring(0, 160)

  return {
    title: question.title,
    description,
    openGraph: {
      title: question.title,
      description,
      type: 'article',
      authors: [question.author_display_name || question.author_username],
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
    `UPDATE questions SET view_count = view_count + 1 WHERE id = $1`,
    [question.id]
  )

  const [answers, relatedQuestions] = await Promise.all([
    getAnswers(question.id),
    getRelatedQuestions(question.id, question.topic_id),
  ])

  return (
    <div className="container max-w-5xl py-6 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <QuestionDetail question={question} />
          <AnswerList answers={answers} questionId={question.id} />
          <AnswerForm questionSlug={slug} />
        </div>
        <aside className="hidden lg:block">
          <RelatedQuestions questions={relatedQuestions} />
        </aside>
      </div>
    </div>
  )
}
