'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { QuestionCard } from '@/components/question-card'
import type { QuestionWithDetails } from '@/lib/types'

interface QuestionFeedProps {
  topicSlug?: string
  initialSort?: string
}

const LIMIT = 20

export function QuestionFeed({ topicSlug, initialSort = 'latest' }: QuestionFeedProps) {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [sort, setSort] = useState(initialSort)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true)
      setOffset(0)
      try {
        const params = new URLSearchParams({
          sort,
          limit: String(LIMIT),
          offset: '0',
        })
        if (topicSlug) {
          params.set('topic', topicSlug)
        }

        const res = await fetch(`/api/questions?${params}`)
        if (res.ok) {
          const data = await res.json()
          setQuestions(data.questions)
          setHasMore(data.questions.length === LIMIT)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [sort, topicSlug])

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const newOffset = offset + LIMIT

    try {
      const params = new URLSearchParams({
        sort,
        limit: String(LIMIT),
        offset: String(newOffset),
      })
      if (topicSlug) {
        params.set('topic', topicSlug)
      }

      const res = await fetch(`/api/questions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions((prev) => [...prev, ...data.questions])
        setOffset(newOffset)
        setHasMore(data.questions.length === LIMIT)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={sort} onValueChange={setSort}>
        <TabsList>
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No questions found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
