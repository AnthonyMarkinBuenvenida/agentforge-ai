import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createWorkflow, getWorkflow, listAgents, updateWorkflow } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import type { Agent } from '../types'

export default function WorkflowFormPage() {
  const { id } = useParams()
  const isEditing = id !== undefined
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stepAgentIds, setStepAgentIds] = useState<number[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentToAdd, setAgentToAdd] = useState<number | ''>('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loaders: Promise<unknown>[] = [listAgents().then(setAgents)]
    if (isEditing) {
      loaders.push(
        getWorkflow(Number(id)).then((workflow) => {
          setName(workflow.name)
          setDescription(workflow.description)
          setStepAgentIds(
            [...workflow.steps]
              .sort((a, b) => a.step_order - b.step_order)
              .map((step) => step.agent_id),
          )
        }),
      )
    }
    Promise.all(loaders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  function addStep() {
    if (agentToAdd === '') return
    setStepAgentIds([...stepAgentIds, Number(agentToAdd)])
    setAgentToAdd('')
  }

  function removeStep(index: number) {
    setStepAgentIds(stepAgentIds.filter((_, i) => i !== index))
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= stepAgentIds.length) return
    const next = [...stepAgentIds]
    ;[next[index], next[target]] = [next[target], next[index]]
    setStepAgentIds(next)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      name,
      description,
      steps: stepAgentIds.map((agentId, index) => ({
        agent_id: agentId,
        step_order: index + 1,
      })),
    }
    try {
      const saved = isEditing ? await updateWorkflow(Number(id), payload) : await createWorkflow(payload)
      navigate(`/workflows/${saved.id}`)
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  const agentName = (agentId: number) => agents.find((a) => a.id === agentId)?.name ?? `#${agentId}`

  if (loading) return <p>Loading workflow...</p>

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Workflow' : 'New Workflow'}</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              required
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <p className="block text-sm font-medium mb-1">Steps (in order)</p>
            {stepAgentIds.length === 0 && (
              <p className="text-sm text-slate-500 mb-2">No steps yet. Add an agent below.</p>
            )}
            <ol className="space-y-2 mb-3">
              {stepAgentIds.map((agentId, index) => (
                <li
                  key={`${agentId}-${index}`}
                  className="flex items-center justify-between gap-2 border border-slate-200 rounded-md px-3 py-1.5"
                >
                  <span className="text-sm">
                    {index + 1}. {agentName(agentId)}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30"
                      onClick={() => moveStep(index, -1)}
                      disabled={index === 0}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30"
                      onClick={() => moveStep(index, 1)}
                      disabled={index === stepAgentIds.length - 1}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:text-red-800"
                      onClick={() => removeStep(index)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex gap-2">
              <select
                className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                value={agentToAdd}
                onChange={(e) => setAgentToAdd(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">Select an agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={addStep} disabled={agentToAdd === ''}>
                Add Step
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Workflow'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
