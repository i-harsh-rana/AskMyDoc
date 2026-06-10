import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../Logo'

const HIGHLIGHTS = [
  'Upload PDFs, docs & notes — chat with them instantly',
  'Pick any model from the GitHub Models Marketplace',
  'Accurate, source-grounded answers in seconds',
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V5Z"
                fill="white"
              />
              <path d="M8 8h8M8 11h5" stroke="#6d28d9" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">AskMyDoc</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10"
        >
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            Turn your documents into conversations.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((text) => (
              <li key={text} className="flex items-start gap-3 text-brand-50">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative z-10 text-sm text-brand-100/80">
          AI-powered document intelligence.
        </p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-sm py-8"
          >
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && (
              <p className="mt-6 text-center text-sm text-muted">{footer}</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
