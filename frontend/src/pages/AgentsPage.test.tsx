import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listAgents } from '../api/client'
import AgentsPage from './AgentsPage'

vi.mock('../api/client')

beforeEach(() => {
  vi.mocked(listAgents).mockReset()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <AgentsPage />
    </MemoryRouter>,
  )
}

describe('AgentsPage loading/error/success states', () => {
  it('shows a loading state before the request resolves', () => {
    vi.mocked(listAgents).mockReturnValue(new Promise(() => {})) // never resolves

    renderPage()

    expect(screen.getByText(/loading agents/i)).toBeInTheDocument()
  })

  it('shows a readable error message when the request fails', async () => {
    vi.mocked(listAgents).mockRejectedValue(new Error('Network error'))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/failed to load agents: network error/i)).toBeInTheDocument()
    })
  })

  it('renders the agent list once the request succeeds', async () => {
    vi.mocked(listAgents).mockResolvedValue([
      {
        id: 1,
        name: 'Planner',
        description: 'Plans research',
        system_instructions: 'x',
        model: 'claude-sonnet-5',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Planner')).toBeInTheDocument()
    })
    expect(screen.getByText('Plans research')).toBeInTheDocument()
  })
})
