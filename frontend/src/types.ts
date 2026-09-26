export interface Agent {
  id: number
  name: string
  description: string
  system_instructions: string
  model: string
  created_at: string
  updated_at: string
}

export interface AgentInput {
  name: string
  description: string
  system_instructions: string
  model: string
}

export interface WorkflowStep {
  id: number
  agent_id: number
  step_order: number
}

export interface WorkflowStepInput {
  agent_id: number
  step_order: number
}

export interface Workflow {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  steps: WorkflowStep[]
}

export interface WorkflowInput {
  name: string
  description: string
  steps: WorkflowStepInput[]
}

export interface AgentExecution {
  id: number
  workflow_run_id: number
  agent_id: number
  step_order: number
  input: string
  output: string | null
  status: string
  started_at: string | null
  completed_at: string | null
  error: string | null
}

export interface WorkflowRun {
  id: number
  workflow_id: number
  input: string
  status: string
  started_at: string | null
  completed_at: string | null
  final_output: string | null
  error: string | null
  executions: AgentExecution[]
}

export interface DashboardStats {
  total_agents: number
  total_workflows: number
  total_runs: number
  completed_runs: number
  failed_runs: number
}

export interface AgentRunResult {
  success: boolean
  output: string | null
  error: string | null
}
