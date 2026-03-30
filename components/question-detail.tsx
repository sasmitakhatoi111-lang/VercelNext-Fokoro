'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, MessageSquare, Eye, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from '@/lib/hooks/use-session'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import type { QuestionWithDetails } from '@/lib/types'

interface QuestionDetailProps {
  question: QuestionWithDetails
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  const { user } = useSession()
  const [voteCount, setVoteCount] = useState(question.vote_count)
  const [userVote, setUserVote] = useState(0)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (value: number) => {
    if (!user) return
    if (isVoting) return

    setIsVoting(true)
    const newValue = userVote === value ? 0 : value

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'question',
          targetId: question.id,
          value: newValue,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setVoteCount(data.voteCount)
        setUserVote(data.userVote)
      }
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={userVote === 1 ? 'text-primary' : 'text-muted-foreground'}
              onClick={() => handleVote(1)}
              disabled={!user || isVoting}
            >
              <ChevronUp className="h-6 w-6" />
            </Button>
            <span className="text-lg font-semibold">{formatNumber(voteCount)}</span>
            <Button
              variant="ghost"
              size="icon"
              className={userVote === -1 ? 'text-destructive' : 'text-muted-foreground'}
              onClick={() => handleVote(-1)}
              disabled={!user || isVoting}
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-foreground leading-tight text-balance">
                {question.title}
              </h1>
              {question.is_answered && (
                <Badge variant="secondary" className="bg-success/10 text-success shrink-0">
                  <Check className="h-3 w-3 mr-1" />
                  Answered
                </Badge>
              )}
            </div>

            {/* Topics and Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.topics.map((topic) => (
                <Link key={topic.id} href={`/topic/${topic.slug}`}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-accent cursor-pointer"
                    style={{
                      backgroundColor: topic.color ? `${topic.color}15` : undefined,
                      color: topic.color || undefined,
                    }}
                  >
                    {topic.name}
                  </Badge>
                </Link>
              ))}
              {question.tags.map((tag) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Question content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
              <p className="whitespace-pre-wrap">{question.content}</p>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{question.answer_count} answers</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{formatNumber(question.view_count)} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Asked {formatRelativeTime(question.created_at)}</span>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Link href={`/user/${question.author.username}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={question.author.avatar_url || undefined} />
                  <AvatarFallback>
                    {(question.author.display_name || question.author.username)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  href={`/user/${question.author.username}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {question.author.display_name || question.author.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(question.author.reputation)} reputation
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
