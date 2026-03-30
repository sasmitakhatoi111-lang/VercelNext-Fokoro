'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, HelpCircle, Bell, BellOff, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/lib/hooks/use-session'
import { formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

interface TopicHeaderProps {
  topic: {
    id: number
    name: string
    slug: string
    description: string | null
    icon: string | null
    color: string | null
    question_count: number
    follower_count: number
    is_featured: boolean
  }
  topContributors: Array<{
    id: number
    username: string
    display_name: string | null
    avatar_url: string | null
    reputation: number
    authority_score: number
    answer_count: number
  }>
}

export function TopicHeader({ topic, topContributors }: TopicHeaderProps) {
  const { user } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(topic.follower_count)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (!user) {
      toast.error('Sign in to follow topics')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/topics/${topic.slug}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      })

      if (res.ok) {
        setIsFollowing(!isFollowing)
        setFollowerCount((prev) => prev + (isFollowing ? -1 : 1))
        toast.success(isFollowing ? 'Unfollowed topic' : 'Following topic')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="border-b"
      style={{
        background: topic.color
          ? `linear-gradient(180deg, ${topic.color}10 0%, transparent 100%)`
          : undefined,
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Topic icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{
              backgroundColor: topic.color ? `${topic.color}20` : 'var(--muted)',
            }}
          >
            {topic.icon || topic.name.charAt(0)}
          </div>

          {/* Topic info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {topic.name}
                  {topic.is_featured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                </h1>
              </div>
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                onClick={handleFollow}
                disabled={isLoading}
                className="shrink-0"
              >
                {isFollowing ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>

            {topic.description && (
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {topic.description}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>{formatNumber(topic.question_count)}</strong>{' '}
                  <span className="text-muted-foreground">questions</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>{formatNumber(followerCount)}</strong>{' '}
                  <span className="text-muted-foreground">followers</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top contributors */}
        {topContributors.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <h2 className="font-medium text-sm">Top Contributors</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {topContributors.map((contributor, index) => (
                <Link
                  key={contributor.id}
                  href={`/user/${contributor.username}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contributor.avatar_url || undefined} />
                      <AvatarFallback>
                        {(contributor.display_name || contributor.username)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <span
                        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : index === 1
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {contributor.display_name || contributor.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contributor.answer_count} answers
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
