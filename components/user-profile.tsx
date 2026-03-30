'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  HelpCircle,
  MessageSquare,
  Check,
  Award,
  ChevronUp,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime, formatNumber, truncate } from '@/lib/utils'

interface UserProfileProps {
  user: {
    id: number
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    location: string | null
    website: string | null
    reputation: number
    created_at: string
  }
  stats: {
    questionCount: number
    answerCount: number
    acceptedAnswerCount: number
  }
  questions: Array<{
    id: number
    title: string
    slug: string
    vote_count: number
    answer_count: number
    view_count: number
    is_answered: boolean
    created_at: string
  }>
  answers: Array<{
    id: number
    content: string
    vote_count: number
    is_accepted: boolean
    created_at: string
    question_title: string
    question_slug: string
  }>
  topicAuthorities: Array<{
    id: number
    name: string
    slug: string
    color: string | null
    authority_score: number
    answer_count: number
  }>
}

export function UserProfile({
  user,
  stats,
  questions,
  answers,
  topicAuthorities,
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('questions')
  const displayName = user.display_name || user.username

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatNumber(user.reputation)}
                  </p>
                  <p className="text-sm text-muted-foreground">reputation</p>
                </div>
              </div>

              {user.bio && (
                <p className="text-foreground mb-4">{user.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>{user.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatRelativeTime(user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm">Questions</span>
              </div>
              <p className="text-2xl font-bold">{stats.questionCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Answers</span>
              </div>
              <p className="text-2xl font-bold">{stats.answerCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Check className="h-4 w-4" />
                <span className="text-sm">Accepted</span>
              </div>
              <p className="text-2xl font-bold">{stats.acceptedAnswerCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="questions">
                    Questions ({stats.questionCount})
                  </TabsTrigger>
                  <TabsTrigger value="answers">
                    Answers ({stats.answerCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={activeTab}>
                <TabsContent value="questions" className="mt-0 space-y-3">
                  {questions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No questions yet
                    </p>
                  ) : (
                    questions.map((q) => (
                      <Link
                        key={q.id}
                        href={`/question/${q.slug}`}
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center text-sm text-muted-foreground min-w-[50px]">
                            <div className="flex items-center gap-1">
                              <ChevronUp className="h-3 w-3" />
                              <span>{q.vote_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{q.answer_count}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground hover:text-primary line-clamp-2">
                              {q.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(q.created_at)}
                            </p>
                          </div>
                          {q.is_answered && (
                            <Badge
                              variant="secondary"
                              className="bg-success/10 text-success shrink-0"
                            >
                              <Check className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="answers" className="mt-0 space-y-3">
                  {answers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No answers yet
                    </p>
                  ) : (
                    answers.map((a) => (
                      <Link
                        key={a.id}
                        href={`/question/${a.question_slug}`}
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center text-sm text-muted-foreground min-w-[50px]">
                            <div className="flex items-center gap-1">
                              <ChevronUp className="h-3 w-3" />
                              <span>{a.vote_count}</span>
                            </div>
                            {a.is_accepted && (
                              <Check className="h-4 w-4 text-success mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground hover:text-primary line-clamp-1">
                              {a.question_title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {truncate(a.content, 150)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(a.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {topicAuthorities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Topic Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topicAuthorities.map((ta) => (
                  <Link
                    key={ta.id}
                    href={`/topic/${ta.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: ta.color
                            ? `${ta.color}15`
                            : undefined,
                          color: ta.color || undefined,
                        }}
                      >
                        {ta.name}
                      </Badge>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{ta.authority_score}</p>
                      <p className="text-xs text-muted-foreground">
                        {ta.answer_count} answers
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
