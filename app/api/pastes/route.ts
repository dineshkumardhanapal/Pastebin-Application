import { NextRequest, NextResponse } from 'next/server'
import { kv, getPasteKey } from '@/lib/kv'
import { validateCreatePasteRequest, generatePasteId, calculateExpiresAt } from '@/lib/paste'
import { getBaseUrl } from '@/lib/utils'
import type { Paste } from '@/types/paste'

export async function POST(request: NextRequest) {
  try {
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

    // Store in KV with TTL if provided
    if (ttl_seconds) {
      // Set KV TTL to match the paste TTL (in seconds)
      await kv.setex(key, ttl_seconds, JSON.stringify(paste))
    } else {
      await kv.set(key, JSON.stringify(paste))
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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

