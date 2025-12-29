import { NextRequest, NextResponse } from 'next/server'
import { kv, getPasteKey, kvWithTimeout } from '@/lib/kv'
import { isPasteAvailable, isPasteExpired, isPasteViewLimitExceeded } from '@/lib/paste'
import type { Paste, GetPasteResponse } from '@/types/paste'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const key = getPasteKey(id)

    // Fetch paste from KV with timeout
    const pasteData = await kvWithTimeout(
      () => kv.get<string>(key),
      5000 // 5 second timeout
    )

    if (!pasteData) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    let paste: Paste
    try {
      paste = JSON.parse(pasteData)
      // Validate paste structure
      if (!paste.id || typeof paste.content !== 'string' || typeof paste.viewCount !== 'number') {
        console.error('Invalid paste structure:', { id: paste?.id })
        return NextResponse.json(
          { error: 'Paste not found' },
          { status: 404 }
        )
      }
    } catch (parseError) {
      console.error('Failed to parse paste data:', parseError)
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    // Check if paste is expired or view limit exceeded BEFORE incrementing
    if (isPasteExpired(paste) || isPasteViewLimitExceeded(paste)) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    // ATOMIC INCREMENT: Use Redis INCR for atomic view counting
    const viewCountKey = `${key}:views`
    let newViewCount: number
    
    try {
      // Try atomic increment first (kv.incr returns a Promise<number>)
      newViewCount = await kvWithTimeout(
        async () => {
          const result = await kv.incr(viewCountKey)
          return typeof result === 'number' ? result : Number(result)
        },
        5000
      )
      
      // If this is the first view, initialize the counter
      if (newViewCount === 1 && paste.viewCount === 0) {
        // Set expiry on the counter if paste has TTL
        if (paste.expiresAt) {
          const expiresAt = new Date(paste.expiresAt)
          const now = new Date()
          const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
          if (ttlSeconds > 0) {
            await kv.expire(viewCountKey, ttlSeconds)
          }
        }
      }
      
      // Update view count in paste object
      paste.viewCount = newViewCount
      
      // Update the paste with new view count (with timeout)
      await kvWithTimeout(
        () => kv.set(key, JSON.stringify(paste)),
        5000
      )
    } catch (kvError) {
      // Fallback to non-atomic increment if INCR fails
      console.warn('Atomic increment failed, using fallback:', kvError)
      paste.viewCount += 1
      await kvWithTimeout(
        () => kv.set(key, JSON.stringify(paste)),
        5000
      )
      newViewCount = paste.viewCount
    }

    // Check again after incrementing (in case we just hit the limit)
    if (!isPasteAvailable(paste)) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    const response: GetPasteResponse = {
      content: paste.content,
      remaining_views: paste.maxViews === null ? null : Math.max(0, paste.maxViews - newViewCount),
      expires_at: paste.expiresAt,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Log error but don't expose details
    console.error('Error fetching paste:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

