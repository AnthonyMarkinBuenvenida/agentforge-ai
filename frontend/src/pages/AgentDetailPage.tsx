import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteAgent, getAgent, getHealth, runAgent } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import { agentEffectiveModelLabel } from '../modelLabels'
import type { Agent, AgentRunResult, Health } from '../types'

export default function AgentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [runInput, setRunInput] = useState('')
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<AgentRunResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getAgent(Number(id)), getHealth()])
      .then(([agentData, healthData]) => {
        setAgent(agentData)
        setHealth(healthData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Delete this agent? This cannot be undone.')) return
    await deleteAgent(Number(id))
    navigate('/agents')
  }

  async function handleRun() {
    setRunning(true)
    setRunError(null)
    setRunResult(null)
    try {
      const result = await runAgent(Number(id), runInput)
      setRunResult(result)
    } catch (err) {
      setRunError((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  if (loading) return <p>Loading agent...</p>
  if (error) return <p className="text-red-600">Failed to load agent: {error}</p>
  if (!agent) return null

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{agent.name}</h1>
        <div className="flex gap-2">
          <Link to={`/agents/${agent.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card className="space-y-2">
        <p className="text-sm text-slate-500">{agent.description || 'No description.'}</p>
        <p className="text-xs text-slate-400">Model: {agentEffectiveModelLabel(agent.model, health)}</p>
        <div>
          <p className="text-sm font-medium mb-1">System Instructions</p>
          <p className="text-sm whitespace-pre-wrap">{agent.system_instructions}</p>
        </div>
      </Card>

      <Card>
        <p className="font-medium mb-3">Run this agent</p>
        <textarea
          rows={3}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm mb-3"
          placeholder="Type an input for this agent..."
          value={runInput}
          onChange={(e) => setRunInput(e.target.value)}
        />
        <Button onClick={handleRun} disabled={running || !runInput}>
          {running ? 'Running...' : 'Run'}
        </Button>

        {runError && <p className="text-sm text-red-600 mt-3">{runError}</p>}

        {runResult && (
          <div className="mt-4">
            {runResult.success ? (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                <p className="text-sm font-medium text-slate-700 mb-1">Output</p>
                <p className="text-sm whitespace-pre-wrap">{runResult.output}</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm font-medium text-red-700 mb-1">Failed</p>
                <p className="text-sm text-red-700 whitespace-pre-wrap">{runResult.error}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
