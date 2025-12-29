import GoogleSheetsViewer from './components/GoogleSheetsViewer'
import './styles/App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Joulah List</h1>
      </header>
      <main>
        <GoogleSheetsViewer />
      </main>
    </div>
  )
}

export default App
