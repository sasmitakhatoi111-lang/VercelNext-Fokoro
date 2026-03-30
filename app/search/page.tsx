import { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionCard } from '@/components/question-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, Users } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search questions, topics, and users on Fokoro',
}

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>
}

async function searchQuestions(searchQuery: string) {
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
    LEFT JOIN question_tags qt ON q.question_id = qt.question_id
    LEFT JOIN tags tg ON qt.tag_id = tg.id
    WHERE q.title ILIKE $1 OR q.content ILIKE $1
    GROUP BY q.id, u.id, t.id
    ORDER BY (q.upvotes - q.downvotes) DESC, q.view_count DESC
    LIMIT 20`,
    [`%${searchQuery}%`]
  )
  return result.rows
}

async function searchTopics(searchQuery: string) {
  const result = await query(
    `SELECT id, name, slug, description, icon, question_count, follower_count
     FROM topics
     WHERE name ILIKE $1 OR description ILIKE $1
     ORDER BY follower_count DESC
     LIMIT 20`,
    [`%${searchQuery}%`]
  )
  return result.rows
}

async function searchUsers(searchQuery: string) {
  const result = await query(
    `SELECT id, username, display_name, avatar_url, bio, reputation, answer_count
     FROM users
     WHERE username ILIKE $1 OR display_name ILIKE $1
     ORDER BY reputation DESC
     LIMIT 20`,
    [`%${searchQuery}%`]
  )
  return result.rows
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', type = 'questions' } = await searchParams

  let questions: Awaited<ReturnType<typeof searchQuestions>> = []
  let topics: Awaited<ReturnType<typeof searchTopics>> = []
  let users: Awaited<ReturnType<typeof searchUsers>> = []

  if (q) {
    if (type === 'questions') {
      questions = await searchQuestions(q)
    } else if (type === 'topics') {
      topics = await searchTopics(q)
    } else if (type === 'users') {
      users = await searchUsers(q)
    }
  }

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <form action="/search" method="GET">
          <input type="hidden" name="type" value={type} />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search questions, topics, or users..."
              defaultValue={q}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </form>
      </div>

      <Tabs defaultValue={type} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="questions" asChild>
            <Link href={`/search?q=${encodeURIComponent(q)}&type=questions`}>
              Questions
            </Link>
          </TabsTrigger>
          <TabsTrigger value="topics" asChild>
            <Link href={`/search?q=${encodeURIComponent(q)}&type=topics`}>
              Topics
            </Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <Link href={`/search?q=${encodeURIComponent(q)}&type=users`}>
              Users
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {!q ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Enter a search term to find questions
              </CardContent>
            </Card>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions found for &quot;{q}&quot;
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          {!q ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Enter a search term to find topics
              </CardContent>
            </Card>
          ) : topics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No topics found for &quot;{q}&quot;
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/topic/${topic.slug}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.icon && <span className="text-xl">{topic.icon}</span>}
                        <h3 className="font-medium">{topic.name}</h3>
                      </div>
                      {topic.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {topic.description}
                        </p>
                      )}
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
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {!q ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Enter a search term to find users
              </CardContent>
            </Card>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No users found for &quot;{q}&quot;
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {users.map((user) => (
                <Link key={user.id} href={`/user/${user.username}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {(user.display_name || user.username)
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {user.display_name || user.username}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {formatNumber(user.reputation)} rep
                        </Badge>
                      </div>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
