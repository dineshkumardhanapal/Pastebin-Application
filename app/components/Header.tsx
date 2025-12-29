'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  return (
    <header style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          href="/" 
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0070f3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={() => setHoveredLink('logo')}
          onMouseLeave={() => setHoveredLink(null)}
          onFocus={() => setHoveredLink('logo')}
          onBlur={() => setHoveredLink(null)}
        >
          <span>📋</span>
          <span style={{ opacity: hoveredLink === 'logo' ? 0.8 : 1 }}>Pastebin</span>
        </Link>
        <nav style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <Link 
            href="/" 
            style={{
              color: hoveredLink === 'home' ? '#0070f3' : '#666',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredLink('home')}
            onMouseLeave={() => setHoveredLink(null)}
            onFocus={() => setHoveredLink('home')}
            onBlur={() => setHoveredLink(null)}
          >
            Home
          </Link>
          <a 
            href="https://github.com/dineshkumardhanapal/Pastebin-Application" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: hoveredLink === 'github' ? '#0070f3' : '#666',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredLink('github')}
            onMouseLeave={() => setHoveredLink(null)}
            onFocus={() => setHoveredLink('github')}
            onBlur={() => setHoveredLink(null)}
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}

