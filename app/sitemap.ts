import { MetadataRoute } from 'next'
import { query } from '@/lib/db'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fokoro.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // Get all topics
  const topics = await query(
    `SELECT slug, created_at FROM topics ORDER BY follower_count DESC LIMIT 100`
  )
  const topicPages: MetadataRoute.Sitemap = topics.rows.map((topic) => ({
    url: `${baseUrl}/topic/${topic.slug}`,
    lastModified: new Date(topic.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Get recent questions
  const questions = await query(
    `SELECT slug, updated_at FROM questions ORDER BY created_at DESC LIMIT 1000`
  )
  const questionPages: MetadataRoute.Sitemap = questions.rows.map((q) => ({
    url: `${baseUrl}/question/${q.slug}`,
    lastModified: new Date(q.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Get active users
  const users = await query(
    `SELECT username, updated_at FROM users 
     WHERE question_count > 0 OR answer_count > 0
     ORDER BY reputation DESC LIMIT 500`
  )
  const userPages: MetadataRoute.Sitemap = users.rows.map((user) => ({
    url: `${baseUrl}/user/${user.username}`,
    lastModified: new Date(user.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...topicPages, ...questionPages, ...userPages]
}
