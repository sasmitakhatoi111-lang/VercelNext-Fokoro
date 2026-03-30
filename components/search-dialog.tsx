'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileQuestion, Tag, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Question, Topic } from '@/lib/types'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResults {
  questions: Question[]
  topics: Topic[]
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({
    questions: [],
    topics: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const totalResults = results.questions.length + results.topics.length

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ questions: [], topics: [] })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch {
      // Silently handle errors
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, search])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults({ questions: [], topics: [] })
      setSelectedIndex(0)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, totalResults - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault()
      const allItems = [
        ...results.questions.map((q) => ({ type: 'question' as const, item: q })),
        ...results.topics.map((t) => ({ type: 'topic' as const, item: t })),
      ]
      const selected = allItems[selectedIndex]
      if (selected) {
        if (selected.type === 'question') {
          router.push(`/q/${selected.item.slug}`)
        } else {
          router.push(`/t/${selected.item.slug}`)
        }
        onOpenChange(false)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <VisuallyHidden>
          <DialogTitle>Search Fokoro</DialogTitle>
        </VisuallyHidden>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search questions and topics..."
              className="border-0 bg-transparent px-4 py-6 text-base shadow-none focus-visible:ring-0"
              autoFocus
            />
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </form>

        {(results.questions.length > 0 || results.topics.length > 0) && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.questions.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Questions
                </div>
                {results.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => {
                      router.push(`/q/${question.slug}`)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                      selectedIndex === index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <FileQuestion className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-1">{question.title}</span>
                  </button>
                ))}
              </div>
            )}

            {results.topics.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Topics
                </div>
                {results.topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      router.push(`/t/${topic.slug}`)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                      selectedIndex === results.questions.length + index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-1">{topic.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {query && !isLoading && totalResults === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </div>
        )}

        <div className="border-t p-2 text-xs text-muted-foreground">
          <span className="flex items-center justify-center gap-2">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to search
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
