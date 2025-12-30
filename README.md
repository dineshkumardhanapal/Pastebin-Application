# Pastebin Application

A modern, secure pastebin application built with Next.js that allows users to create text pastes and share them via unique URLs. Pastes can optionally have time-based expiry (TTL) and view count limits.

Live Demo- https://pastebin-application.vercel.app/


## 🚀 Features

- **Create & Share**: Create text pastes and get shareable URLs instantly
- **Time-based Expiry**: Optional TTL (Time-to-Live) with automatic cleanup (max: 1 year)
- **View Limits**: Optional maximum view count to control access (max: 1,000,000)
- **Secure**: XSS protection, rate limiting, input validation, and comprehensive security headers
- **Fast**: Built on Next.js 14+ with Redis for sub-millisecond latency
- **Modern UI**: Clean, professional Zoom-inspired design with React icons
- **API & Web**: Access pastes via HTML page or RESTful API endpoints

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Redis (via `redis` package)
- **Validation**: Zod
- **Icons**: React Icons (Heroicons)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Redis database (Redis Cloud, Upstash, or self-hosted)

## 🏃 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/dineshkumardhanapal/Pastebin-Application.git
   cd Pastebin-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   REDIS_URL=redis://your-redis-host:6379
   ```
   
   For local Redis:
   ```env
   REDIS_URL=redis://localhost:6379
   ```
   
   For Redis with authentication:
   ```env
   REDIS_URL=redis://:password@your-redis-host:6379
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Health Check
```
GET /api/healthz
```
Returns: `{ "ok": true }` or `{ "ok": false }`  
Status: 200

### Create Paste
```
POST /api/pastes
```
**Request Body:**
```json
{
  "content": "string (required, max 10MB)",
  "ttl_seconds": 60 (optional, integer 1-31536000),
  "max_views": 5 (optional, integer 1-1000000)
}
```

**Response:**
```json
{
  "id": "uuid-v4",
  "url": "https://your-app.vercel.app/p/<id>"
}
```
Status: 201 (success), 400 (validation error), 413 (payload too large), 429 (rate limit)

### Fetch Paste (API)
```
GET /api/pastes/:id
```
**Response:**
```json
{
  "content": "string",
  "remaining_views": 4 (or null if unlimited),
  "expires_at": "2026-01-01T00:00:00.000Z" (or null if no TTL)
}
```
Status: 200 (success), 404 (not found/expired/exceeded), 429 (rate limit)

### View Paste (HTML)
```
GET /p/:id
```
Returns: HTML page with paste content  
Status: 200 (success) or 404 (not found/expired/exceeded)

## 💾 Persistence Layer

This application uses **Redis** as its persistence layer.

### Why Redis?

- ⚡ **Fast**: In-memory storage with sub-millisecond latency
- 🔒 **Atomic Operations**: Supports atomic increment for view counting
- ⏰ **TTL Support**: Built-in time-to-live for automatic expiry
- 📈 **Scalable**: Handles high concurrency efficiently
- 🔄 **Flexible**: Works with any Redis provider

### Data Structure

Pastes are stored with key format: `paste:{id}`

Each paste contains:
- `id`: UUID v4 identifier
- `content`: The paste content
- `createdAt`: Creation timestamp
- `ttlSeconds`: TTL in seconds (null if unlimited)
- `maxViews`: Maximum view count (null if unlimited)
- `viewCount`: Current view count
- `expiresAt`: ISO timestamp of expiry (null if no TTL)

## 🔒 Security Features

### Input Validation & Limits
- Content size limit: **10MB** maximum
- TTL limits: 1 second to 1 year (31,536,000 seconds)
- View count limits: 1 to 1,000,000 views
- Zod schema validation for type safety
- Content-Length header validation

### Rate Limiting
- **100 requests per minute** per IP address
- Applied to all API routes (except health check)
- Uses Redis atomic operations
- Rate limit headers in responses

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

### Protection Mechanisms
- **XSS Protection**: All content HTML-escaped
- **Atomic Operations**: Redis INCR for view counting (prevents race conditions)
- **Request Timeouts**: 5-second timeout on database operations
- **Error Handling**: Generic messages prevent information leakage
- **Non-sequential IDs**: UUID v4 prevents enumeration attacks

## 🧪 Testing

The application supports deterministic testing via `TEST_MODE`:

1. Set `TEST_MODE=1` in environment
2. Include `x-test-now-ms` header with millisecond timestamp
3. Application uses this timestamp for expiry checks

**Example:**
```bash
curl -H "x-test-now-ms: 1609459200000" https://your-app.vercel.app/api/pastes/:id
```

## 🚀 Deployment

### Vercel Deployment

1. **Push code to Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

3. **Configure Redis**
   - Choose a Redis provider (Redis Cloud, Upstash, etc.)
   - Get your Redis connection URL
   - Add `REDIS_URL` environment variable in Vercel project settings

4. **Deploy**
   - Vercel automatically deploys on every push to main branch
   - App available at `https://your-project.vercel.app`

### Environment Variables

**Required:**
- `REDIS_URL` - Redis connection string

**Optional:**
- `TEST_MODE` - Set to `1` for deterministic testing
- `NEXT_PUBLIC_BASE_URL` - Base URL for paste links (auto-detected on Vercel)

## 📝 Design Decisions

1. **UUID v4 for Paste IDs**: Non-sequential, secure, collision-resistant
2. **Atomic View Counting**: Redis INCR prevents race conditions
3. **Dual TTL Strategy**: KV-level + application-level expiry checks
4. **Deterministic Time**: TEST_MODE enables reliable automated testing
5. **XSS Protection**: All content HTML-escaped before rendering
6. **Server Components**: Efficient rendering, better SEO
7. **Zod Validation**: Type-safe runtime validation
8. **Rate Limiting**: Middleware-based using Redis

## ⚠️ Error Handling

- **400 Bad Request**: Invalid input (validation errors)
- **404 Not Found**: Paste doesn't exist, expired, or view limit exceeded
- **413 Payload Too Large**: Request body exceeds 10MB limit
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server errors
- **503 Service Unavailable**: Database connection issues

All API errors return JSON:
```json
{
  "error": "Error message"
}
```

## 📄 License

This project is created for a coding assignment.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/dineshkumardhanapal/Pastebin-Application)
- **API Health**: `/api/healthz`

---

Built with ❤️ using Next.js and Redis
