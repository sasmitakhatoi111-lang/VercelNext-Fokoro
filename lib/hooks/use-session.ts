'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import type { SessionUser } from '@/lib/types'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401) {
      return null
    }
    throw new Error('Failed to fetch session')
  }
  return res.json()
}

export function useSession() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<SessionUser | null>(
    '/api/auth/session',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    mutate(null)
    router.push('/')
    router.refresh()
  }

  return {
    user: data,
    isLoading,
    isError: error,
    logout,
    mutate,
  }
}
