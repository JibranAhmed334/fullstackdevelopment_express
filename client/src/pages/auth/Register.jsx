import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFrame from '../../components/AuthFrame'
import Icon from '../../components/Icon'
import { useAuth } from '../../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const details = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await register(details)
      navigate('/login', { replace: true, state: { message: 'Your account is ready. Please sign in.' } })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame>
      <section className="auth-card auth-card-wide">
        <div className="auth-icon"><Icon name="users" size={23} /></div>
        <span className="eyebrow">MAKE YOURSELF AT HOME</span>
        <h1>Join the neighbourhood.</h1>
        <p className="auth-intro">Create an account for a more personal Alnoor experience.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field-label">Your name<input autoComplete="name" className="field-input" name="name" placeholder="Full name" required /></label>
            <label className="field-label">Email address<input autoComplete="email" className="field-input" name="email" placeholder="you@example.com" required type="email" /></label>
            <label className="field-label">Password<input autoComplete="new-password" className="field-input" minLength="8" name="password" placeholder="At least 8 characters" required type="password" /></label>
            <label className="field-label">Date of birth<input className="field-input" name="dob" required type="date" /></label>
            <label className="field-label">Work phone<input autoComplete="tel" className="field-input" name="workphone_no" placeholder="Work phone number" required type="tel" /></label>
            <label className="field-label">Mobile phone<input autoComplete="tel" className="field-input" name="cellphone_no" placeholder="Mobile phone number" required type="tel" /></label>
            <label className="field-label field-full">Home address<input autoComplete="street-address" className="field-input" name="address" placeholder="Street, area, city" required /></label>
          </div>
          <button className="button button-dark auth-submit" disabled={loading} type="submit">{loading ? 'Creating your account…' : 'Create account'}<Icon name="arrow" size={17} /></button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </AuthFrame>
  )
}

export default Register
