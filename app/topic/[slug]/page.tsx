import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { query } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionCard } from '@/components/question-card'
import { Users, MessageSquare, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

async function getTopic(slug: string) {
  const result = await query(
    `SELECT id, name, slug, description, icon, question_count, follower_count, is_featured, created_at
     FROM topics 
     WHERE slug = $1`,
    [slug]
  )
  return result.rows[0] || null
}

async function getTopicQuestions(topicId: number, sort: string) {
  let orderBy = 'q.created_at DESC'
  if (sort === 'popular') {
    orderBy = '(q.upvotes - q.downvotes) DESC, q.answer_count DESC'
  } else if (sort === 'unanswered') {
    orderBy = 'q.created_at DESC'
  }

  const whereClause = sort === 'unanswered' ? 'AND q.answer_count = 0' : ''

  const result = await query(
    `SELECT 
      q.id, q.title, q.slug, q.content, q.upvotes, q.downvotes, 
      q.answer_count, q.view_count, q.is_answered, q.created_at,
      u.id as author_id, u.username as author_username, 
      u.display_name as author_display_name, u.avatar_url as author_avatar,
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
    WHERE q.topic_id = $1 ${whereClause}
    GROUP BY q.id, u.id, t.id
    ORDER BY ${orderBy}
    LIMIT 20`,
    [topicId]
  )

  return result.rows
}

async function getTopContributors(topicId: number) {
  const result = await query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url, u.reputation,
            COUNT(q.id) as question_count
     FROM users u
     JOIN questions q ON u.id = q.author_id
     WHERE q.topic_id = $1
     GROUP BY u.id
     ORDER BY question_count DESC, u.reputation DESC
     LIMIT 5`,
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
    title: `${topic.name} - Questions & Discussions`,
    description:
      topic.description ||
      `Explore questions and discussions about ${topic.name} on Fokoro`,
    openGraph: {
      title: `${topic.name} - Fokoro`,
      description:
        topic.description ||
        `Explore questions and discussions about ${topic.name}`,
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

  const [questions, topContributors] = await Promise.all([
    getTopicQuestions(topic.id, sort),
    getTopContributors(topic.id),
  ])

  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          {topic.icon && <span className="text-4xl">{topic.icon}</span>}
          <div>
            <h1 className="text-3xl font-bold">{topic.name}</h1>
            {topic.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {topic.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {formatNumber(topic.question_count)} questions
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {formatNumber(topic.follower_count)} followers
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <Tabs defaultValue={sort} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="latest" asChild>
                <Link href={`/topic/${slug}?sort=latest`}>Latest</Link>
              </TabsTrigger>
              <TabsTrigger value="popular" asChild>
                <Link href={`/topic/${slug}?sort=popular`}>Popular</Link>
              </TabsTrigger>
              <TabsTrigger value="unanswered" asChild>
                <Link href={`/topic/${slug}?sort=unanswered`}>Unanswered</Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={sort} className="space-y-4">
              {questions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No questions in this topic yet. Be the first to ask!
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/ask">Ask a Question</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No contributors yet
                </p>
              ) : (
                topContributors.map((user, index) => (
                  <Link
                    key={user.id}
                    href={`/user/${user.username}`}
                    className="flex items-center gap-3 hover:bg-accent p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {(user.display_name || user.username)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(user.reputation)} rep
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {user.question_count} Q
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Button asChild className="w-full">
            <Link href={`/ask?topic=${slug}`}>Ask in {topic.name}</Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}
