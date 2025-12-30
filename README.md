# Pastebin Application

A simple pastebin-like application built with Next.js that allows users to create text pastes and share them via URLs. Pastes can optionally have time-based expiry (TTL) and view count limits.

## Features

- Create text pastes with optional constraints:
  - Time-to-live (TTL) in seconds (max: 1 year)
  - Maximum view count (max: 1,000,000)
- Share pastes via unique URLs
- View pastes via HTML page or API endpoint
- Automatic cleanup when constraints are triggered
- Deterministic time support for testing
- **Security Features**:
  - Rate limiting (100 requests/minute per IP)
  - Input size limits (10MB maximum)
  - Comprehensive security headers
  - Atomic view counting (prevents race conditions)
  - Request timeouts (5 seconds)

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Redis** for persistence (via `redis` package)
- **Zod** for input validation

## Prerequisites

- Node.js 18+ installed
- A Redis database (Redis Cloud, Upstash, or self-hosted)
- npm or yarn package manager

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pastebin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   REDIS_URL=redis://your-redis-host:6379
   ```
   
   Or if you prefer using `KV_URL` (for backward compatibility):
   ```env
   KV_URL=redis://your-redis-host:6379
   ```
   
   For local development with a Redis instance:
   ```env
   REDIS_URL=redis://localhost:6379
   ```
   
   For Redis with authentication:
   ```env
   REDIS_URL=redis://:password@your-redis-host:6379
   ```
   
   For Redis Cloud, Upstash, or other providers, use their provided connection string.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Health Check
- **GET** `/api/healthz`
  - Returns: `{ "ok": true }` or `{ "ok": false }`
  - Status: 200

### Create Paste
- **POST** `/api/pastes`
  - Body:
    ```json
    {
      "content": "string (required, max 10MB)",
      "ttl_seconds": 60 (optional, integer 1-31536000),
      "max_views": 5 (optional, integer 1-1000000)
    }
    ```
  - Returns: `{ "id": "string", "url": "https://your-app.vercel.app/p/<id>" }`
  - Status: 201 (success), 400 (validation error), 413 (payload too large), 429 (rate limit exceeded)

### Fetch Paste (API)
- **GET** `/api/pastes/:id`
  - Returns: `{ "content": "string", "remaining_views": 4, "expires_at": "2026-01-01T00:00:00.000Z" }`
  - Headers: Includes rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
  - Status: 200 (success), 404 (not found/expired/exceeded), 429 (rate limit exceeded)

### View Paste (HTML)
- **GET** `/p/:id`
  - Returns: HTML page with paste content
  - Status: 200 (success) or 404 (not found/expired/exceeded)

## Persistence Layer

This application uses **Redis** as its persistence layer via the official `redis` Node.js client.

### Why Redis?

- **Fast**: In-memory storage with sub-millisecond latency
- **Atomic operations**: Supports atomic increment operations for view counting
- **TTL support**: Built-in time-to-live functionality for automatic expiry
- **Scalable**: Handles high concurrency without additional configuration
- **Flexible**: Works with any Redis provider (Redis Cloud, Upstash, self-hosted, etc.)
- **Serverless-friendly**: Connection pooling and automatic reconnection

### Data Structure

Pastes are stored in Redis with the key format: `paste:{id}`

Each paste contains:
- `id`: Unique identifier (UUID v4)
- `content`: The paste content
- `createdAt`: Timestamp of creation
- `ttlSeconds`: TTL in seconds (null if unlimited)
- `maxViews`: Maximum view count (null if unlimited)
- `viewCount`: Current view count
- `expiresAt`: ISO timestamp of expiry (null if no TTL)

## Design Decisions

### 1. UUID v4 for Paste IDs
- **Non-sequential**: Prevents enumeration attacks
- **Secure**: Hard to guess or predict
- **Collision-resistant**: Extremely low probability of duplicates

### 2. Atomic View Counting
- Uses Redis INCR for truly atomic increment operations
- Prevents race conditions under concurrent load
- Ensures accurate view counting and prevents exceeding view limits
- Fallback mechanism if atomic operations fail

### 3. Dual TTL Strategy
- **KV-level TTL**: Automatic cleanup at the storage layer
- **Application-level expiry check**: Additional validation for deterministic testing
- Both mechanisms ensure pastes are properly expired

### 4. Deterministic Time for Testing
- Supports `TEST_MODE=1` environment variable
- Uses `x-test-now-ms` header to override system time
- Enables reliable automated testing of expiry logic
- Only affects expiry checks, not other time-dependent operations

### 5. XSS Protection
- All user content is HTML-escaped before rendering
- Prevents script injection attacks
- Safe rendering of arbitrary text content

### 6. Server Components
- HTML views use Next.js Server Components for efficient rendering
- Reduces client-side JavaScript bundle size
- Better SEO and initial load performance

### 7. Zod Validation
- Type-safe runtime validation
- Clear error messages for invalid inputs
- Prevents invalid data from reaching the persistence layer
- Enforces size limits (10MB content, reasonable TTL/view limits)

### 8. Rate Limiting
- Middleware-based rate limiting using Redis
- 100 requests per minute per IP address
- Prevents DoS attacks and brute force enumeration
- Graceful degradation if rate limiting fails

### 9. Security Headers
- Comprehensive security headers via Next.js configuration
- Protects against common web vulnerabilities
- CSP, XSS protection, frame options, and more
- Applied to all routes automatically

## Testing

The application supports deterministic testing via the `TEST_MODE` environment variable:

1. Set `TEST_MODE=1` in your environment
2. Include the `x-test-now-ms` header in requests with a millisecond timestamp
3. The application will use this timestamp for expiry checks instead of system time

Example:
```bash
curl -H "x-test-now-ms: 1609459200000" https://your-app.vercel.app/api/pastes/:id
```

## Deployment

### Vercel Deployment

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import your project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

3. **Set up Redis**
   - Choose a Redis provider (Redis Cloud, Upstash, or self-hosted)
   - Get your Redis connection URL
   - Add `REDIS_URL` environment variable in Vercel project settings

4. **Deploy**
   - Vercel will automatically deploy on every push to your main branch
   - Your app will be available at `https://your-project.vercel.app`

