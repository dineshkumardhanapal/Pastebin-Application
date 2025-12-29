'use client'

import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttlSeconds, setTtlSeconds] = useState('')
  const [maxViews, setMaxViews] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pasteUrl, setPasteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = pasteUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Share Your Code & Text
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              opacity: 0.95,
              lineHeight: '1.6'
            }}>
              Create secure, shareable pastes with optional expiry and view limits. 
              Fast, simple, and reliable.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section style={{
          maxWidth: '900px',
          margin: '-3rem auto 4rem',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem',
            marginBottom: '3rem'
          }}>

            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              Create New Paste
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              fontSize: '0.95rem'
            }}>
              Paste your text below and configure optional settings
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="content" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  Content <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Monaco, "Courier New", monospace',
                    resize: 'vertical',
                    backgroundColor: '#fafafa',
                    lineHeight: '1.6'
                  }}
                  placeholder="Paste your text, code, or any content here..."
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label htmlFor="ttl" style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}>
                    ⏱️ TTL (seconds)
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
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fafafa'
                    }}
                    placeholder="e.g., 3600"
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: '0.25rem'
                  }}>
                    Optional: Auto-delete after seconds
                  </p>
                </div>

                <div>
                  <label htmlFor="maxViews" style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}>
                    👁️ Max Views
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
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fafafa'
                    }}
                    placeholder="e.g., 10"
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: '0.25rem'
                  }}>
                    Optional: Limit view count
                  </p>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: loading ? '#9ca3af' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.3)'
                }}
              >
                {loading ? '⏳ Creating Paste...' : '✨ Create Paste'}
              </button>
            </form>
          </div>

          {pasteUrl && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#166534'
                }}>
                  Paste Created Successfully!
                </h2>
              </div>
              <p style={{
                marginBottom: '1rem',
                color: '#374151',
                fontWeight: '500'
              }}>
                Share this URL:
              </p>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'stretch'
              }}>
                <input
                  type="text"
                  value={pasteUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '0.875rem 1rem',
                    border: '2px solid #86efac',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    fontFamily: 'monospace',
                    color: '#1f2937'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: '0.875rem 1.5rem',
                    backgroundColor: copied ? '#10b981' : '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem'
              }}>⚡</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Fast & Reliable
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                Built on Next.js and Vercel KV for lightning-fast performance and 99.9% uptime.
              </p>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem'
              }}>🔒</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Secure & Private
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                Your pastes are protected with XSS prevention and optional expiry for sensitive content.
              </p>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem'
              }}>🎯</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Flexible Options
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                Set time-based expiry or view limits to control how long your pastes are accessible.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

