'use client'

import { useState, useEffect } from 'react'
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
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(content.length)
  }, [content])

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

  const formatCharCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient 15s ease infinite',
          color: '#fff',
          padding: '5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
              Share Your Code & Text
              <br />
              <span style={{ 
                background: 'linear-gradient(90deg, #fff, #f0f0f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Instantly
              </span>
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.35rem)',
              marginBottom: '2.5rem',
              opacity: 0.95,
              lineHeight: '1.7',
              fontWeight: '400',
              maxWidth: '700px',
              margin: '0 auto 2.5rem'
            }}>
              Create secure, shareable pastes with optional expiry and view limits. 
              Fast, simple, and reliable.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section style={{
          maxWidth: '1000px',
          margin: '-4rem auto 4rem',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            padding: '3rem',
            marginBottom: '3rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeIn 0.6s ease-out'
          }}>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '4px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }} />
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '0.25rem',
                  color: '#1a1a1a',
                  letterSpacing: '-0.01em'
                }}>
                  Create New Paste
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  fontWeight: '400'
                }}>
                  Paste your text below and configure optional settings
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <label htmlFor="content" style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '1rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Content <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>
                  </label>
                  <span style={{
                    fontSize: '0.875rem',
                    color: charCount > 0 ? '#667eea' : '#9ca3af',
                    fontWeight: '500',
                    transition: 'color 0.2s ease'
                  }}>
                    {formatCharCount(charCount)} characters
                  </span>
                </div>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={14}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                    resize: 'vertical',
                    background: 'linear-gradient(to bottom, #fafafa, #ffffff)',
                    lineHeight: '1.7',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontWeight: '400'
                  }}
                  placeholder="Paste your text, code, or any content here..."
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease'
                }}>
                  <label htmlFor="ttl" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>⏱️</span>
                    TTL (seconds)
                  </label>
                  <input
                    type="number"
                    id="ttl"
                    value={ttlSeconds}
                    onChange={(e) => setTtlSeconds(e.target.value)}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#fff',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="e.g., 3600"
                  />
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                    marginTop: '0.5rem',
                    lineHeight: '1.5'
                  }}>
                    Auto-delete after specified seconds
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease'
                }}>
                  <label htmlFor="maxViews" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>👁️</span>
                    Max Views
                  </label>
                  <input
                    type="number"
                    id="maxViews"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#fff',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="e.g., 10"
                  />
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                    marginTop: '0.5rem',
                    lineHeight: '1.5'
                  }}>
                    Limit the number of views
                  </p>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <span style={{ fontWeight: '500' }}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: loading 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading 
                    ? 'none' 
                    : '0 8px 24px rgba(102, 126, 234, 0.4)',
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</span>
                    Creating Paste...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    ✨ Create Paste
                  </span>
                )}
              </button>
            </form>
          </div>

          {pasteUrl && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #86efac',
              borderRadius: '20px',
              padding: '2.5rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(34, 197, 94, 0.2)',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}>
                  ✅
                </div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#166534',
                  letterSpacing: '-0.01em'
                }}>
                  Paste Created Successfully!
                </h2>
              </div>
              <p style={{
                marginBottom: '1.25rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '1rem'
              }}>
                Share this URL:
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'stretch'
              }}>
                <input
                  type="text"
                  value={pasteUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '1rem 1.25rem',
                    border: '2px solid #86efac',
                    borderRadius: '12px',
                    fontSize: '15px',
                    backgroundColor: '#fff',
                    fontFamily: '"JetBrains Mono", monospace',
                    color: '#1f2937',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: '1rem 2rem',
                    background: copied 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.3s ease',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy URL'}
                </button>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '4rem'
          }}>
            {[
              {
                icon: '⚡',
                title: 'Fast & Reliable',
                description: 'Built on Next.js and Redis for lightning-fast performance and 99.9% uptime.',
                gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)'
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Your pastes are protected with XSS prevention and optional expiry for sensitive content.',
                gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)'
              },
              {
                icon: '🎯',
                title: 'Flexible Options',
                description: 'Set time-based expiry or view limits to control how long your pastes are accessible.',
                gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
                iconBg: 'linear-gradient(135deg, #ec4899, #db2777)'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: feature.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: '#1a1a1a',
                  letterSpacing: '-0.01em'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  fontWeight: '400'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

