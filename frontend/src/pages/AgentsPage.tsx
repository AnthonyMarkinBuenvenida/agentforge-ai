import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth, listAgents } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import { agentEffectiveModelLabel } from '../modelLabels'
import type { Agent, Health } from '../types'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listAgents(), getHealth()])
      .then(([agentsData, healthData]) => {
        setAgents(agentsData)
        setHealth(healthData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <Link to="/agents/new">
          <Button>New Agent</Button>
        </Link>
      </div>

      {loading && <p>Loading agents...</p>}
      {error && <p className="text-red-600">Failed to load agents: {error}</p>}

      {!loading && !error && (
        <Card>
          {agents.length === 0 ? (
            <p className="text-sm text-slate-500">No agents yet. Create one to get started.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {agents.map((agent) => (
                <li key={agent.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link
                      to={`/agents/${agent.id}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      {agent.name}
                    </Link>
                    <p className="text-sm text-slate-500">{agent.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {agentEffectiveModelLabel(agent.model, health)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
