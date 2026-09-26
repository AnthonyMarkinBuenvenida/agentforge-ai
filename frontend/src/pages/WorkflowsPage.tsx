import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listWorkflows } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import type { Workflow } from '../types'

const FACTORY_NAME = 'Academic Research Factory'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listWorkflows()
      .then(setWorkflows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <Link to="/workflows/new">
          <Button>New Workflow</Button>
        </Link>
      </div>

      {loading && <p>Loading workflows...</p>}
      {error && <p className="text-red-600">Failed to load workflows: {error}</p>}

      {!loading && !error && (
        <Card>
          {workflows.length === 0 ? (
            <p className="text-sm text-slate-500">No workflows yet. Create one to get started.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {workflows.map((workflow) => (
                <li key={workflow.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="font-medium text-indigo-700 hover:underline"
                      >
                        {workflow.name}
                      </Link>
                      {workflow.name === FACTORY_NAME && (
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          Built-in Factory
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{workflow.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {workflow.steps.length} step{workflow.steps.length === 1 ? '' : 's'}
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
