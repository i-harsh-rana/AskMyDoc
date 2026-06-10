import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import FormField from '../auth/FormField'
import SubmitButton from '../auth/SubmitButton'
import ErrorAlert from '../auth/ErrorAlert'

const PRESETS = [
  { providerName: 'openai', displayName: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { providerName: 'groq', displayName: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
  { providerName: 'gemini', displayName: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  { providerName: 'mistral', displayName: 'Mistral', baseUrl: 'https://api.mistral.ai/v1' },
  { providerName: 'github', displayName: 'GitHub Models', baseUrl: 'https://models.inference.ai.azure.com' },
]

function ProviderForm({ provider, onClose, onSubmit }) {
  const isEdit = !!provider
  const [form, setForm] = useState(() => ({
    providerName: provider?.providerName || '',
    displayName: provider?.displayName || '',
    baseUrl: provider?.baseUrl || '',
    bearerToken: '',
  }))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const applyPreset = (preset) =>
    setForm((prev) => ({ ...prev, ...preset }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.providerName.trim() || !form.displayName.trim() || !form.baseUrl.trim()) {
      setError('Provider name, display name and base URL are required.')
      return
    }
    if (!isEdit && !form.bearerToken.trim()) {
      setError('An API token is required.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        providerName: form.providerName.trim(),
        displayName: form.displayName.trim(),
        baseUrl: form.baseUrl.trim(),
      }
      if (form.bearerToken.trim()) payload.bearerToken = form.bearerToken.trim()
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            {isEdit ? 'Edit provider' : 'Add AI provider'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Connect a model by its API endpoint and token.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-slate-100 hover:text-ink"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {!isEdit && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Quick fill
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.providerName}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {preset.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <ErrorAlert message={error} />

        <FormField
          label="Display name"
          name="displayName"
          value={form.displayName}
          onChange={handleChange}
          placeholder="My OpenAI key"
        />
        <FormField
          label="Provider name"
          name="providerName"
          value={form.providerName}
          onChange={handleChange}
          placeholder="openai"
        />
        <FormField
          label="Base URL"
          name="baseUrl"
          value={form.baseUrl}
          onChange={handleChange}
          placeholder="https://api.openai.com/v1"
        />
        <FormField
          label={isEdit ? 'API token (leave blank to keep current)' : 'API token'}
          name="bearerToken"
          type="password"
          value={form.bearerToken}
          onChange={handleChange}
          placeholder="sk-..."
          autoComplete="off"
          required={!isEdit}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <div className="flex-1">
            <SubmitButton loading={loading}>
              {isEdit ? 'Save changes' : 'Add provider'}
            </SubmitButton>
          </div>
        </div>
      </form>
    </>
  )
}

export default function ProviderFormModal({ open, provider, onClose, onSubmit }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 max-h-[90svh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <ProviderForm
              provider={provider}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
