import { useState, useEffect } from 'react'

interface Sheet {
  gid: string
  name: string
}

interface EditedData {
  [key: number]: string
}

const GoogleSheetsViewer = () => {
  const [data, setData] = useState<string[][]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sheetId] = useState<string>('1wELnopZrABn6xx_6bdGBwGzJ7yMhMlRoUqOvyb2zyNc')
  const [sheetGid, setSheetGid] = useState<string>('0')
  const [availableSheets, setAvailableSheets] = useState<Sheet[]>([])
  const [detectingSheets, setDetectingSheets] = useState<boolean>(false)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editedData, setEditedData] = useState<EditedData>({})
  const [saving, setSaving] = useState<boolean>(false)
  
  // Apps Script Web App URL for saving changes back to Google Sheets
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfZ3O_zzYnnW3ISbpqnZ8S-LCpoujecDvlSktTotfkJhrQ5cdwu4HY53O5qao9cKhO/exec'

  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.split('\n')
    return lines
      .filter(line => line.trim())
      .map(line => {
        // Simple CSV parsing - handles basic cases and quoted values
        const values: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim())
        return values
      })
  }

  const autoDetectSheets = async (): Promise<void> => {
    setDetectingSheets(true)
    
    // Try multiple possible GIDs for the config sheet
    const possibleGids = ['220772312', '327847089', '1', '0'] // Config sheet GID first
    
    for (const gid of possibleGids) {
      try {
        const configUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
        const response = await fetch(configUrl)
        
        if (response.ok) {
          const csvText = await response.text()
          
          // Check if this looks like a config sheet (has gid,name header)
          if (csvText.toLowerCase().includes('gid') && csvText.toLowerCase().includes('name')) {
            const parsedData = parseCSV(csvText)
            
            const sheets: Sheet[] = []
            for (let i = 1; i < parsedData.length; i++) { // Skip header row
              const row = parsedData[i]
              if (row.length >= 2 && row[0] && row[1]) {
                sheets.push({
                  gid: row[0].trim(),
                  name: row[1].trim()
                })
              }
            }
            
            if (sheets.length > 0) {
              setAvailableSheets(sheets)
              setSheetGid(sheets[0].gid)
              fetchSheetData(sheets[0].gid)
              setDetectingSheets(false)
              return
            }
          }
        }
      } catch (err) {
        // Config sheet not found with this GID
      }
    }
    
    // Fallback: use default sheet
    const defaultSheets = [{ gid: '0', name: 'Laurelwood Area' }]
    setAvailableSheets(defaultSheets)
    setSheetGid(defaultSheets[0].gid)
    fetchSheetData(defaultSheets[0].gid)
    
    setDetectingSheets(false)
  }

  const fetchSheetData = async (gid: string = sheetGid): Promise<void> => {
    if (!sheetId) {
      setError('Please provide a Sheet ID')
      return
    }

    setLoading(true)
    setError(null)
    setSheetGid(gid)

    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch sheet. Make sure the sheet is published or shared publicly.')
      }
      
      const csvText = await response.text()
      const parsedData = parseCSV(csvText)
      
      if (parsedData.length > 0) {
        setData(parsedData)
      } else {
        setError('No data found in the sheet')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data from Google Sheets'
      setError(errorMessage)
      console.error('Error fetching sheet data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-detect sheets on mount
  useEffect(() => {
    autoDetectSheets()
  }, [])

  const handleEdit = (rowIndex: number): void => {
    setEditingRow(rowIndex)
    const row = data[rowIndex + 1] // +1 because first row is headers
    const rowData: EditedData = {}
    data[0].forEach((_header, idx) => {
      rowData[idx] = row[idx] || ''
    })
    setEditedData(rowData)
  }

  const handleCancelEdit = (): void => {
    setEditingRow(null)
    setEditedData({})
  }

  const handleSaveEdit = async (rowIndex: number): Promise<void> => {
    if (!APPS_SCRIPT_URL) {
      console.error('Please set up the Apps Script URL first.')
      return
    }

    setSaving(true)
    
    try {
      const headers = data[0]
      const updatedRow = headers.map((_, idx) => editedData[idx] || '')
      
      // Create URL with parameters (GET request to avoid CORS)
      const params = new URLSearchParams({
        sheetGid: sheetGid,
        rowIndex: rowIndex.toString(),
        rowData: JSON.stringify(updatedRow)
      })
      
      const url = `${APPS_SCRIPT_URL}?${params.toString()}`
      
      // Send request using fetch instead of popup
      await fetch(url, { mode: 'no-cors' })
      
      // Update local data immediately
      const newData = [...data]
      newData[rowIndex + 1] = updatedRow
      setData(newData)
      setEditingRow(null)
      setEditedData({})
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error saving to Google Sheets:', err, errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleCellChange = (cellIndex: number, value: string): void => {
    setEditedData({
      ...editedData,
      [cellIndex]: value
    })
  }

  const scrollToStreet = (streetName: string): void => {
    const element = document.getElementById(`street-${streetName}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight briefly
      element.style.backgroundColor = '#fff9c4'
      setTimeout(() => {
        element.style.backgroundColor = ''
      }, 2000)
    }
  }

  const getUniqueStreets = (): string[] => {
    if (data.length < 2) return []
    const streetColumnIndex = 1 // Assuming street is the second column (index 1)
    const streets = new Set<string>()
    
    for (let i = 2; i < data.length; i++) { // Start from row 2 (skip header and first data row)
      const street = data[i][streetColumnIndex]
      if (street && street.trim()) {
        streets.add(street.trim())
      }
    }
    
    return Array.from(streets).sort()
  }

  const renderTable = () => {
    if (data.length === 0) return null

    const headers = data[0]
    const rows = data.slice(1)

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {editingRow === rowIndex ? (
                  <>
                    {row.map((_cell, cellIndex) => (
                      <td key={cellIndex}>
                        <input
                          type="text"
                          value={editedData[cellIndex] || ''}
                          onChange={(e) => handleCellChange(cellIndex, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '2px solid #667eea',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                            outline: 'none'
                          }}
                        />
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleSaveEdit(rowIndex)}
                          disabled={saving}
                          style={{
                            padding: '8px 16px',
                            background: saving ? '#ccc' : 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: saving ? 'none' : '0 2px 8px rgba(55, 178, 77, 0.3)'
                          }}
                        >
                          {saving ? '💾 Saving...' : '✓ Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(238, 90, 111, 0.3)'
                          }}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    {row.map((cell, cellIndex) => {
                      // Add ID to street name cells (second column, first occurrence)
                      const isStreetColumn = cellIndex === 1
                      const isFirstOccurrence = isStreetColumn && 
                        rowIndex > 0 && // Not the first data row
                        rows.slice(0, rowIndex).every(r => r[1] !== cell)
                      
                      return (
                        <td 
                          key={cellIndex}
                          id={isFirstOccurrence ? `street-${cell}` : undefined}
                        >
                          {cell}
                        </td>
                      )
                    })}
                    <td>
                      {/* Don't show Edit button for first data row (row index 0) */}
                      {rowIndex === 0 ? (
                        <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                      ) : (
                        <button
                          onClick={() => handleEdit(rowIndex)}
                          disabled={editingRow !== null}
                          style={{
                            padding: '8px 16px',
                            background: editingRow !== null ? '#e0e0e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: editingRow !== null ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: editingRow !== null ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: editingRow !== null ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)'
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="sheets-viewer">
      <div className="config-section">
        {detectingSheets && (
          <div style={{ padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)', fontWeight: '500' }}>
            🔍 Detecting available sheets...
          </div>
        )}

        {availableSheets.length > 0 && (
          <div className="sheets-selector">
            <h3>Available Areas ({availableSheets.length}):</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {availableSheets.map((sheet) => (
                <button
                  key={sheet.gid}
                  onClick={() => fetchSheetData(sheet.gid)}
                  disabled={loading}
                  className={`sheet-tab ${sheetGid === sheet.gid ? 'active' : ''}`}
                  style={{
                    padding: '12px 24px',
                    background: sheetGid === sheet.gid ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: sheetGid === sheet.gid ? 'white' : '#667eea',
                    border: sheetGid === sheet.gid ? 'none' : '2px solid #667eea',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: sheetGid === sheet.gid ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="data-section">
          {/* Street Navigation Dropdown */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <label htmlFor="street-selector" style={{
              fontWeight: '600',
              color: '#667eea',
              fontSize: '14px'
            }}>
              🗺️ Jump to Street:
            </label>
            <select
              id="street-selector"
              onChange={(e) => {
                if (e.target.value) {
                  scrollToStreet(e.target.value)
                  e.target.value = '' // Reset dropdown
                }
              }}
              style={{
                padding: '10px 16px',
                border: '2px solid #667eea',
                borderRadius: '8px',
                background: 'white',
                color: '#667eea',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '200px',
                boxShadow: '0 2px 6px rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="">Select a street...</option>
              {getUniqueStreets().map((street) => (
                <option key={street} value={street}>
                  {street}
                </option>
              ))}
            </select>
          </div>
          
          <h2>Total Contacts ({data.length - 2})</h2>
          {renderTable()}
        </div>
      )}
    </div>
  )
}

export default GoogleSheetsViewer
