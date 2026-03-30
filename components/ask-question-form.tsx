'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, Tag, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

interface Topic {
  id: number
  name: string
  slug: string
  color: string | null
}

interface AskQuestionFormProps {
  topics: Topic[]
}

export function AskQuestionForm({ topics }: AskQuestionFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : prev.length < 3
        ? [...prev, topicId]
        : prev
    )
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (title.trim().length < 10) {
      toast.error('Title must be at least 10 characters')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter the question details')
      return
    }

    if (content.trim().length < 30) {
      toast.error('Question details must be at least 30 characters')
      return
    }

    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          topicIds: selectedTopics,
          tagNames: tags,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Question posted successfully!')
        router.push(`/question/${data.question.slug}`)
      } else {
        toast.error(data.error || 'Failed to post question')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Your Question
          </CardTitle>
          <CardDescription>
            Be specific and imagine you&apos;re asking a question to another person
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="e.g., How do I implement authentication in Next.js?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific and summarize your question in one sentence
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="content">Details</FieldLabel>
              <Textarea
                id="content"
                placeholder="Provide all the details someone would need to answer your question. Include what you've tried and what you expected to happen."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {content.length} characters (minimum 30)
              </p>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>
            Select up to 3 topics that best describe your question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge
                key={topic.id}
                variant={selectedTopics.includes(topic.id) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                style={{
                  backgroundColor: selectedTopics.includes(topic.id)
                    ? topic.color || undefined
                    : topic.color
                    ? `${topic.color}15`
                    : undefined,
                  borderColor: topic.color || undefined,
                  color: selectedTopics.includes(topic.id)
                    ? 'white'
                    : topic.color || undefined,
                }}
                onClick={() => handleTopicToggle(topic.id)}
              >
                {topic.name}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {selectedTopics.length}/3 topics selected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </CardTitle>
          <CardDescription>
            Add up to 5 tags to help others find your question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={tags.length >= 5}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner className="h-4 w-4 mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Post Question
        </Button>
      </div>
    </form>
  )
}
