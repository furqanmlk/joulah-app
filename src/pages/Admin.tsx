import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Sheet {
  gid: string
  name: string
}

const Admin = () => {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [newGid, setNewGid] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    // Load sheets from localStorage
    const savedSheets = localStorage.getItem('joulah-sheets')
    if (savedSheets) {
      setSheets(JSON.parse(savedSheets))
    } else {
      // Default sheet
      const defaultSheets = [{ gid: '0', name: 'Laurelwood Area' }]
      setSheets(defaultSheets)
      localStorage.setItem('joulah-sheets', JSON.stringify(defaultSheets))
    }
  }, [])

  const saveSheets = (updatedSheets: Sheet[]) => {
    setSheets(updatedSheets)
    localStorage.setItem('joulah-sheets', JSON.stringify(updatedSheets))
  }

  const handleAddSheet = () => {
    if (newGid.trim() && newName.trim()) {
      const updatedSheets = [...sheets, { gid: newGid.trim(), name: newName.trim() }]
      saveSheets(updatedSheets)
      setNewGid('')
      setNewName('')
    }
  }

  const handleDeleteSheet = (index: number) => {
    const updatedSheets = sheets.filter((_, i) => i !== index)
    saveSheets(updatedSheets)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '2rem', fontWeight: '700' }}>Admin Panel</h1>
          <Link 
            to="/" 
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            ← Back to List
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{ marginTop: 0, color: '#333', fontSize: '1.5rem', fontWeight: '600' }}>Manage Sheets</h2>
          
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: '#555' }}>Add New Sheet</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Sheet GID (e.g., 0 or 123456)"
                value={newGid}
                onChange={(e) => setNewGid(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '12px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Sheet Name (e.g., My Area)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '12px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleAddSheet}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                ➕ Add Sheet
              </button>
            </div>
            <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '13px', color: '#666' }}>
              💡 Tip: Find the GID in your Google Sheets URL after <code>gid=</code>
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#555' }}>Current Sheets</h3>
            {sheets.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No sheets configured yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sheets.map((sheet, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: '#f8f9ff',
                      borderRadius: '12px',
                      border: '2px solid #e0e7ff'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{sheet.name}</div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>GID: {sheet.gid}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteSheet(index)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(238, 90, 111, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
