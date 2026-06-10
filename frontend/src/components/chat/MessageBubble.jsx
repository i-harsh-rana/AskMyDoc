import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="mb-2 mt-1 text-base font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-1 text-base font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-1 text-sm font-bold">{children}</h3>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand-600 underline">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 last:mb-0">
      {children}
    </pre>
  ),
}

function useTypewriter(text, enabled, onTick) {
  const [count, setCount] = useState(() => (enabled ? 0 : text.length))
  const tickRef = useRef(onTick)
  useEffect(() => {
    tickRef.current = onTick
  })

  useEffect(() => {
    if (!enabled) return undefined
    let shown = 0
    const charsPerTick = Math.max(2, Math.ceil(text.length / 140))
    const id = setInterval(() => {
      shown = Math.min(text.length, shown + charsPerTick)
      setCount(shown)
      tickRef.current?.()
      if (shown >= text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [text, enabled])

  return enabled ? count : text.length
}

export default function MessageBubble({ role, text, provider, pending, animate, onType }) {
  const isUser = role === 'USER'
  const shouldType = !isUser && !pending && animate && !!text

  const count = useTypewriter(text || '', shouldType, onType)
  const visible = shouldType ? (text || '').slice(0, count) : text
  const typing = shouldType && count < (text || '').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
          isUser
            ? 'bg-slate-200 text-slate-600'
            : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </span>

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-brand-600 text-white'
            : 'rounded-tl-sm border border-slate-200 bg-white text-ink'
        }`}
      >
        {pending ? (
          <TypingDots />
        ) : isUser ? (
          <p className="whitespace-pre-wrap break-words">{visible}</p>
        ) : (
          <div className="break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {visible || ''}
            </ReactMarkdown>
            {typing && (
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 rounded-full bg-brand-500 align-middle"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        )}
        {!isUser && provider && !pending && !typing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            {provider}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-brand-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}
