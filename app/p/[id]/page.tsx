import { notFound } from 'next/navigation'
import { kv, getPasteKey, kvWithTimeout } from '@/lib/kv'
import { isPasteAvailable } from '@/lib/paste'
import { escapeHtml } from '@/lib/utils'
import type { Paste } from '@/types/paste'

interface PageProps {
  params: {
    id: string
  }
}

async function getPaste(id: string): Promise<Paste | null> {
  try {
    const key = getPasteKey(id)
    const pasteData = await kvWithTimeout(
      () => kv.get<string>(key),
      5000 // 5 second timeout
    )

    if (!pasteData) {
      return null
    }

    try {
      const paste: Paste = JSON.parse(pasteData)
      // Validate paste structure
      if (!paste.id || typeof paste.content !== 'string') {
        console.error('Invalid paste structure:', { id: paste?.id })
        return null
      }
      return paste
    } catch (parseError) {
      console.error('Failed to parse paste data:', parseError)
      return null
    }
  } catch (error) {
    console.error('Error fetching paste:', error)
    return null
  }
}

export default async function PastePage({ params }: PageProps) {
  const { id } = params
  const paste = await getPaste(id)

  if (!paste || !isPasteAvailable(paste)) {
    notFound()
  }

  // Escape HTML to prevent XSS
  const safeContent = escapeHtml(paste.content)

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundAttachment: 'fixed',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em'
              }}>
                Paste Content
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: '500'
              }}>
                ID: {id}
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
            }}>
              📋
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
            border: '2px solid #3a3a3a',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1rem',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
              }} />
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'
              }} />
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
              }} />
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
              fontSize: '15px',
              lineHeight: '1.8',
              margin: 0,
              color: '#e5e7eb',
              fontWeight: '400',
              paddingTop: '2.5rem',
              overflowX: 'auto'
            }}>
              {safeContent}
            </pre>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #f8f9ff, #ffffff)',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ← Create New Paste
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

