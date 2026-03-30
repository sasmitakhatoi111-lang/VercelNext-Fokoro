export interface User {
  id: number
  username: string
  email: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  reputation: number
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  question_count: number
  follower_count: number
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface Question {
  id: number
  title: string
  slug: string
  content?: string | null
  description?: string | null
  user_id?: number | null
  author_id?: number | null
  topic_id: number | null
  view_count: number
  answer_count: number
  vote_count?: number
  upvotes?: number
  downvotes?: number
  is_answered: boolean
  accepted_answer_id?: number | null
  created_at: string
  updated_at?: string
  // Joined fields
  author?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  topic?: Pick<Topic, 'id' | 'name' | 'slug'>
  tags?: Tag[]
  user_vote?: number | null
}

export interface Answer {
  id: number
  content: string
  question_id: number
  user_id: number | null
  vote_count: number
  is_accepted: boolean
  created_at: string
  updated_at: string
  // Joined fields
  author?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url' | 'reputation'>
  user_vote?: number | null
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

export interface QuestionWithDetails extends Question {
  author: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  topic: Pick<Topic, 'id' | 'name' | 'slug'>
  tags: Tag[]
}

export interface QuestionPageData extends QuestionWithDetails {
  answers: Answer[]
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
