import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/auth-context'
import { llmApi } from '../lib/api'
import Logo from '../components/Logo'
import ProviderCard from '../components/profile/ProviderCard'
import ProviderFormModal from '../components/profile/ProviderFormModal'

function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function Profile() {
  const { user, logout } = useAuth()
  const userId = user?.id

  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    llmApi
      .list(userId)
      .then((data) => {
        if (active) setProviders(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId])

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (provider) => {
    setEditing(provider)
    setModalOpen(true)
  }

  const handleSubmit = async (payload) => {
    if (editing) {
      const updated = await llmApi.update(userId, editing.id, payload)
      setProviders((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      )
    } else {
      const created = await llmApi.add(userId, payload)
      setProviders((prev) => [created, ...prev])
    }
    setModalOpen(false)
  }

  const handleToggle = async (provider) => {
    setBusyId(provider.id)
    try {
      const updated = await llmApi.toggle(userId, provider.id)
      setProviders((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (provider) => {
    if (!window.confirm(`Delete "${provider.displayName}"?`)) return
    setBusyId(provider.id)
    try {
      await llmApi.remove(userId, provider.id)
      setProviders((prev) => prev.filter((p) => p.id !== provider.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white shadow-lg shadow-brand-500/30">
            {initials(user?.name)}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              {user?.name || 'Your profile'}
            </h1>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
          {user?.role && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {user.role}
            </span>
          )}
        </motion.section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">AI Providers</h2>
              <p className="text-sm text-muted">
                Manage the models you use to chat with your documents.
              </p>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add provider
            </button>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8v8M8 12h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-ink">No providers yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Add any model from the GitHub Models Marketplace to get started.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Add your first provider
              </button>
            </div>
          ) : (
            <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    busy={busyId === provider.id}
                    onToggle={() => handleToggle(provider)}
                    onEdit={() => openEdit(provider)}
                    onDelete={() => handleDelete(provider)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      <ProviderFormModal
        open={modalOpen}
        provider={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
