import type { Health } from './types'

const MODEL_LABELS: Record<string, string> = {
  'gemini-3.5-flash-lite': 'Gemini 3.5 Flash-Lite',
  'claude-sonnet-5': 'Claude Sonnet 5',
}

function formatModel(modelId: string): string {
  return MODEL_LABELS[modelId] ?? modelId
}

/** Human-readable label for whichever provider/model is currently active backend-wide. */
export function activeProviderLabel(health: Health): string {
  if (health.provider === 'demo' || !health.model) return 'Demo Mode (no API key configured)'
  return formatModel(health.model)
}

/**
 * The model an agent will actually run with right now. GeminiProvider ignores each
 * agent's stored `model` field and always uses its own model, so when Gemini is the
 * active provider every agent effectively runs on it regardless of what's stored.
 * AnthropicProvider does use the stored field, so it's shown as-is (just formatted)
 * whenever Anthropic (or demo mode) is active.
 */
export function agentEffectiveModelLabel(agentModel: string, health: Health | null): string {
  const effectiveModel = health?.provider === 'gemini' && health.model ? health.model : agentModel
  return formatModel(effectiveModel)
}
