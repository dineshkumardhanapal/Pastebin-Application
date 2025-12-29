'use client'

import { useState } from 'react'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttlSeconds, setTtlSeconds] = useState('')
  const [maxViews, setMaxViews] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pasteUrl, setPasteUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPasteUrl(null)

    try {
      const body: {
        content: string
        ttl_seconds?: number
        max_views?: number
      } = {
        content,
      }

      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10)
        if (!isNaN(ttl) && ttl >= 1) {
          body.ttl_seconds = ttl
        }
      }

      if (maxViews) {
        const views = parseInt(maxViews, 10)
        if (!isNaN(views) && views >= 1) {
          body.max_views = views
        }
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create paste')
        return
      }

      setPasteUrl(data.url)
      setContent('')
      setTtlSeconds('')
      setMaxViews('')
    } catch (err) {
      setError('An error occurred while creating the paste')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (pasteUrl) {
      try {
        await navigator.clipboard.writeText(pasteUrl)
        alert('URL copied to clipboard!')
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = pasteUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('URL copied to clipboard!')
      }
    }
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
        color: '#333',
        textAlign: 'center'
      }}>
        Pastebin App
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '2rem'
      }}>
        Create and share text pastes with optional expiry and view limits
      </p>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="content" style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#333'
          }}>
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
            placeholder="Enter your text here..."
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <label htmlFor="ttl" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>
              TTL (seconds, optional)
            </label>
            <input
              type="number"
              id="ttl"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="e.g., 3600"
            />
          </div>

          <div>
            <label htmlFor="maxViews" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>
              Max Views (optional)
            </label>
            <input
              type="number"
              id="maxViews"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="e.g., 10"
            />
          </div>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {pasteUrl && (
        <div style={{
          backgroundColor: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            marginBottom: '0.5rem',
            color: '#2e7d32'
          }}>
            Paste Created Successfully!
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#333',
            wordBreak: 'break-all'
          }}>
            Share this URL:
          </p>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={pasteUrl}
              readOnly
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #4caf50',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            />
            <button
              onClick={copyToClipboard}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

