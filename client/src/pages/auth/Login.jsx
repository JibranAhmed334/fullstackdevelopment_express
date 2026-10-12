import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthFrame from '../../components/AuthFrame'
import Icon from '../../components/Icon'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(Object.fromEntries(new FormData(event.currentTarget)))
      navigate(result.role === 'admin' ? '/admin' : '/', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not sign you in. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame>
      <section className="auth-card">
        <div className="auth-icon"><Icon name="user" size={23} /></div>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Good to see you.</h1>
        <p className="auth-intro">Sign in to pick up right where you left off.</p>
        {location.state?.message && <p className="form-success" role="status">{location.state.message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field-label">Email address
            <input autoComplete="email" className="field-input" name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label className="field-label">Password
            <input autoComplete="current-password" className="field-input" name="password" placeholder="Your password" required type="password" />
          </label>
          <div className="form-meta"><Link to="/forgot-password">Forgot password?</Link></div>
          <button className="button button-dark auth-submit" disabled={loading} type="submit">{loading ? 'Signing you in…' : 'Sign in'}<Icon name="arrow" size={17} /></button>
        </form>
        <p className="auth-switch">New to Alnoor? <Link to="/register">Create an account</Link></p>
      </section>
    </AuthFrame>
  )
}

export default Login
