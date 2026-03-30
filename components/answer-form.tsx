'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from '@/lib/hooks/use-session'
import { toast } from 'sonner'
import Link from 'next/link'

interface AnswerFormProps {
  questionSlug: string
}

export function AnswerForm({ questionSlug }: AnswerFormProps) {
  const { user, isLoading } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('Please write an answer')
      return
    }

    if (content.length < 20) {
      toast.error('Answer must be at least 20 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/questions/${questionSlug}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Answer posted successfully')
        setContent('')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to post answer')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">
            Sign in to answer this question
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write your answer here... Be specific and include details that will help the person asking."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {content.length} characters (minimum 20)
            </p>
            <Button type="submit" disabled={isSubmitting || content.length < 20}>
              {isSubmitting ? 'Posting...' : 'Post Your Answer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
