import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteWorkflow, getWorkflow, listAgents, runWorkflow } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import RunResultView from '../components/RunResultView'
import type { Agent, Workflow, WorkflowRun } from '../types'

export default function WorkflowDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [runInput, setRunInput] = useState('')
  const [running, setRunning] = useState(false)
  const [run, setRun] = useState<WorkflowRun | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getWorkflow(Number(id)), listAgents()])
      .then(([workflowData, agentsData]) => {
        setWorkflow(workflowData)
        setAgents(agentsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Delete this workflow? This cannot be undone.')) return
    await deleteWorkflow(Number(id))
    navigate('/workflows')
  }

  async function handleRun() {
    setRunning(true)
    setRunError(null)
    setRun(null)
    try {
      const result = await runWorkflow(Number(id), runInput)
      setRun(result)
    } catch (err) {
      setRunError((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  const agentNames = Object.fromEntries(agents.map((a) => [a.id, a.name]))
  const orderedSteps = workflow ? [...workflow.steps].sort((a, b) => a.step_order - b.step_order) : []

  if (loading) return <p>Loading workflow...</p>
  if (error) return <p className="text-red-600">Failed to load workflow: {error}</p>
  if (!workflow) return null

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{workflow.name}</h1>
        <div className="flex gap-2">
          <Link to={`/workflows/${workflow.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <p className="text-sm text-slate-500 mb-3">{workflow.description || 'No description.'}</p>
        {orderedSteps.length === 0 ? (
          <p className="text-sm text-slate-500">No steps yet. Edit this workflow to add some.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {orderedSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-md bg-slate-100 text-sm font-medium">
                  {agentNames[step.agent_id] ?? `Agent #${step.agent_id}`}
                </span>
                {index < orderedSteps.length - 1 && <span className="text-slate-400">&rarr;</span>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="font-medium mb-3">Run this workflow</p>
        <textarea
          rows={3}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm mb-3"
          placeholder="Describe the research request..."
          value={runInput}
          onChange={(e) => setRunInput(e.target.value)}
        />
        <Button onClick={handleRun} disabled={running || !runInput || orderedSteps.length === 0}>
          {running ? 'Running workflow...' : 'Run Workflow'}
        </Button>

        {runError && <p className="text-sm text-red-600 mt-3">{runError}</p>}

        {run && (
          <div className="mt-4">
            <RunResultView run={run} agentNames={agentNames} />
          </div>
        )}
      </Card>
    </div>
  )
}
