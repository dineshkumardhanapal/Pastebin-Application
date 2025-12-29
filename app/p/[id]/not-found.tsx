export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
        404 - Paste Not Found
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This paste does not exist, has expired, or has reached its view limit.
      </p>
      <a 
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        Create New Paste
      </a>
    </div>
  )
}

