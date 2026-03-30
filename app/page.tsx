import Link from 'next/link'
import { ArrowRight, TrendingUp, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestionCard } from '@/components/question-card'
import { query } from '@/lib/db'
import type { Question, Topic } from '@/lib/types'

async function getTrendingQuestions(): Promise<Question[]> {
  const result = await query(
    `SELECT 
      q.id, q.title, q.slug, q.description, q.view_count, q.answer_count, 
      q.vote_count, q.is_answered, q.created_at,
      json_build_object('id', u.id, 'username', u.username, 'display_name', u.display_name, 'avatar_url', u.avatar_url) as author,
      json_build_object('id', t.id, 'name', t.name, 'slug', t.slug) as topic
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN topics t ON q.topic_id = t.id
    ORDER BY (q.vote_count * 3 + q.answer_count * 5 + EXTRACT(EPOCH FROM (NOW() - q.created_at)) / -86400) DESC
    LIMIT 5`
  )
  return result.rows
}

async function getPopularTopics(): Promise<Topic[]> {
  const result = await query(
    `SELECT id, name, slug, description, question_count, follower_count
    FROM topics
    ORDER BY question_count DESC, follower_count DESC
    LIMIT 8`
  )
  return result.rows
}

async function getLatestQuestions(): Promise<Question[]> {
  const result = await query(
    `SELECT 
      q.id, q.title, q.slug, q.description, q.view_count, q.answer_count, 
      q.vote_count, q.is_answered, q.created_at,
      json_build_object('id', u.id, 'username', u.username, 'display_name', u.display_name, 'avatar_url', u.avatar_url) as author,
      json_build_object('id', t.id, 'name', t.name, 'slug', t.slug) as topic
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN topics t ON q.topic_id = t.id
    ORDER BY q.created_at DESC
    LIMIT 5`
  )
  return result.rows
}

export default async function HomePage() {
  const [trendingQuestions, popularTopics, latestQuestions] = await Promise.all([
    getTrendingQuestions(),
    getPopularTopics(),
    getLatestQuestions(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Get Answers to Your Questions
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
          Join our community of knowledge seekers and experts. Ask questions,
          share insights, and discover answers on any topic.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/ask">Ask a Question</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/community">
              Browse Community
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Trending Questions */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Questions
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/community?tab=explore">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {trendingQuestions.length > 0 ? (
                trendingQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No questions yet. Be the first to ask!</p>
                    <Button asChild className="mt-4">
                      <Link href="/ask">Ask a Question</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Latest Questions */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Clock className="h-5 w-5 text-primary" />
                Latest Questions
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/community?sort=newest">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {latestQuestions.length > 0 ? (
                latestQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No questions yet. Be the first to ask!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Popular Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Popular Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic) => (
                    <Link key={topic.id} href={`/topic/${topic.slug}`}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                      >
                        {topic.name}
                        <span className="ml-1 text-muted-foreground">
                          {topic.question_count}
                        </span>
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No topics available yet.
                </p>
              )}
              <Button asChild variant="link" className="mt-4 h-auto p-0">
                <Link href="/topics">
                  Browse all topics
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Join CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold">Join Fokoro Today</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create an account to ask questions, share your knowledge, and
                build your reputation.
              </p>
              <Button asChild className="w-full">
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 font-semibold">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {trendingQuestions.length > 0 ? '100+' : '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {popularTopics.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Topics</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
