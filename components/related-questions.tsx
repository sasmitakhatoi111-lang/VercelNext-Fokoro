import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Eye } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface RelatedQuestion {
  id: number
  title: string
  slug: string
  answer_count: number
  view_count: number
}

interface RelatedQuestionsProps {
  questions: RelatedQuestion[]
}

export function RelatedQuestions({ questions }: RelatedQuestionsProps) {
  if (questions.length === 0) {
    return null
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-base">Related Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question) => (
          <Link
            key={question.id}
            href={`/question/${question.slug}`}
            className="block group"
          >
            <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {question.title}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {formatNumber(question.answer_count)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(question.view_count)}
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
