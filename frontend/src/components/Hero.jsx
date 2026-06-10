import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

const PROVIDERS = ['GPT-4o', 'Llama 3', 'Phi-3', 'Mistral', 'DeepSeek']

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-300/40 blur-[120px]" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-brand-200/50 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(124,58,237,0.12) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-24 pt-36 text-center sm:px-8 sm:pt-44"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-700"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
          </span>
          AI-powered document intelligence
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl"
        >
          Chat with your documents,{' '}
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            get instant answers
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
        >
          Upload any document and have a real conversation with it. AskMyDoc
          understands your content and delivers accurate answers using the AI
          models you choose — or bring your own.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/chat"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
          >
            Try AskMyDoc
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>

        <motion.div variants={item} className="mt-14 w-full">
          <p className="text-xs font-medium uppercase tracking-wider text-muted/70">
            Powered by the GitHub Models Marketplace
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {PROVIDERS.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-slate-400 transition-colors hover:text-brand-600"
              >
                {name}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-400">
              + more models
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
