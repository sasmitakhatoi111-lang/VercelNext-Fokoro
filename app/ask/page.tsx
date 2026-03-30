import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { AskQuestionForm } from '@/components/ask-question-form'

export const metadata: Metadata = {
  title: 'Ask a Question',
  description: 'Ask a question and get answers from the Fokoro community',
}

async function getTopics() {
  const result = await query(
    `SELECT id, name, slug FROM topics ORDER BY name`
  )
  return result.rows
}

async function getTags() {
  const result = await query(
    `SELECT id, name, slug FROM tags ORDER BY usage_count DESC LIMIT 50`
  )
  return result.rows
}

export default async function AskPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirect=/ask')
  }

  const [topics, tags] = await Promise.all([getTopics(), getTags()])

  return (
    <div className="container max-w-3xl py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ask a Question</h1>
        <p className="text-muted-foreground mt-2">
          Get help from the community by asking a clear, specific question.
        </p>
      </div>
      <AskQuestionForm topics={topics} tags={tags} />
    </div>
  )
}
