'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface Topic {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

interface AskQuestionFormProps {
  topics: Topic[]
  tags: Tag[]
}

export function AskQuestionForm({ topics, tags }: AskQuestionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topicId, setTopicId] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  const handleAddTag = (tagId: string) => {
    const tag = tags.find((t) => t.id.toString() === tagId)
    if (tag && !selectedTags.find((t) => t.id === tag.id) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (title.length < 10) {
      toast.error('Title must be at least 10 characters')
      return
    }

    if (content.length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          topicId: topicId ? parseInt(topicId) : null,
          tagIds: selectedTags.map((t) => t.id),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Question posted successfully')
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

  const availableTags = tags.filter(
    (t) => !selectedTags.find((st) => st.id === t.id)
  )

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Question Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="What's your question? Be specific."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {title.length}/150 characters (minimum 10)
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Include all the information someone would need to answer your question..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {content.length} characters (minimum 20)
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a topic (optional)" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-1">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {selectedTags.length < 5 && (
            <Select onValueChange={handleAddTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags (up to 5)" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || title.length < 10 || content.length < 20}
        >
          {isSubmitting ? 'Posting...' : 'Post Question'}
        </Button>
      </div>
    </form>
  )
}
