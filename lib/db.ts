import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

let pool: Pool | null = null
let signer: Signer | null = null

function getPool(): Pool {
  if (!pool) {
    signer = new Signer({
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN,
        clientConfig: { region: process.env.AWS_REGION },
      }),
      region: process.env.AWS_REGION,
      hostname: process.env.PGHOST,
      username: process.env.PGUSER || 'postgres',
      port: 5432,
    })

    pool = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASE || 'postgres',
      port: 5432,
      user: process.env.PGUSER || 'postgres',
      password: () => signer!.getAuthToken(),
      ssl: { rejectUnauthorized: false },
      max: 20,
    })
    attachDatabasePool(pool)
  }
  return pool
}

// Single query transactions
export async function query(text: string, params?: unknown[]) {
  const p = getPool()
  return p.query(text, params)
}

// Use for multi-query transactions
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const p = getPool()
  const client = await p.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

// Transaction helper
export async function withTransaction<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const p = getPool()
  const client = await p.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
