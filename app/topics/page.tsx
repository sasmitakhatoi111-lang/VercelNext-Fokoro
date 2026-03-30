import { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, Users, Search } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Browse Topics',
  description: 'Explore all topics and find questions that interest you on Fokoro',
}

async function getTopics() {
  const result = await query(
    `SELECT id, name, slug, description, icon, question_count, follower_count, is_featured
     FROM topics
     ORDER BY is_featured DESC, follower_count DESC, question_count DESC`
  )
  return result.rows
}

export default async function TopicsPage() {
  const topics = await getTopics()

  const featuredTopics = topics.filter((t) => t.is_featured)
  const otherTopics = topics.filter((t) => !t.is_featured)

  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Topics</h1>
          <p className="text-muted-foreground mt-1">
            Explore all {topics.length} topics and find your interests
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search topics..." className="pl-9" />
        </div>
      </div>

      {featuredTopics.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Featured Topics</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTopics.map((topic) => (
              <Link key={topic.id} href={`/topic/${topic.slug}`}>
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {topic.icon && (
                        <span className="text-2xl">{topic.icon}</span>
                      )}
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {topic.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {formatNumber(topic.question_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatNumber(topic.follower_count)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">All Topics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {otherTopics.map((topic) => (
            <Link key={topic.id} href={`/topic/${topic.slug}`}>
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {topic.icon && <span className="text-xl">{topic.icon}</span>}
                    <h3 className="font-medium">{topic.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {formatNumber(topic.question_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {formatNumber(topic.follower_count)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
