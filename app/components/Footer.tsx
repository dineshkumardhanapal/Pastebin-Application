export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer style={{
      backgroundColor: '#1f2937',
      color: '#9ca3af',
      padding: '3rem 0 2rem',
      marginTop: '4rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              About
            </h3>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              A simple, fast, and secure pastebin application. Share your text snippets with optional expiry and view limits.
            </p>
          </div>
          
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Features
            </h3>
            <ul style={{
              listStyle: 'none',
              fontSize: '0.9rem',
              lineHeight: '2'
            }}>
              <li>✨ Time-based expiry (TTL)</li>
              <li>👁️ View count limits</li>
              <li>🔒 Secure & private</li>
              <li>⚡ Fast & reliable</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Resources
            </h3>
            <ul style={{
              listStyle: 'none',
              fontSize: '0.9rem',
              lineHeight: '2'
            }}>
              <li>
                <a 
                  href="https://github.com/dineshkumardhanapal/Pastebin-Application" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#9ca3af', textDecoration: 'underline' }}
                >
                  Source Code
                </a>
              </li>
              <li>
                <a 
                  href="/api/healthz" 
                  target="_blank"
                  style={{ color: '#9ca3af', textDecoration: 'underline' }}
                >
                  API Health
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <p>
            © {currentYear} Pastebin Application. Built with Next.js and Vercel KV.
          </p>
        </div>
      </div>
    </footer>
  )
}

