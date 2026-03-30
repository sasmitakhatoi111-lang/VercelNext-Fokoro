import { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'
import { Users, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse all topics on Fokoro',
}

async function getTopics() {
  const result = await query(
    `
    SELECT 
      id,
      name,
      slug,
      description,
      icon,
      color,
      question_count,
      follower_count,
      is_featured
    FROM topics
    ORDER BY follower_count DESC, question_count DESC
  `
  )

  return result.rows
}

export default async function TopicsPage() {
  const topics = await getTopics()

  const featuredTopics = topics.filter((t) => t.is_featured)
  const otherTopics = topics.filter((t) => !t.is_featured)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Topics</h1>
          <p className="text-muted-foreground mt-2">
            Browse topics to discover questions and connect with experts
          </p>
        </div>

        {featuredTopics.length > 0 && (
          <section className="mb-8">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              Featured Topics
              <Badge variant="secondary" className="text-xs">Popular</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-semibold text-lg mb-4">All Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function TopicCard({
  topic,
}: {
  topic: {
    id: number
    name: string
    slug: string
    description: string | null
    icon: string | null
    color: string | null
    question_count: number
    follower_count: number
  }
}) {
  return (
    <Link href={`/topic/${topic.slug}`}>
      <Card className="h-full hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{
                backgroundColor: topic.color ? `${topic.color}20` : 'var(--muted)',
              }}
            >
              {topic.icon || topic.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{topic.name}</h3>
              {topic.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {topic.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  <span>{formatNumber(topic.question_count)} questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(topic.follower_count)} followers</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
