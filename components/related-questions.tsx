import Link from 'next/link'
import { MessageSquare, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RelatedQuestion {
  id: number
  title: string
  slug: string
  answer_count: number
  vote_count: number
}

interface RelatedQuestionsProps {
  questions: RelatedQuestion[]
}

export function RelatedQuestions({ questions }: RelatedQuestionsProps) {
  if (questions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Related Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => (
          <Link
            key={question.id}
            href={`/question/${question.slug}`}
            className="block group"
          >
            <div className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center text-xs text-muted-foreground min-w-[40px]">
                <div className="flex items-center gap-0.5">
                  <ChevronUp className="h-3 w-3" />
                  <span>{question.vote_count}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" />
                  <span>{question.answer_count}</span>
                </div>
              </div>
              <p className="text-sm text-foreground group-hover:text-primary line-clamp-2">
                {question.title}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
