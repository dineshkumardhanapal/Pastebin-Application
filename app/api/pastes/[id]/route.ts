import { NextRequest, NextResponse } from 'next/server'
import { kv, getPasteKey } from '@/lib/kv'
import { isPasteAvailable, isPasteExpired, isPasteViewLimitExceeded } from '@/lib/paste'
import type { Paste, GetPasteResponse } from '@/types/paste'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const key = getPasteKey(id)

    // Fetch paste from KV
    const pasteData = await kv.get<string>(key)

    if (!pasteData) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    const paste: Paste = JSON.parse(pasteData)

    // Check if paste is expired or view limit exceeded
    if (isPasteExpired(paste) || isPasteViewLimitExceeded(paste)) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    // Increment view count atomically
    paste.viewCount += 1
    await kv.set(key, JSON.stringify(paste))

    // Check again after incrementing (in case we just hit the limit)
    if (!isPasteAvailable(paste)) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    const response: GetPasteResponse = {
      content: paste.content,
      remaining_views: paste.maxViews === null ? null : Math.max(0, paste.maxViews - paste.viewCount),
      expires_at: paste.expiresAt,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

