import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'
import AuthFrame from '../../components/AuthFrame'
import Icon from '../../components/Icon'

function ForgotPassword() {
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function requestReset(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const address = form.get('email')
    try {
      const { data } = await api.post('/auth/forgot-password', { email: address })
      setEmail(address)
      setMessage(data.message || 'If an account matches that address, reset instructions are on their way.')
      setStep('reset')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not send reset instructions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const { data } = await api.post('/auth/reset-password', { ...values, email })
      setMessage(data.message || 'Your password has been updated. You can sign in now.')
      setStep('done')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'That reset code could not be verified. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame>
      <section className="auth-card">
        <div className="auth-icon"><Icon name="lock" size={23} /></div>
        <span className="eyebrow">ACCOUNT ACCESS</span>
        <h1>{step === 'request' ? 'Forgot your password?' : step === 'reset' ? 'Choose a new password.' : 'All set.'}</h1>
        <p className="auth-intro">{step === 'request' ? 'It happens. Enter your email and we’ll send you a secure reset code.' : step === 'reset' ? `Enter the code sent to ${email} and choose a new password.` : 'Your password has been reset. Sign in with your new password.'}</p>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {step === 'request' && (
          <form className="form-stack" onSubmit={requestReset}>
            <label className="field-label">Email address<input autoComplete="email" className="field-input" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label>
            <button className="button button-dark auth-submit" disabled={loading} type="submit">{loading ? 'Sending instructions…' : 'Send reset code'}<Icon name="arrow" size={17} /></button>
          </form>
        )}
        {step === 'reset' && (
          <form className="form-stack" onSubmit={resetPassword}>
            <label className="field-label">Reset code<input autoComplete="one-time-code" className="field-input" name="token" placeholder="Enter the code from your email" required /></label>
            <label className="field-label">New password<input autoComplete="new-password" className="field-input" minLength="8" name="password" placeholder="At least 8 characters" required type="password" /></label>
            <button className="button button-dark auth-submit" disabled={loading} type="submit">{loading ? 'Updating password…' : 'Update password'}<Icon name="arrow" size={17} /></button>
            <button className="text-button" onClick={() => { setStep('request'); setError(''); setMessage('') }} type="button">Use a different email address</button>
          </form>
        )}
        {step === 'done' && <Link className="button button-dark auth-submit" to="/login">Back to sign in<Icon name="arrow" size={17} /></Link>}
        {step !== 'done' && <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>}
      </section>
    </AuthFrame>
  )
}

export default ForgotPassword
