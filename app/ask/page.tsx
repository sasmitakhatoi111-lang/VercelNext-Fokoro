import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { AskQuestionForm } from '@/components/ask-question-form'

export const metadata: Metadata = {
  title: 'Ask a Question',
  description: 'Ask a question and get answers from the Fokoro community',
}

async function getTopics() {
  const result = await query(
    `SELECT id, name, slug, color FROM topics ORDER BY follower_count DESC LIMIT 20`
  )
  return result.rows
}

export default async function AskPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/ask')
  }

  const topics = await getTopics()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Ask a Question</h1>
          <p className="text-muted-foreground mt-2">
            Get help from the community by asking a clear, detailed question
          </p>
        </div>

        <AskQuestionForm topics={topics} />
      </div>
    </div>
  )
}
