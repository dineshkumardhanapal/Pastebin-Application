'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1.25rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
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
            fontSize: '1.75rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            letterSpacing: '-0.02em'
          }}
          onMouseEnter={() => setHoveredLink('logo')}
          onMouseLeave={() => setHoveredLink(null)}
          onFocus={() => setHoveredLink('logo')}
          onBlur={() => setHoveredLink(null)}
        >
          <span style={{ 
            fontSize: '2rem',
            filter: hoveredLink === 'logo' ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4))' : 'none',
            transition: 'all 0.3s ease',
            transform: hoveredLink === 'logo' ? 'rotate(10deg) scale(1.1)' : 'rotate(0) scale(1)'
          }}>
            📋
          </span>
          <span>Pastebin</span>
        </Link>
        <nav style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <Link 
            href="/" 
            style={{
              color: hoveredLink === 'home' ? '#667eea' : '#4b5563',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.5rem 0'
            }}
            onMouseEnter={() => setHoveredLink('home')}
            onMouseLeave={() => setHoveredLink(null)}
            onFocus={() => setHoveredLink('home')}
            onBlur={() => setHoveredLink(null)}
          >
            Home
            {hoveredLink === 'home' && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }} />
            )}
          </Link>
          <a 
            href="https://github.com/dineshkumardhanapal/Pastebin-Application" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: hoveredLink === 'github' ? '#667eea' : '#4b5563',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={() => setHoveredLink('github')}
            onMouseLeave={() => setHoveredLink(null)}
            onFocus={() => setHoveredLink('github')}
            onBlur={() => setHoveredLink(null)}
          >
            <span>GitHub</span>
            <span style={{ 
              fontSize: '0.875rem',
              transform: hoveredLink === 'github' ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.3s ease'
            }}>↗</span>
            {hoveredLink === 'github' && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }} />
            )}
          </a>
        </nav>
      </div>
    </header>
  )
}

