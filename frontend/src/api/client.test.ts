import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, getAgent, listAgents } from './client'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetchOnce(response: Partial<Response> & { jsonBody?: unknown }) {
  const { jsonBody, ...rest } = response
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => jsonBody,
      ...rest,
    }),
  )
}

describe('api client error handling', () => {
  it('throws an ApiError with the backend detail message on a non-ok response', async () => {
    mockFetchOnce({ ok: false, status: 404, jsonBody: { detail: 'Agent not found' } })

    await expect(getAgent(999)).rejects.toThrow('Agent not found')
    await expect(getAgent(999)).rejects.toBeInstanceOf(ApiError)
  })

  it('falls back to a generic message when the error response has no JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('not json')
        },
      }),
    )

    await expect(listAgents()).rejects.toThrow('Request failed with status 500')
  })

  it('resolves with parsed JSON on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ id: 1, name: 'Planner' }],
      }),
    )

    const agents = await listAgents()
    expect(agents).toEqual([{ id: 1, name: 'Planner' }])
  })
})
