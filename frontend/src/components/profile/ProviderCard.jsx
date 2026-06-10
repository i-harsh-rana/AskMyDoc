import { useState } from 'react'
import { motion } from 'framer-motion'

function maskToken(token) {
  if (!token) return '—'
  if (token.length <= 8) return '••••••••'
  return `${'•'.repeat(Math.min(token.length - 4, 24))}${token.slice(-4)}`
}

export default function ProviderCard({ provider, busy, onToggle, onEdit, onDelete }) {
  const [revealed, setRevealed] = useState(false)
  const active = !!provider.isActive

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold uppercase text-brand-700">
            {provider.displayName?.slice(0, 2) || '?'}
          </span>
          <div>
            <h3 className="font-semibold leading-tight text-ink">
              {provider.displayName}
            </h3>
            <span className="text-xs font-medium text-muted">
              {provider.providerName}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="shrink-0 text-muted">Base URL</dt>
          <dd className="truncate font-medium text-ink" title={provider.baseUrl}>
            {provider.baseUrl}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="mt-0.5 shrink-0 text-muted">Token</dt>
          <dd className="flex min-w-0 items-start gap-2 font-mono text-xs text-ink">
            <span
              className={`min-w-0 ${revealed ? 'break-all' : 'truncate'}`}
              title={revealed ? provider.bearerToken : undefined}
            >
              {revealed ? provider.bearerToken : maskToken(provider.bearerToken)}
            </span>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="mt-0.5 shrink-0 text-muted transition-colors hover:text-brand-600"
              aria-label={revealed ? 'Hide token' : 'Show token'}
            >
              {revealed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.2A9.4 9.4 0 0 1 12 5c5 0 9 4.5 9 7 0 1-.9 2.6-2.4 4M6.1 6.1C4 7.5 3 9.6 3 11c0 1.4 4 7 9 7 1 0 1.9-.2 2.8-.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              )}
            </button>
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          role="switch"
          aria-checked={active}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
            active ? 'bg-brand-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}
