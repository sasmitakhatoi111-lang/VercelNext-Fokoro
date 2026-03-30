'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { useSession } from '@/lib/hooks/use-session'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import type { AnswerWithDetails } from '@/lib/types'

interface AnswerListProps {
  questionSlug: string
  answerCount: number
}

export function AnswerList({ questionSlug, answerCount }: AnswerListProps) {
  const { user } = useSession()
  const [answers, setAnswers] = useState<AnswerWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState<'votes' | 'newest' | 'oldest'>('votes')
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [votingId, setVotingId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchAnswers() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/questions/${questionSlug}/answers?sort=${sort}`)
        if (res.ok) {
          const data = await res.json()
          setAnswers(data.answers)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnswers()
  }, [questionSlug, sort])

  const handleVote = async (answerId: number, value: number) => {
    if (!user || votingId !== null) return

    setVotingId(answerId)
    const currentVote = votes[answerId] || 0
    const newValue = currentVote === value ? 0 : value

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'answer',
          targetId: answerId,
          value: newValue,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setVotes((prev) => ({ ...prev, [answerId]: data.userVote }))
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId ? { ...a, vote_count: data.voteCount } : a
          )
        )
      }
    } finally {
      setVotingId(null)
    }
  }

  if (answerCount === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No answers yet. Be the first to answer!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {answerCount} {answerCount === 1 ? 'Answer' : 'Answers'}
          </CardTitle>
          <Tabs value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <TabsList>
              <TabsTrigger value="votes">Votes</TabsTrigger>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="oldest">Oldest</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          answers.map((answer) => (
            <div
              key={answer.id}
              className={`flex gap-4 p-4 rounded-lg ${
                answer.is_accepted ? 'bg-success/5 border border-success/20' : 'bg-muted/30'
              }`}
            >
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    votes[answer.id] === 1 ? 'text-primary' : 'text-muted-foreground'
                  }
                  onClick={() => handleVote(answer.id, 1)}
                  disabled={!user || votingId === answer.id}
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <span className="font-semibold">{formatNumber(answer.vote_count)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    votes[answer.id] === -1 ? 'text-destructive' : 'text-muted-foreground'
                  }
                  onClick={() => handleVote(answer.id, -1)}
                  disabled={!user || votingId === answer.id}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                {answer.is_accepted && (
                  <div className="mt-2 text-success">
                    <Check className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {answer.is_accepted && (
                  <Badge variant="secondary" className="bg-success/10 text-success mb-3">
                    <Check className="h-3 w-3 mr-1" />
                    Accepted Answer
                  </Badge>
                )}
                <div className="prose prose-neutral dark:prose-invert max-w-none mb-4">
                  <p className="whitespace-pre-wrap">{answer.content}</p>
                </div>

                {/* Author and meta */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${answer.author.username}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={answer.author.avatar_url || undefined} />
                        <AvatarFallback>
                          {(answer.author.display_name || answer.author.username)
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                        href={`/user/${answer.author.username}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {answer.author.display_name || answer.author.username}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(answer.author.reputation)} reputation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(answer.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
