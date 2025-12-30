import { createClient } from 'redis'

// Create Redis client
// Supports both Redis URL and individual connection parameters
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL
  
  if (!redisUrl) {
    throw new Error('REDIS_URL or KV_URL environment variable is required')
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error('Redis reconnection failed after 10 retries')
          return new Error('Redis connection failed')
        }
        return Math.min(retries * 100, 3000)
      },
      connectTimeout: 5000,
    },
  })

  // Handle connection errors
  client.on('error', (err: Error) => {
    console.error('Redis Client Error:', err)
  })

  return client
}

// Create singleton Redis client instance for serverless environments
// In serverless, connections are reused across invocations
let redisClient: ReturnType<typeof createRedisClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createRedisClient()
  }
  
  // Ensure connection is open (for serverless, connection may be closed)
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect()
    } catch (error) {
      // If connection fails, try creating a new client
      if (redisClient.isOpen) {
        await redisClient.quit().catch(() => {})
      }
      redisClient = createRedisClient()
      await redisClient.connect()
    }
  }
  
  return redisClient
}

// Export a wrapper object that matches the previous API
export const kv = {
  async get<T = string>(key: string): Promise<T | null> {
    const client = await getRedisClient()
    const value = await client.get(key)
    return value as T | null
  },

  async set(key: string, value: string): Promise<void> {
    const client = await getRedisClient()
    await client.set(key, value)
  },

  async setex(key: string, seconds: number, value: string): Promise<void> {
    const client = await getRedisClient()
    await client.setEx(key, seconds, value)
  },

  async incr(key: string): Promise<number> {
    const client = await getRedisClient()
    return await client.incr(key)
  },

  async expire(key: string, seconds: number): Promise<boolean> {
    const client = await getRedisClient()
    return await client.expire(key, seconds)
  },
}

export function getPasteKey(id: string): string {
  return `paste:${id}`
}

/**
 * Timeout wrapper for Redis operations to prevent hanging requests
 */
export async function kvWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
  })

  return Promise.race([operation(), timeoutPromise])
}

