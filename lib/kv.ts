import { kv } from '@vercel/kv'

export { kv }

export function getPasteKey(id: string): string {
  return `paste:${id}`
}

/**
 * Timeout wrapper for KV operations to prevent hanging requests
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

