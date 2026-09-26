const STATUS_CLASSES: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-800',
  running: 'bg-amber-100 text-amber-800',
  pending: 'bg-slate-100 text-slate-700',
  failed: 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status }: { status: string }) {
  const classes = STATUS_CLASSES[status] ?? 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}>
      {status}
    </span>
  )
}
