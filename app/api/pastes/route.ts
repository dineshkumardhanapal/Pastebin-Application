import { NextRequest, NextResponse } from 'next/server'
import { kv, getPasteKey, kvWithTimeout } from '@/lib/kv'
import { validateCreatePasteRequest, generatePasteId, calculateExpiresAt } from '@/lib/paste'
import { getBaseUrl } from '@/lib/utils'
import type { Paste } from '@/types/paste'

export async function POST(request: NextRequest) {
  try {
    // Check content length before parsing to prevent DoS
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Request body too large. Maximum size is 10MB.' },
        { status: 413 }
      )
    }

    const body = await request.json()
    const validation = validateCreatePasteRequest(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { content, ttl_seconds, max_views } = validation.data
    const id = generatePasteId()
    const expiresAt = calculateExpiresAt(ttl_seconds)
    const now = Date.now()

    const paste: Paste = {
      id,
      content,
      createdAt: now,
      ttlSeconds: ttl_seconds ?? null,
      maxViews: max_views ?? null,
      viewCount: 0,
      expiresAt,
    }

    const key = getPasteKey(id)
    const baseUrl = getBaseUrl()

    // Store in KV with TTL if provided (with timeout)
    try {
      if (ttl_seconds) {
        // Set Redis TTL to match the paste TTL (in seconds)
        await kvWithTimeout(
          () => kv.setex(key, ttl_seconds, JSON.stringify(paste)),
          5000
        )
      } else {
        await kvWithTimeout(
          () => kv.set(key, JSON.stringify(paste)),
          5000
        )
      }
    } catch (kvError) {
      console.error('Redis storage error:', kvError)
      return NextResponse.json(
        { error: 'Failed to create paste. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        id,
        url: `${baseUrl}/p/${id}`,
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Log error but don't expose details
    console.error('Error creating paste:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

