import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import SubmitButton from '../components/auth/SubmitButton'
import ErrorAlert from '../components/auth/ErrorAlert'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start chatting with your documents in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorAlert message={error} />

        <FormField
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        <SubmitButton loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
