import { AnimatePresence, motion } from 'framer-motion'

export default function ErrorAlert({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="mt-px shrink-0"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M12 8v5M12 16h.01"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
