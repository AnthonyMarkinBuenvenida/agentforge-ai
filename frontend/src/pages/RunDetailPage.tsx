import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRun, getWorkflow, listAgents } from '../api/client'
import Card from '../components/Card'
import RunResultView from '../components/RunResultView'
import type { Agent, WorkflowRun } from '../types'

export default function RunDetailPage() {
  const { id } = useParams()

  const [run, setRun] = useState<WorkflowRun | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [workflowName, setWorkflowName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRun(Number(id))
      .then(async (runData) => {
        setRun(runData)
        const [agentsData, workflowData] = await Promise.all([
          listAgents(),
          getWorkflow(runData.workflow_id),
        ])
        setAgents(agentsData)
        setWorkflowName(workflowData.name)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Loading run...</p>
  if (error) return <p className="text-red-600">Failed to load run: {error}</p>
  if (!run) return null

  const agentNames = Object.fromEntries(agents.map((a) => [a.id, a.name]))

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Run #{run.id}</h1>
        {workflowName && (
          <p className="text-sm text-slate-500">
            Workflow:{' '}
            <Link to={`/workflows/${run.workflow_id}`} className="text-indigo-600 hover:underline">
              {workflowName}
            </Link>
          </p>
        )}
      </div>

      <Card>
        <RunResultView run={run} agentNames={agentNames} />
      </Card>
    </div>
  )
}
