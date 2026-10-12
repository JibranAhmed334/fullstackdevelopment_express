import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

function Navbar({ cartCount = 0, onCartClick, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  function handleSearch(event) {
    event.preventDefault()
    const query = searchTerm.trim()
    if (query) onSearch?.(query)
  }

  async function handleLogout() {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      navigate('/', { replace: true, state: { message: 'Signed out on this device.' } })
    }
  }

  const links = (
    <>
      <Link className="nav-link" onClick={() => setMenuOpen(false)} to="/">Shop</Link>
      {user ? (
        <>
          {user.role === 'admin' && <Link aria-label="Admin dashboard" className="nav-link" onClick={() => setMenuOpen(false)} to="/admin">Admin</Link>}
          <Link aria-label="Your profile" className="icon-button profile-nav-button" onClick={() => setMenuOpen(false)} title="Your profile" to="/profile"><Icon name="user" size={19} /></Link>
          <button className="nav-link nav-button" onClick={handleLogout} type="button">Sign out</button>
        </>
      ) : (
        <>
          <Link className="nav-link" onClick={() => setMenuOpen(false)} to="/login">Sign in</Link>
          <Link className="nav-link" onClick={() => setMenuOpen(false)} to="/register">Create account</Link>
        </>
      )}
    </>
  )

  return (
    <header className="site-header">
      <div className="announcement">Your neighbourhood store, a little closer to home</div>
      <div className="navbar-wrap">
        <Link aria-label="Alnoor home" className="brand" to="/">
          <span className="brand-mark"><Icon name="leaf" size={23} /></span>
            <span className="brand-copy"><strong>Alnoor</strong></span>
        </Link>

        <nav aria-label="Main navigation" className="desktop-nav">{links}</nav>

        <div className="header-actions">
          <form aria-label="Product search" className="nav-search" onSubmit={handleSearch} role="search">
            <Icon name="search" size={17} />
            <input aria-label="Search products" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search the store" type="search" value={searchTerm} />
          </form>
          <button aria-label={`Shopping bag, ${cartCount} items`} className="icon-button bag-button" onClick={onCartClick} type="button">
            <Icon name="bag" size={19} /><span className="bag-count">{cartCount}</span>
          </button>
          <button aria-label={`Switch to ${theme === 'light' ? 'night' : 'day'} mode`} className="icon-button theme-button" onClick={toggleTheme} title={theme === 'light' ? 'Night mode' : 'Day mode'} type="button">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
          </button>
          <button aria-expanded={menuOpen} aria-label="Toggle navigation menu" className="icon-button menu-button" onClick={() => setMenuOpen((open) => !open)} type="button">
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>
      {menuOpen && <nav aria-label="Mobile navigation" className="mobile-nav">{links}</nav>}
    </header>
  )
}

export default Navbar
