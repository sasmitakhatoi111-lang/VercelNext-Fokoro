'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Share2,
  Bookmark,
  Flag,
  CheckCircle2,
} from 'lucide-react'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { useSession } from '@/lib/hooks/use-session'
import { toast } from 'sonner'

interface QuestionDetailProps {
  question: {
    id: number
    title: string
    slug: string
    content: string
    upvotes: number
    downvotes: number
    answer_count: number
    view_count: number
    is_answered: boolean
    created_at: string
    updated_at: string
    author_id: number
    author_username: string
    author_display_name: string | null
    author_avatar: string | null
    author_reputation: number
    topic_id: number | null
    topic_name: string | null
    topic_slug: string | null
    tags: Array<{ id: number; name: string; slug: string }>
  }
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  const { user } = useSession()
  const [votes, setVotes] = useState({
    upvotes: question.upvotes,
    downvotes: question.downvotes,
    userVote: null as 'up' | 'down' | null,
  })

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please sign in to vote')
      return
    }

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'question',
          contentId: question.id,
          voteType,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setVotes((prev) => {
          const newVotes = { ...prev }

          if (data.action === 'removed') {
            if (voteType === 'up') newVotes.upvotes--
            else newVotes.downvotes--
            newVotes.userVote = null
          } else if (data.action === 'changed') {
            if (voteType === 'up') {
              newVotes.upvotes++
              newVotes.downvotes--
            } else {
              newVotes.downvotes++
              newVotes.upvotes--
            }
            newVotes.userVote = voteType
          } else {
            if (voteType === 'up') newVotes.upvotes++
            else newVotes.downvotes++
            newVotes.userVote = voteType
          }

          return newVotes
        })
      }
    } catch {
      toast.error('Failed to vote')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const score = votes.upvotes - votes.downvotes

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={votes.userVote === 'up' ? 'text-primary' : ''}
              onClick={() => handleVote('up')}
            >
              <ChevronUp className="h-6 w-6" />
            </Button>
            <span className="text-lg font-semibold">{formatNumber(score)}</span>
            <Button
              variant="ghost"
              size="icon"
              className={votes.userVote === 'down' ? 'text-destructive' : ''}
              onClick={() => handleVote('down')}
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {question.is_answered && (
                <Badge variant="default" className="bg-success text-success-foreground gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Answered
                </Badge>
              )}
              {question.topic_slug && (
                <Link href={`/topic/${question.topic_slug}`}>
                  <Badge variant="secondary">{question.topic_name}</Badge>
                </Link>
              )}
            </div>
            <h1 className="text-2xl font-bold text-balance leading-tight">
              {question.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {formatNumber(question.answer_count)} answers
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatNumber(question.view_count)} views
              </span>
              <span>Asked {formatRelativeTime(question.created_at)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed">{question.content}</p>
        </div>

        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Link key={tag.id} href={`/tag/${tag.slug}`}>
                <Badge variant="outline" className="hover:bg-accent">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
          <Link
            href={`/user/${question.author_username}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={question.author_avatar || undefined} />
              <AvatarFallback>
                {(question.author_display_name || question.author_username)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">
                {question.author_display_name || question.author_username}
              </p>
              <p className="text-muted-foreground">
                {formatNumber(question.author_reputation)} reputation
              </p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
