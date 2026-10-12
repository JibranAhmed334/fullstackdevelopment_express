import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Icon from '../components/Icon'
import Navbar from '../components/navbar'
import { useAuth } from '../context/AuthContext'

const currentYear = new Date().getFullYear()

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  if (!user) return <Navigate replace to="/login" />

  async function handleLogout() {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Signed out on this device, but the server could not confirm the session.')
      navigate('/', { replace: true })
    }
  }

  const details = [
    ['Email address', user.email],
    ['Mobile phone', user.cellphone_no],
    ['Work phone', user.workphone_no],
    ['Home address', user.address],
    ['Date of birth', user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'],
  ]

  return (
    <div className="store-page">
      <Navbar />
      <main className="account-page">
        <div className="account-intro"><span className="eyebrow">YOUR ALNOOR ACCOUNT</span><h1>A little space for you.</h1><p>Your account details, all in one place.</p></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <section className="profile-card">
          <div className="profile-heading">
            <div className="profile-avatar">{user.name?.slice(0, 1).toUpperCase() || <Icon name="user" size={25} />}</div>
            <div><h2>{user.name}</h2><span className="profile-badge"><Icon name="check" size={13} /> {user.role === 'admin' ? 'Store administrator' : 'Alnoor customer'}</span></div>
          </div>
          <div className="profile-details">
            {details.map(([label, value]) => <div className="profile-detail" key={label}><span>{label}</span><strong>{value || 'Not provided'}</strong></div>)}
          </div>
          <div className="profile-actions">
            {user.role === 'admin' && <Link className="button button-outline" to="/admin"><Icon name="grid" size={17} /> Open dashboard</Link>}
            <button className="button button-outline" onClick={handleLogout} type="button"><Icon name="logout" size={17} /> Sign out</button>
          </div>
        </section>
        <p className="profile-note">Need to change your account details? Please visit your neighbourhood Alnoor store for a hand.</p>
      </main>
      <footer className="site-footer"><Link className="footer-brand" to="/">ALNOOR</Link><span>Everyday essentials, chosen with care.</span><span>© {currentYear} Alnoor</span></footer>
    </div>
  )
}

export default Profile
