import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RunResultView from './RunResultView'
import type { WorkflowRun } from '../types'

const sampleRun: WorkflowRun = {
  id: 1,
  workflow_id: 1,
  input: 'How does photosynthesis work?',
  status: 'completed',
  started_at: '2026-01-01T00:00:00Z',
  completed_at: '2026-01-01T00:00:05Z',
  final_output: 'Plants convert sunlight into energy.',
  error: null,
  executions: [
    {
      id: 1,
      workflow_run_id: 1,
      agent_id: 10,
      step_order: 1,
      input: 'How does photosynthesis work?',
      output: 'Planning the research tasks.',
      status: 'completed',
      started_at: '2026-01-01T00:00:00Z',
      completed_at: '2026-01-01T00:00:01Z',
      error: null,
    },
    {
      id: 2,
      workflow_run_id: 1,
      agent_id: 20,
      step_order: 2,
      input: 'Planning the research tasks.',
      output: 'Plants convert sunlight into energy.',
      status: 'completed',
      started_at: '2026-01-01T00:00:01Z',
      completed_at: '2026-01-01T00:00:05Z',
      error: null,
    },
  ],
}

describe('RunResultView', () => {
  it('renders each step with its agent name and status, plus the final output', () => {
    render(
      <RunResultView run={sampleRun} agentNames={{ 10: 'Planner', 20: 'Writer' }} />,
    )

    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Writer')).toBeInTheDocument()
    expect(screen.getAllByText('completed')).toHaveLength(3) // run + 2 steps
    // Appears twice: once as step 2's output, once in the Final Output banner.
    expect(screen.getAllByText('Plants convert sunlight into energy.')).toHaveLength(2)
  })

  it('shows the run-level error banner when the run failed', () => {
    const failedRun: WorkflowRun = {
      ...sampleRun,
      status: 'failed',
      error: 'Provider request failed',
      final_output: null,
    }

    render(<RunResultView run={failedRun} agentNames={{ 10: 'Planner', 20: 'Writer' }} />)

    expect(screen.getByText('Provider request failed')).toBeInTheDocument()
  })
})
