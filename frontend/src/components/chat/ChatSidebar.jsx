import { AnimatePresence, motion } from 'framer-motion'

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const STATUS_DOT = {
  READY: 'bg-emerald-500',
  PENDING: 'bg-amber-400',
  PROCESSING: 'bg-amber-400',
  FAILED: 'bg-red-400',
}

export default function ChatSidebar({
  chats,
  activeId,
  loading,
  deletingId,
  onOpen,
  onNew,
  onDelete,
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="p-3">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New chat
        </button>
      </div>

      <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        History
      </p>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))
        ) : chats.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted">
            No chats yet. Upload a PDF to start.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {chats.map((c) => {
              const active = c.id === activeId
              const deleting = c.id === deletingId
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative flex items-center rounded-xl transition-colors ${
                    active ? 'bg-brand-50' : 'hover:bg-slate-100'
                  } ${deleting ? 'pointer-events-none opacity-40' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(c)}
                    className={`flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left ${
                      active ? 'text-brand-700' : 'text-ink'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        STATUS_DOT[c.documentStatus] || 'bg-slate-300'
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {c.title || `Chat #${c.id}`}
                      </span>
                      <span className="block text-xs text-muted">
                        {formatDate(c.createdAt)}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-label="Delete chat"
                    disabled={deleting}
                    onClick={() => onDelete(c)}
                    className="mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </nav>
    </div>
  )
}
