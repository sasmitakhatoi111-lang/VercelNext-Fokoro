import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionCard } from '@/components/question-card'
import {
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { formatNumber, formatRelativeTime } from '@/lib/utils'

interface Props {
  params: Promise<{ username: string }>
}

async function getUser(username: string) {
  const result = await query(
    `SELECT id, username, email, display_name, avatar_url, bio, reputation,
            question_count, answer_count, created_at
     FROM users WHERE username = $1`,
    [username]
  )
  return result.rows[0] || null
}

async function getUserQuestions(userId: number) {
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
    WHERE q.author_id = $1
    GROUP BY q.id, u.id, t.id
    ORDER BY q.created_at DESC
    LIMIT 20`,
    [userId]
  )
  return result.rows
}

async function getUserAnswers(userId: number) {
  const result = await query(
    `SELECT 
      a.id, a.content, a.upvotes, a.downvotes, a.is_accepted, a.created_at,
      q.id as question_id, q.title as question_title, q.slug as question_slug
     FROM answers a
     JOIN questions q ON a.question_id = q.id
     WHERE a.author_id = $1
     ORDER BY a.created_at DESC
     LIMIT 20`,
    [userId]
  )
  return result.rows
}

async function getUserTopTopics(userId: number) {
  const result = await query(
    `SELECT t.id, t.name, t.slug, COUNT(q.id) as count
     FROM topics t
     JOIN questions q ON t.id = q.topic_id
     WHERE q.author_id = $1
     GROUP BY t.id
     ORDER BY count DESC
     LIMIT 5`,
    [userId]
  )
  return result.rows
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    return { title: 'User Not Found' }
  }

  const displayName = user.display_name || user.username

  return {
    title: `${displayName} - Profile`,
    description:
      user.bio || `View ${displayName}'s questions and answers on Fokoro`,
    openGraph: {
      title: `${displayName} - Fokoro`,
      description:
        user.bio || `View ${displayName}'s questions and answers on Fokoro`,
    },
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    notFound()
  }

  const [questions, answers, topTopics] = await Promise.all([
    getUserQuestions(user.id),
    getUserAnswers(user.id),
    getUserTopTopics(user.id),
  ])

  const displayName = user.display_name || user.username

  return (
    <div className="container max-w-5xl py-6 lg:py-10">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              {user.bio && <p className="mt-2">{user.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {formatNumber(user.reputation)} reputation
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {formatNumber(user.question_count)} questions
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {formatNumber(user.answer_count)} answers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatRelativeTime(user.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <Tabs defaultValue="questions">
            <TabsList className="mb-4">
              <TabsTrigger value="questions">
                Questions ({questions.length})
              </TabsTrigger>
              <TabsTrigger value="answers">
                Answers ({answers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              {questions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No questions yet
                  </CardContent>
                </Card>
              ) : (
                questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              )}
            </TabsContent>

            <TabsContent value="answers" className="space-y-4">
              {answers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No answers yet
                  </CardContent>
                </Card>
              ) : (
                answers.map((answer) => (
                  <Card key={answer.id}>
                    <CardContent className="pt-4">
                      <a
                        href={`/question/${answer.question_slug}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {answer.question_title}
                      </a>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {answer.content}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>
                          Score: {answer.upvotes - answer.downvotes}
                        </span>
                        {answer.is_accepted && (
                          <Badge variant="default" className="bg-success text-success-foreground text-xs">
                            Accepted
                          </Badge>
                        )}
                        <span>{formatRelativeTime(answer.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside>
          {topTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topTopics.map((topic) => (
                  <a
                    key={topic.id}
                    href={`/topic/${topic.slug}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-accent transition-colors"
                  >
                    <span className="text-sm">{topic.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
