import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { CreatePasteRequest, Paste } from '@/types/paste'
import { getCurrentTime } from './utils'

export const createPasteSchema = z.object({
  content: z.string()
    .min(1, 'Content must be a non-empty string')
    .max(10 * 1024 * 1024, 'Content cannot exceed 10MB'), // 10MB limit
  ttl_seconds: z.number().int().min(1).max(31536000).optional(), // Max 1 year (365 days)
  max_views: z.number().int().min(1).max(1000000).optional(), // Max 1M views
})

export function generatePasteId(): string {
  return randomUUID()
}

export function calculateExpiresAt(ttlSeconds: number | undefined): string | null {
  if (!ttlSeconds) {
    return null
  }
  const now = getCurrentTime()
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)
  return expiresAt.toISOString()
}

export function isPasteExpired(paste: Paste): boolean {
  if (!paste.expiresAt) {
    return false
  }
  const now = getCurrentTime()
  const expiresAt = new Date(paste.expiresAt)
  return now >= expiresAt
}

export function isPasteViewLimitExceeded(paste: Paste): boolean {
  if (paste.maxViews === null) {
    return false
  }
  return paste.viewCount >= paste.maxViews
}

export function isPasteAvailable(paste: Paste): boolean {
  return !isPasteExpired(paste) && !isPasteViewLimitExceeded(paste)
}

export function validateCreatePasteRequest(
  body: unknown
): { success: true; data: CreatePasteRequest } | { success: false; error: string } {
  const result = createPasteSchema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Invalid input',
    }
  }
  return { success: true, data: result.data }
}

