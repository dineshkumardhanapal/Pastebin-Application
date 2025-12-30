import { NextResponse } from 'next/server'
import { kv, kvWithTimeout } from '@/lib/kv'

export async function GET() {
  try {
    // Test Redis connection by performing a simple read operation with timeout
    // Getting a non-existent key returns null without error if Redis is accessible
    await kvWithTimeout(
      () => kv.get('__health_check__'),
      3000 // 3 second timeout for health check
    )
    
    // Return success response with explicit Content-Type
    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    // If Redis is not accessible (e.g., missing env vars, connection error, timeout),
    // return ok: false but still 200 status as per requirements
    console.error('Health check failed:', error)
    return NextResponse.json(
      { ok: false },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

