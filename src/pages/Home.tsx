import { Link } from 'react-router-dom'
import GoogleSheetsViewer from '../components/GoogleSheetsViewer'
import '../styles/App.css'

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Joulah List</h1>
          <Link 
            to="/admin" 
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              border: '2px solid white',
              transition: 'all 0.3s ease'
            }}
          >
            ⚙️ Admin
          </Link>
        </div>
      </header>
      <main>
        <GoogleSheetsViewer />
      </main>
    </div>
  )
}

export default Home
