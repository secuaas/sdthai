import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface ApiResponse {
  message: string
  description: string
}

function App() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>('/api/v1/')
        setApiData(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch data from API')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>sdthai</h1>
        <p>SDThai Platform</p>

        <div className="api-status">
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {apiData && (
            <div>
              <h2>API Connection: ✓</h2>
              <p>{apiData.message}</p>
              <p>{apiData.description}</p>
            </div>
          )}
        </div>

        <div className="links">
          <a href="/api/v1/" target="_blank" rel="noopener noreferrer">
            API Documentation
          </a>
          <a href="/api/health" target="_blank" rel="noopener noreferrer">
            Health Check
          </a>
        </div>
      </header>
    </div>
  )
}

export default App
