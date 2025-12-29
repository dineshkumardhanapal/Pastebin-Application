# Pastebin Application

A simple pastebin-like application built with Next.js that allows users to create text pastes and share them via URLs. Pastes can optionally have time-based expiry (TTL) and view count limits.

## Features

- Create text pastes with optional constraints:
  - Time-to-live (TTL) in seconds
  - Maximum view count
- Share pastes via unique URLs
- View pastes via HTML page or API endpoint
- Automatic cleanup when constraints are triggered
- Deterministic time support for testing

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Vercel KV** (Redis) for persistence
- **Zod** for input validation

## Prerequisites

- Node.js 18+ installed
- A Vercel KV database (or Redis instance)
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
   KV_URL=your_vercel_kv_url
   KV_REST_API_URL=your_vercel_kv_rest_api_url
   KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
   ```
   
   For local development with a Redis instance, you can use:
   ```env
   KV_URL=redis://localhost:6379
   ```

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
      "content": "string (required)",
      "ttl_seconds": 60 (optional, integer ≥ 1),
      "max_views": 5 (optional, integer ≥ 1)
    }
    ```
  - Returns: `{ "id": "string", "url": "https://your-app.vercel.app/p/<id>" }`
  - Status: 201

### Fetch Paste (API)
- **GET** `/api/pastes/:id`
  - Returns: `{ "content": "string", "remaining_views": 4, "expires_at": "2026-01-01T00:00:00.000Z" }`
  - Status: 200 (success) or 404 (not found/expired/exceeded)

### View Paste (HTML)
- **GET** `/p/:id`
  - Returns: HTML page with paste content
  - Status: 200 (success) or 404 (not found/expired/exceeded)

## Persistence Layer

This application uses **Vercel KV** (a Redis-based key-value store) as its persistence layer.

### Why Vercel KV?

- **Serverless-friendly**: Works seamlessly with Vercel's serverless functions
- **Fast**: In-memory storage with sub-millisecond latency
- **Atomic operations**: Supports atomic increment operations for view counting
- **TTL support**: Built-in time-to-live functionality for automatic expiry
- **Scalable**: Handles high concurrency without additional configuration

### Data Structure

Pastes are stored in Vercel KV with the key format: `paste:{id}`

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
- Uses atomic increment operations to prevent race conditions
- Ensures accurate view counting under concurrent load
- Prevents serving pastes beyond their view limits

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

3. **Set up Vercel KV**
   - In your Vercel project, go to Storage
   - Create a new KV database
   - The environment variables will be automatically configured

4. **Deploy**
   - Vercel will automatically deploy on every push to your main branch
   - Your app will be available at `https://your-project.vercel.app`

### Environment Variables for Production

Ensure these are set in your Vercel project settings:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

These are automatically configured when you create a Vercel KV database.

## Error Handling

- **400 Bad Request**: Invalid input (validation errors)
- **404 Not Found**: Paste doesn't exist, expired, or view limit exceeded
- **500 Internal Server Error**: Unexpected server errors

All API errors return JSON responses in the format:
```json
{
  "error": "Error message"
}
```

## Security Considerations

- No secrets or credentials in the codebase
- All user input is validated and sanitized
- HTML content is escaped to prevent XSS attacks
- Non-sequential IDs prevent enumeration
- Atomic operations prevent race conditions

## License

This project is created for a coding assignment.

