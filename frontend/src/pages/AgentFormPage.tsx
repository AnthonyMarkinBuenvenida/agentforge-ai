import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createAgent, getAgent, updateAgent } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import type { AgentInput } from '../types'

const EMPTY_FORM: AgentInput = {
  name: '',
  description: '',
  system_instructions: '',
  model: 'claude-sonnet-5',
}

export default function AgentFormPage() {
  const { id } = useParams()
  const isEditing = id !== undefined
  const navigate = useNavigate()

  const [form, setForm] = useState<AgentInput>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing) return
    getAgent(Number(id))
      .then((agent) =>
        setForm({
          name: agent.name,
          description: agent.description,
          system_instructions: agent.system_instructions,
          model: agent.model,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const saved = isEditing ? await updateAgent(Number(id), form) : await createAgent(form)
      navigate(`/agents/${saved.id}`)
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  if (loading) return <p>Loading agent...</p>

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Agent' : 'New Agent'}</h1>

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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="system_instructions">
              System Instructions
            </label>
            <textarea
              id="system_instructions"
              required
              rows={5}
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              value={form.system_instructions}
              onChange={(e) => setForm({ ...form, system_instructions: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Agent'}
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
