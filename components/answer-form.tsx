'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useSession } from '@/lib/hooks/use-session'
import { toast } from 'sonner'

interface AnswerFormProps {
  questionSlug: string
}

export function AnswerForm({ questionSlug }: AnswerFormProps) {
  const router = useRouter()
  const { user, isLoading: sessionLoading } = useSession()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.trim().length < 10) {
      toast.error('Answer must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/questions/${questionSlug}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (res.ok) {
        toast.success('Answer posted successfully!')
        setContent('')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to post answer')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sessionLoading) {
    return null
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">
            Sign in to share your answer
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write your answer here... Be specific and include details that will help others understand your solution."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {content.length} characters (minimum 10)
            </p>
            <Button type="submit" disabled={isSubmitting || content.trim().length < 10}>
              {isSubmitting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Answer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
