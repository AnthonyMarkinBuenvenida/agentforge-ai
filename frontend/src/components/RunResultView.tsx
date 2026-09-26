import type { WorkflowRun } from '../types'
import StatusBadge from './StatusBadge'

export default function RunResultView({
  run,
  agentNames,
}: {
  run: WorkflowRun
  agentNames: Record<number, string>
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Run #{run.id}</span>
        <StatusBadge status={run.status} />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500">Request</p>
        <p className="text-sm whitespace-pre-wrap">{run.input}</p>
      </div>

      {run.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm font-medium text-red-700">Error</p>
          <p className="text-sm text-red-700 whitespace-pre-wrap">{run.error}</p>
        </div>
      )}

      <ol className="space-y-3">
        {run.executions.map((execution) => (
          <li key={execution.id} className="border border-slate-200 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">
                Step {execution.step_order}
              </span>
              <span className="font-medium">
                {agentNames[execution.agent_id] ?? `Agent #${execution.agent_id}`}
              </span>
              <StatusBadge status={execution.status} />
            </div>
            <details className="text-sm mb-2">
              <summary className="cursor-pointer text-slate-500">Input</summary>
              <p className="whitespace-pre-wrap mt-1">{execution.input}</p>
            </details>
            {execution.output && (
              <div className="text-sm">
                <p className="text-slate-500">Output</p>
                <p className="whitespace-pre-wrap mt-1">{execution.output}</p>
              </div>
            )}
            {execution.error && (
              <p className="text-sm text-red-700 whitespace-pre-wrap mt-1">
                {execution.error}
              </p>
            )}
          </li>
        ))}
      </ol>

      {run.final_output && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
          <p className="text-sm font-medium text-slate-700 mb-1">Final Output</p>
          <p className="text-sm whitespace-pre-wrap">{run.final_output}</p>
        </div>
      )}
    </div>
  )
}
