import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function GET() {
  try {
    // Test KV connection by performing a simple read operation
    // Getting a non-existent key returns null without error if KV is accessible
    await kv.get('__health_check__')
    
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
    // If KV is not accessible (e.g., missing env vars, connection error),
    // return ok: false but still 200 status as per requirements
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