### Environment Variables for Production

Ensure these are set in your Vercel project settings:
- `REDIS_URL` (or `KV_URL` for backward compatibility)

Example Redis URLs:
- Redis Cloud: `redis://default:password@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345`
- Upstash: `rediss://default:password@usw1-xxx.upstash.io:6379`
- Self-hosted: `redis://localhost:6379` or `redis://:password@host:6379`

## Error Handling

- **400 Bad Request**: Invalid input (validation errors)
- **404 Not Found**: Paste doesn't exist, expired, or view limit exceeded
- **413 Payload Too Large**: Request body exceeds 10MB limit
- **429 Too Many Requests**: Rate limit exceeded (100 requests/minute per IP)
- **500 Internal Server Error**: Unexpected server errors
- **503 Service Unavailable**: Database connection issues

All API errors return JSON responses in the format:
```json
{
  "error": "Error message"
}
```

Rate limit responses include headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait before retrying

## Security Features

### Input Validation & Limits
- **Content size limit**: 10MB maximum per paste
- **TTL limits**: 1 second to 1 year (31,536,000 seconds)
- **View count limits**: 1 to 1,000,000 views
- **Zod schema validation**: Type-safe runtime validation
- **Content-Length header check**: Prevents DoS via large payloads

### Rate Limiting
- **100 requests per minute** per IP address
- Applied to all API routes (except health check)
- Uses Redis atomic operations for accurate counting
- Automatic expiry after 60 seconds
- Rate limit headers included in all responses

### Security Headers
The application includes comprehensive security headers:
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Content-Security-Policy` - Restricts resource loading
- `Permissions-Policy` - Disables unnecessary browser features

### Protection Mechanisms
- **XSS Protection**: All user content is HTML-escaped before rendering
- **Atomic Operations**: View counting uses Redis INCR to prevent race conditions
- **Request Timeouts**: 5-second timeout on all database operations
- **Error Handling**: Generic error messages prevent information leakage
- **No Secrets in Code**: All sensitive data via environment variables
- **Non-sequential IDs**: UUID v4 prevents enumeration attacks
- **Input Sanitization**: All inputs validated and sanitized before processing

## License

This project is created for a coding assignment.

