import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getHealth, listRuns, listWorkflows } from '../api/client'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { activeProviderLabel } from '../modelLabels'
import type { DashboardStats, Health, Workflow, WorkflowRun } from '../types'

const FACTORY_NAME = 'Academic Research Factory'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getDashboardStats(), listRuns(), listWorkflows(), getHealth()])
      .then(([statsData, runsData, workflowsData, healthData]) => {
        setStats(statsData)
        setRuns(runsData.slice(0, 5))
        setWorkflows(workflowsData)
        setHealth(healthData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const workflowNames = Object.fromEntries(workflows.map((w) => [w.id, w.name]))
  const factory = workflows.find((w) => w.name === FACTORY_NAME)

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p className="text-red-600">Failed to load dashboard: {error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {health && (
          <p className="text-sm text-slate-500 mt-1">
            AI Provider: <span className="font-medium text-slate-700">{activeProviderLabel(health)}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Total Agents</p>
          <p className="text-2xl font-semibold">{stats?.total_agents}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Workflows</p>
          <p className="text-2xl font-semibold">{stats?.total_workflows}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Successful Runs</p>
          <p className="text-2xl font-semibold text-emerald-600">{stats?.completed_runs}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Failed Runs</p>
          <p className="text-2xl font-semibold text-red-600">{stats?.failed_runs}</p>
        </Card>
      </div>

      {factory && (
        <Card className="bg-indigo-50 border-indigo-200">
          <p className="text-sm font-medium text-indigo-900">Built-in AI Factory</p>
          <p className="text-lg font-semibold">{factory.name}</p>
          <p className="text-sm text-slate-600 mb-3">{factory.description}</p>
          <Link
            to={`/workflows/${factory.id}`}
            className="text-sm font-medium text-indigo-700 hover:underline"
          >
            Try the Academic Research Factory &rarr;
          </Link>
        </Card>
      )}

      <Card>
        <p className="font-medium mb-3">Recent Runs</p>
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
    </div>
  )
}
