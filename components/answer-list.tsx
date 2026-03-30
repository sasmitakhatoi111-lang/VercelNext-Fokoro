'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Share2,
  Flag,
} from 'lucide-react'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { useSession } from '@/lib/hooks/use-session'
import { toast } from 'sonner'

interface Answer {
  id: number
  content: string
  upvotes: number
  downvotes: number
  is_accepted: boolean
  created_at: string
  updated_at: string
  author_id: number
  author_username: string
  author_display_name: string | null
  author_avatar: string | null
  author_reputation: number
}

interface AnswerListProps {
  answers: Answer[]
  questionId: number
}

export function AnswerList({ answers: initialAnswers, questionId }: AnswerListProps) {
  const { user } = useSession()
  const [answers, setAnswers] = useState(initialAnswers)
  const [sortBy, setSortBy] = useState('votes')
  const [votedAnswers, setVotedAnswers] = useState<Record<number, 'up' | 'down' | null>>({})

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.is_accepted !== b.is_accepted) return a.is_accepted ? -1 : 1
    if (sortBy === 'votes') {
      return b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    }
    if (sortBy === 'latest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const handleVote = async (answerId: number, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please sign in to vote')
      return
    }

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'answer',
          contentId: answerId,
          voteType,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setAnswers((prev) =>
          prev.map((answer) => {
            if (answer.id !== answerId) return answer

            const currentVote = votedAnswers[answerId]
            let newUpvotes = answer.upvotes
            let newDownvotes = answer.downvotes

            if (data.action === 'removed') {
              if (voteType === 'up') newUpvotes--
              else newDownvotes--
            } else if (data.action === 'changed') {
              if (voteType === 'up') {
                newUpvotes++
                newDownvotes--
              } else {
                newDownvotes++
                newUpvotes--
              }
            } else {
              if (voteType === 'up') newUpvotes++
              else newDownvotes++
            }

            return { ...answer, upvotes: newUpvotes, downvotes: newDownvotes }
          })
        )

        setVotedAnswers((prev) => ({
          ...prev,
          [answerId]: data.voteType,
        }))
      }
    } catch {
      toast.error('Failed to vote')
    }
  }

  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No answers yet. Be the first to answer this question!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Highest score</SelectItem>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedAnswers.map((answer) => {
        const score = answer.upvotes - answer.downvotes
        const userVote = votedAnswers[answer.id]

        return (
          <Card
            key={answer.id}
            className={answer.is_accepted ? 'border-success' : ''}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={userVote === 'up' ? 'text-primary' : ''}
                    onClick={() => handleVote(answer.id, 'up')}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold">{formatNumber(score)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={userVote === 'down' ? 'text-destructive' : ''}
                    onClick={() => handleVote(answer.id, 'down')}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                  {answer.is_accepted && (
                    <CheckCircle2 className="h-6 w-6 text-success mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  {answer.is_accepted && (
                    <Badge variant="default" className="bg-success text-success-foreground mb-2">
                      Accepted Answer
                    </Badge>
                  )}
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {answer.content}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
                <Link
                  href={`/user/${answer.author_username}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={answer.author_avatar || undefined} />
                    <AvatarFallback>
                      {(answer.author_display_name || answer.author_username)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {answer.author_display_name || answer.author_username}
                  </span>
                  <span className="text-muted-foreground">
                    answered {formatRelativeTime(answer.created_at)}
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
