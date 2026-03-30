import Link from 'next/link'
import { MessageSquare, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Question } from '@/lib/types'

interface QuestionCardProps {
  question: Question
  className?: string
  showTopic?: boolean
}

export function QuestionCard({
  question,
  className,
  showTopic = true,
}: QuestionCardProps) {
  // Support both vote_count and upvotes/downvotes
  const voteScore = question.vote_count ?? (question.upvotes ?? 0) - (question.downvotes ?? 0)
  // Support both description and content
  const preview = question.description || question.content

  return (
    <Card
      className={cn(
        'transition-colors hover:bg-accent/30',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Stats sidebar */}
          <div className="hidden shrink-0 flex-col items-end gap-1 text-right text-sm sm:flex">
            <div
              className={cn(
                'flex items-center gap-1.5',
                voteScore > 0 ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="min-w-[2ch]">{voteScore}</span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1.5',
                question.is_answered
                  ? 'text-success'
                  : question.answer_count > 0
                    ? 'text-foreground'
                    : 'text-muted-foreground'
              )}
            >
              {question.is_answered ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              <span className="min-w-[2ch]">{question.answer_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="min-w-[2ch]">{question.view_count}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Topic badge */}
            {showTopic && question.topic && (
              <Link
                href={`/topic/${question.topic.slug}`}
                className="mb-2 inline-block"
              >
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {question.topic.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h3 className="mb-2 line-clamp-2 text-base font-medium leading-snug">
              <Link
                href={`/question/${question.slug}`}
                className="hover:text-primary transition-colors"
              >
                {question.title}
              </Link>
            </h3>

            {/* Description preview */}
            {preview && (
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                {preview}
              </p>
            )}

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {/* Author */}
              {question.author && (question.author.display_name || question.author.username) && (
                <Link
                  href={`/user/${question.author.username}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={question.author.avatar_url || undefined}
                      alt={question.author.display_name || question.author.username || 'User'}
                    />
                    <AvatarFallback className="text-[10px]">
                      {(question.author.display_name || question.author.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {question.author.display_name || question.author.username}
                  </span>
                </Link>
              )}

              {/* Time */}
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(question.created_at)}
              </span>

              {/* Mobile stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {voteScore}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {question.answer_count}
                </span>
              </div>
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {question.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
