import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

function AuthFrame({ children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="auth-page">
      <div className="auth-topline">
        <Link aria-label="Alnoor General Store home" className="brand" to="/">
          <span className="brand-mark"><Icon name="leaf" size={22} /></span>
          <span className="brand-copy"><strong>Alnoor</strong><small>GENERAL STORE</small></span>
        </Link>
        <button aria-label={`Switch to ${theme === 'light' ? 'night' : 'day'} mode`} className="icon-button theme-button" onClick={toggleTheme} type="button">
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
        </button>
      </div>
      <div className="auth-content">{children}</div>
      <p className="auth-footer">A good day starts with the little things.</p>
    </main>
  )
}

export default AuthFrame
