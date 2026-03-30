import { MetadataRoute } from 'next'
import { query } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fokoro.com'

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
  ]

  // Get all topics
  const topicsResult = await query(`SELECT slug, created_at FROM topics`)
  const topicPages: MetadataRoute.Sitemap = topicsResult.rows.map((topic) => ({
    url: `${baseUrl}/topic/${topic.slug}`,
    lastModified: new Date(topic.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Get all questions
  const questionsResult = await query(
    `SELECT slug, updated_at FROM questions ORDER BY updated_at DESC LIMIT 1000`
  )
  const questionPages: MetadataRoute.Sitemap = questionsResult.rows.map(
    (question) => ({
      url: `${baseUrl}/question/${question.slug}`,
      lastModified: new Date(question.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  )

  // Get all users with public profiles
  const usersResult = await query(
    `SELECT username, updated_at FROM users ORDER BY reputation DESC LIMIT 500`
  )
  const userPages: MetadataRoute.Sitemap = usersResult.rows.map((user) => ({
    url: `${baseUrl}/user/${user.username}`,
    lastModified: new Date(user.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...topicPages, ...questionPages, ...userPages]
}
