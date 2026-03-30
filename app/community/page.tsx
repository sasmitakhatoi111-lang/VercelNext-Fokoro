import { Metadata } from 'next'
import { QuestionFeed } from '@/components/question-feed'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Browse questions from the Fokoro community',
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tab?: string }>
}) {
  const { sort = 'latest' } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground mt-2">
            Discover questions and answers from our community
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <QuestionFeed initialSort={sort} />
      </div>
    </div>
  )
}
