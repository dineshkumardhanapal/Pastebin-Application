import { headers } from 'next/headers'

/**
 * Get current time, respecting TEST_MODE and x-test-now-ms header
 * When TEST_MODE=1, uses the x-test-now-ms header value as current time
 * Falls back to system time if header is absent
 */
export function getCurrentTime(): Date {
  const testMode = process.env.TEST_MODE === '1'
  
  if (testMode) {
    try {
      const headersList = headers()
      const testNowMs = headersList.get('x-test-now-ms')
      
      if (testNowMs) {
        const timestamp = parseInt(testNowMs, 10)
        if (!isNaN(timestamp)) {
          return new Date(timestamp)
        }
      }
    } catch (error) {
      // If headers() fails (e.g., not in a request context), fall through to system time
    }
  }
  
  return new Date()
}

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Get base URL for the application
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  return 'http://localhost:3000'
}

