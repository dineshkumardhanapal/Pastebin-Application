import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { kv } from '@/lib/kv'

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute per IP

export async function middleware(request: NextRequest) {
  // Skip rate limiting for health check
  if (request.nextUrl.pathname === '/api/healthz') {
    return NextResponse.next()
  }

  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.ip ?? 
             request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
             request.headers.get('x-real-ip') ?? 
             'unknown'

  // Create rate limit key (resets every minute)
  const timeWindow = Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW)
  const rateLimitKey = `rate_limit:${ip}:${timeWindow}`

  try {
    // Increment counter atomically
    const count = await kv.incr(rateLimitKey)
    
    // Set expiry on first request (60 seconds)
    if (count === 1) {
      await kv.expire(rateLimitKey, RATE_LIMIT_WINDOW)
    }

    // Check if limit exceeded
    if (count > RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': RATE_LIMIT_WINDOW.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - count).toString())
    response.headers.set('X-RateLimit-Reset', ((timeWindow + 1) * RATE_LIMIT_WINDOW).toString())
    
    return response
  } catch (error) {
    // If rate limiting fails, allow request but log error
    // This prevents rate limiting from breaking the app
    console.error('Rate limiting error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/api/pastes/:path*',
    '/api/healthz',
  ],
}

