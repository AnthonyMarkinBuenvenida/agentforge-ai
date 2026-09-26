import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRuns, listWorkflows } from '../api/client'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import type { Workflow, WorkflowRun } from '../types'

export default function RunsPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listRuns(), listWorkflows()])
      .then(([runsData, workflowsData]) => {
        setRuns(runsData)
        setWorkflows(workflowsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const workflowNames = Object.fromEntries(workflows.map((w) => [w.id, w.name]))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Run History</h1>

      {loading && <p>Loading runs...</p>}
      {error && <p className="text-red-600">Failed to load runs: {error}</p>}

      {!loading && !error && (
        <Card>
          {runs.length === 0 ? (
            <p className="text-sm text-slate-500">No runs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-3">Run</th>
                    <th className="py-1 pr-3">Workflow</th>
                    <th className="py-1 pr-3">Status</th>
                    <th className="py-1 pr-3">Started</th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3">#{run.id}</td>
                      <td className="py-2 pr-3">
                        {workflowNames[run.workflow_id] ?? `Workflow #${run.workflow_id}`}
                      </td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="py-2 pr-3">
                        {run.started_at ? new Date(run.started_at).toLocaleString() : '-'}
                      </td>
                      <td className="py-2">
                        <Link to={`/runs/${run.id}`} className="text-indigo-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
