import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from '../components/Logo'
import PdfDropzone from '../components/chat/PdfDropzone'
import MessageBubble from '../components/chat/MessageBubble'
import ChatComposer from '../components/chat/ChatComposer'
import DocCard from '../components/chat/DocCard'
import ChatSidebar from '../components/chat/ChatSidebar'
import { useAuth } from '../context/auth-context'
import { chatApi, llmApi } from '../lib/api'

function toUiMessage(m) {
  return {
    id: m.id,
    role: m.role,
    text: m.role === 'USER' ? m.question : m.answer,
    provider: m.role === 'ASSISTANT' ? m.llmProviderUsed : null,
  }
}

export default function Chat() {
  const { user, logout } = useAuth()

  const [phase, setPhase] = useState('upload')
  const [chat, setChat] = useState(null)
  const [docName, setDocName] = useState('')
  const [messages, setMessages] = useState([])
  const [providers, setProviders] = useState([])
  const [chats, setChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const scrollRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    llmApi
      .list(user.id)
      .then((data) =>
        setProviders((Array.isArray(data) ? data : []).filter((p) => p.isActive)),
      )
      .catch(() => setProviders([]))
  }, [user?.id])

  useEffect(() => {
    chatApi
      .listChats()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setChats(list)
      })
      .catch(() => setChats([]))
      .finally(() => setChatsLoading(false))
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  const patchChatInList = useCallback((id, patch) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  useEffect(() => {
    if (phase !== 'processing' || !chat?.id) return undefined
    let active = true
    const poll = async () => {
      try {
        const fresh = await chatApi.getChat(chat.id)
        if (!active) return
        if (fresh.documentStatus === 'READY') {
          setChat(fresh)
          setPhase('ready')
          patchChatInList(fresh.id, { documentStatus: 'READY' })
        } else if (fresh.documentStatus === 'FAILED') {
          setPhase('failed')
          patchChatInList(fresh.id, { documentStatus: 'FAILED' })
        }
      } catch {
        void 0
      }
    }
    const timer = setInterval(poll, 2000)
    poll()
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [phase, chat?.id, patchChatInList])

  const handleUpload = useCallback(async (file) => {
    setUploading(true)
    setError('')
    setDocName(file.name)
    try {
      const created = await chatApi.create(file)
      setChat(created)
      setChats((prev) => [created, ...prev])
      setMessages([])
      setPhase(created.documentStatus === 'READY' ? 'ready' : 'processing')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }, [])

  const openChat = useCallback(async (item) => {
    setSidebarOpen(false)
    setChat(item)
    setDocName(item.title || `Chat #${item.id}`)
    setError('')
    if (item.documentStatus === 'READY') {
      setPhase('ready')
      try {
        const msgs = await chatApi.getMessages(item.id)
        setMessages((Array.isArray(msgs) ? msgs : []).map(toUiMessage))
      } catch (err) {
        setError(err.message)
        setMessages([])
      }
    } else if (item.documentStatus === 'FAILED') {
      setPhase('failed')
      setMessages([])
    } else {
      setPhase('processing')
      setMessages([])
    }
  }, [])

  const handleSend = useCallback(
    async ({ question, llmProviderId, llmEnabled }) => {
      if (!chat?.id) return
      const tempId = `tmp-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: `${tempId}-q`, role: 'USER', text: question },
        { id: `${tempId}-a`, role: 'ASSISTANT', pending: true },
      ])
      setSending(true)
      try {
        const res = await chatApi.sendMessage(chat.id, {
          question,
          llmProviderId,
          llmEnabled,
        })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === `${tempId}-a`
              ? {
                  ...m,
                  pending: false,
                  animate: true,
                  text: res.answer,
                  provider: res.llmProviderUsed,
                }
              : m,
          ),
        )
        if (res.chatTitle) {
          setDocName(res.chatTitle)
          setChat((prev) => (prev ? { ...prev, title: res.chatTitle } : prev))
          patchChatInList(chat.id, { title: res.chatTitle })
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === `${tempId}-a`
              ? { ...m, pending: false, text: `⚠️ ${err.message}`, provider: null }
              : m,
          ),
        )
      } finally {
        setSending(false)
      }
    },
    [chat?.id, patchChatInList],
  )

  const resetChat = useCallback(() => {
    setSidebarOpen(false)
    setPhase('upload')
    setChat(null)
    setDocName('')
    setMessages([])
    setError('')
  }, [])

  const deleteChat = useCallback(
    async (item) => {
      if (!window.confirm(`Delete "${item.title || `Chat #${item.id}`}"?`)) return
      setDeletingId(item.id)
      try {
        await chatApi.remove(item.id)
        setChats((prev) => prev.filter((c) => c.id !== item.id))
        if (chat?.id === item.id) resetChat()
      } catch (err) {
        setError(err.message)
      } finally {
        setDeletingId(null)
      }
    },
    [chat?.id, resetChat],
  )

  const sidebar = (
    <ChatSidebar
      chats={chats}
      activeId={chat?.id}
      loading={chatsLoading}
      deletingId={deletingId}
      onOpen={openChat}
      onNew={resetChat}
      onDelete={deleteChat}
    />
  )

  return (
    <div className="flex h-svh flex-col bg-slate-50">
      <header className="z-40 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle history"
              onClick={() => setSidebarOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-slate-100 md:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 md:block">
          {sidebar}
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-ink/30 md:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 shadow-xl md:hidden"
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 flex-col">
          {phase === 'upload' && (
            <main className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-10">
              <PdfDropzone onUpload={handleUpload} uploading={uploading} error={error} />
            </main>
          )}

          {(phase === 'processing' || phase === 'ready') && (
            <div className="z-30 shrink-0 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-lg sm:px-6">
              <div className="mx-auto max-w-3xl">
                <DocCard name={docName} status={phase} />
              </div>
            </div>
          )}

          {phase === 'processing' && (
            <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
              <motion.span
                className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.span>
              <h2 className="mt-5 text-lg font-bold text-ink">Reading your document…</h2>
              <p className="mt-2 max-w-sm text-muted">
                We’re extracting and indexing the text. This usually takes a few seconds.
              </p>
            </main>
          )}

          {phase === 'failed' && (
            <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-red-100 text-red-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <h2 className="mt-6 text-xl font-bold text-ink">Processing failed</h2>
              <p className="mt-2 max-w-sm text-muted">
                We couldn’t process that document. Please try a different PDF.
              </p>
              <button
                type="button"
                onClick={resetChat}
                className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Try another file
              </button>
            </main>
          )}

          {phase === 'ready' && (
            <>
              <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-5">
                  {messages.length === 0 ? (
                    <div className="mt-10 text-center">
                      <h2 className="text-lg font-bold text-ink">Your document is ready 🎉</h2>
                      <p className="mt-1 text-muted">
                        Ask anything — summaries, specific facts, explanations.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        role={m.role}
                        text={m.text}
                        provider={m.provider}
                        pending={m.pending}
                        animate={m.animate}
                        onType={scrollToBottom}
                      />
                    ))
                  )}
                </div>
              </main>
              <ChatComposer providers={providers} onSend={handleSend} disabled={sending} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
