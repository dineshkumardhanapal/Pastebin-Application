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
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          margin: 0,
          color: '#333'
        }}>
          {safeContent}
        </pre>
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Paste ID: {id}
      </div>
    </div>
  )
}

