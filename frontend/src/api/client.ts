import type {
  Agent,
  AgentInput,
  AgentRunResult,
  DashboardStats,
  Workflow,
  WorkflowInput,
  WorkflowRun,
} from '../types'

export class ApiError extends Error {}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      // response had no JSON body; keep the default message
    }
    throw new ApiError(detail)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// --- Agents -----------------------------------------------------------------

export const listAgents = () => request<Agent[]>('/agents')
export const getAgent = (id: number) => request<Agent>(`/agents/${id}`)
export const createAgent = (payload: AgentInput) =>
  request<Agent>('/agents', { method: 'POST', body: JSON.stringify(payload) })
export const updateAgent = (id: number, payload: AgentInput) =>
  request<Agent>(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteAgent = (id: number) => request<void>(`/agents/${id}`, { method: 'DELETE' })
export const runAgent = (id: number, input: string) =>
  request<AgentRunResult>(`/agents/${id}/run`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  })

// --- Workflows ----------------------------------------------------------------

export const listWorkflows = () => request<Workflow[]>('/workflows')
export const getWorkflow = (id: number) => request<Workflow>(`/workflows/${id}`)
export const createWorkflow = (payload: WorkflowInput) =>
  request<Workflow>('/workflows', { method: 'POST', body: JSON.stringify(payload) })
export const updateWorkflow = (id: number, payload: WorkflowInput) =>
  request<Workflow>(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteWorkflow = (id: number) =>
  request<void>(`/workflows/${id}`, { method: 'DELETE' })
export const runWorkflow = (id: number, input: string) =>
  request<WorkflowRun>(`/workflows/${id}/run`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  })

// --- Runs -----------------------------------------------------------------

export const listRuns = () => request<WorkflowRun[]>('/runs')
export const getRun = (id: number) => request<WorkflowRun>(`/runs/${id}`)

// --- Dashboard --------------------------------------------------------------

export const getDashboardStats = () => request<DashboardStats>('/dashboard/stats')
