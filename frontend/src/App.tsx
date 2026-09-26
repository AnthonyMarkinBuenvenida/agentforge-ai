import { useEffect, useState } from 'react'

type HealthResponse = {
  status: string
  demo_mode: boolean
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError('Could not reach backend'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">AgentForge AI</h1>
        <p className="text-slate-400">Phase 1: project setup complete.</p>
        {health && (
          <p className="text-sm text-emerald-400">
            Backend status: {health.status} (demo mode: {String(health.demo_mode)})
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}

export default App
