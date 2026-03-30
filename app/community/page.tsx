import { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { QuestionCard } from '@/components/question-card'
import { TrendingUp, Users, Flame } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Explore the Fokoro community - discover trending questions, top users, and active discussions.',
}

interface Props {
  searchParams: Promise<{ tab?: string }>
}

async function getForYouQuestions() {
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
    GROUP BY q.id, u.id, t.id
    ORDER BY (q.upvotes - q.downvotes) * 0.5 + q.view_count * 0.3 + q.answer_count * 0.2 DESC,
             q.created_at DESC
    LIMIT 20`
  )
  return result.rows
}

async function getTrendingQuestions() {
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
    WHERE q.created_at > NOW() - INTERVAL '7 days'
    GROUP BY q.id, u.id, t.id
    ORDER BY q.view_count DESC, (q.upvotes - q.downvotes) DESC
    LIMIT 20`
  )
  return result.rows
}

async function getFollowingQuestions() {
  // For now, just return latest since we don't have follow data
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
    GROUP BY q.id, u.id, t.id
    ORDER BY q.created_at DESC
    LIMIT 20`
  )
  return result.rows
}

async function getTopUsers() {
  const result = await query(
    `SELECT id, username, display_name, avatar_url, reputation, answer_count
     FROM users
     ORDER BY reputation DESC
     LIMIT 10`
  )
  return result.rows
}

async function getHotTopics() {
  const result = await query(
    `SELECT t.id, t.name, t.slug, t.icon,
            COUNT(q.id) as recent_questions
     FROM topics t
     JOIN questions q ON t.id = q.topic_id
     WHERE q.created_at > NOW() - INTERVAL '7 days'
     GROUP BY t.id
     ORDER BY recent_questions DESC
     LIMIT 8`
  )
  return result.rows
}

export default async function CommunityPage({ searchParams }: Props) {
  const { tab = 'foryou' } = await searchParams

  const [forYouQuestions, trendingQuestions, followingQuestions, topUsers, hotTopics] =
    await Promise.all([
      getForYouQuestions(),
      getTrendingQuestions(),
      getFollowingQuestions(),
      getTopUsers(),
      getHotTopics(),
    ])

  const questionsMap = {
    foryou: forYouQuestions,
    trending: trendingQuestions,
    following: followingQuestions,
  }

  const currentQuestions = questionsMap[tab as keyof typeof questionsMap] || forYouQuestions

  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Discover questions and connect with the community
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <Tabs defaultValue={tab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="foryou" asChild>
                <Link href="/community?tab=foryou">For You</Link>
              </TabsTrigger>
              <TabsTrigger value="trending" asChild>
                <Link href="/community?tab=trending">
                  <Flame className="h-4 w-4 mr-1" />
                  Trending
                </Link>
              </TabsTrigger>
              <TabsTrigger value="following" asChild>
                <Link href="/community?tab=following">Following</Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="space-y-4">
              {currentQuestions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No questions to show. Follow topics or users to see content here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                currentQuestions.map((question) => (
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
                Hot Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hotTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hot topics</p>
              ) : (
                hotTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.slug}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-accent transition-colors"
                  >
                    <span className="text-sm flex items-center gap-2">
                      {topic.icon && <span>{topic.icon}</span>}
                      {topic.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.recent_questions} new
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topUsers.map((user, index) => (
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
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
