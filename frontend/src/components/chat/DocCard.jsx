import { motion } from 'framer-motion'

export default function DocCard({ name, status }) {
  return (
    <motion.div
      layoutId="doc-card"
      initial={false}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path
            d="M9 13h6M9 16h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink" title={name}>
          {name}
        </p>
        {status && (
          <span className="flex items-center gap-1.5 text-xs font-medium">
            {status === 'processing' ? (
              <>
                <motion.span
                  className="h-2 w-2 rounded-full bg-amber-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-amber-600">Processing…</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600">Ready</span>
              </>
            )}
          </span>
        )}
      </div>
    </motion.div>
  )
}
