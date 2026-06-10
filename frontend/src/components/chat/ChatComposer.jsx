import { useRef, useState } from 'react'

export default function ChatComposer({ providers, onSend, disabled }) {
  const [value, setValue] = useState('')
  const [providerId, setProviderId] = useState('default')
  const textareaRef = useRef(null)

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const submit = () => {
    const question = value.trim()
    if (!question || disabled) return
    const useProvider = providerId !== 'default'
    onSend({
      question,
      llmProviderId: useProvider ? Number(providerId) : null,
      llmEnabled: useProvider,
    })
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div className="border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-lg sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="flex flex-1 items-end rounded-2xl border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              resize()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Ask something about your document…"
            className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {providers.length > 0 && (
        <div className="mx-auto mt-2 flex max-w-3xl items-center gap-2 text-xs text-muted">
          <span>Model:</span>
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium text-ink outline-none focus:border-brand-400"
          >
            <option value="default">GPT-4o Mini (built-in)</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
