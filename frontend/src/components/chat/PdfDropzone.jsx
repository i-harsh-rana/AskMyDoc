import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import DocCard from './DocCard'

export default function PdfDropzone({ onUpload, uploading, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [localError, setLocalError] = useState('')

  const pickFile = (candidate) => {
    if (!candidate) return
    if (candidate.type !== 'application/pdf') {
      setLocalError('Only PDF files are supported.')
      setFile(null)
      return
    }
    setLocalError('')
    setFile(candidate)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-xl"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Chat with your <span className="text-brand-600">PDF</span>
        </h1>
        <p className="mt-3 text-muted">
          Upload a document and ask anything — AskMyDoc reads it for you.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={`mt-8 cursor-pointer rounded-3xl border-2 border-dashed bg-white px-6 py-12 text-center transition-colors ${
          dragging
            ? 'border-brand-500 bg-brand-50/60'
            : 'border-slate-300 hover:border-brand-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />

        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0L8 8m4-4 4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>

        {file ? (
          <div
            className="mt-5 flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <DocCard name={file.name} />
          </div>
        ) : (
          <div className="mt-5">
            <p className="font-semibold text-ink">
              Drop a PDF here, or click to browse
            </p>
            <p className="text-sm text-muted">Single PDF, up to 50 MB</p>
          </div>
        )}
      </div>

      {(localError || error) && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError || error}
        </p>
      )}

      <button
        type="button"
        disabled={!file || uploading}
        onClick={() => file && onUpload(file)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {uploading ? (
          <>
            <Spinner /> Uploading…
          </>
        ) : (
          'Start chatting'
        )}
      </button>
    </motion.div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
