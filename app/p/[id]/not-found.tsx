import Link from 'next/link'
import { HiOutlineArrowLeft } from 'react-icons/hi2'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #2D8CFF 0%, #1E6FD9 50%, #0D5FC7 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem', 
          color: '#1f2937',
          fontWeight: '700'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem', 
          color: '#374151',
          fontWeight: '600'
        }}>
          Paste Not Found
        </h2>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          This paste does not exist, has expired, or has reached its view limit.
        </p>
        <Link 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2D8CFF',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(45, 140, 255, 0.3)'
          }}
        >
          <HiOutlineArrowLeft style={{ fontSize: '1.1rem' }} />
          Create New Paste
        </Link>
      </div>
    </div>
  )
}

