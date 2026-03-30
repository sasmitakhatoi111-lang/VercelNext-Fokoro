export interface User {
  id: number
  username: string
  email: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  reputation: number
  location: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  question_count: number
  follower_count: number
  is_featured: boolean
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at?: string
}

export interface Question {
  id: number
  title: string
  slug: string
  content: string
  author_id: number | null
  view_count: number
  answer_count: number
  vote_count: number
  is_answered: boolean
  accepted_answer_id: number | null
  created_at: string
  updated_at: string
}

export interface QuestionWithDetails extends Question {
  author: {
    id: number
    username: string
    display_name: string | null
    avatar_url: string | null
    reputation: number
    bio?: string | null
  }
  topics: Array<{
    id: number
    name: string
    slug: string
    color: string | null
  }>
  tags: Tag[]
}

export interface Answer {
  id: number
  content: string
  question_id: number
  author_id: number | null
  vote_count: number
  is_accepted: boolean
  created_at: string
  updated_at: string
}

export interface AnswerWithDetails extends Answer {
  author: {
    id: number
    username: string
    display_name: string | null
    avatar_url: string | null
    reputation: number
  }
}

export interface Vote {
  id: number
  user_id: number
  question_id: number | null
  answer_id: number | null
  vote_type: -1 | 1
  created_at: string
}

export interface TopicFollow {
  user_id: number
  topic_id: number
  created_at: string
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface QuestionPageData extends QuestionWithDetails {
  answers: AnswerWithDetails[]
  related_questions: Question[]
}

// Session/Auth types
export interface SessionUser {
  id: number
  username: string
  email: string
  display_name: string | null
  avatar_url: string | null
}

// Search types
export interface SearchResult {
  questions: Question[]
  topics: Topic[]
}

// Feed scoring formula: (Likes × 3) + (Answers × 5) + Recency
export type FeedTab = 'for-you' | 'following' | 'explore'
export type SortOption = 'trending' | 'newest' | 'most-answered' | 'unanswered'
