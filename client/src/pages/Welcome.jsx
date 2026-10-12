import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { useTheme } from '../context/ThemeContext'

const currentYear = new Date().getFullYear()

function Welcome() {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <Link aria-label="Alnoor home" className="brand" to="/">
          <span className="brand-mark"><Icon name="leaf" size={23} /></span>
          <span className="brand-copy"><strong>Alnoor</strong></span>
        </Link>
        <div className="welcome-actions">
          <button aria-label={`Switch to ${theme === 'light' ? 'night' : 'day'} mode`} className="icon-button theme-button" onClick={toggleTheme} title={theme === 'light' ? 'Night mode' : 'Day mode'} type="button">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
          </button>
          <Link className="welcome-sign-in" to="/login">Sign in <Icon name="arrow" size={15} /></Link>
        </div>
      </header>

      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="eyebrow"><Icon name="leaf" size={15} /> GOOD THINGS, RIGHT AROUND THE CORNER</span>
          <h1>Welcome to<br /><em>Alnoor.</em></h1>
          <p>The familiar things that make a house feel like home. Find your everyday pantry favourites, thoughtfully brought together in one friendly neighbourhood shop.</p>
          <div className="welcome-buttons">
            <Link className="button button-dark" to="/login">Sign in to continue <Icon name="arrow" size={17} /></Link>
            <Link className="welcome-create" to="/register">New to Alnoor? <strong>Create an account</strong></Link>
          </div>
          <div className="welcome-promises"><span><Icon name="check" size={15} /> Your everyday essentials</span><span><Icon name="check" size={15} /> Picked with care</span></div>
        </div>

        <div aria-label="Rice, flour and pantry essentials" className="hero-art welcome-art" role="img">
          <div className="art-sun" />
          <div className="art-arch">
            <div className="sack sack-rice"><span>RICE</span></div>
            <div className="sack sack-flour"><span>ATTA</span></div>
            <div className="jar jar-lentils"><span /></div>
            <div className="jar jar-sugar"><span /></div>
            <div className="art-leaf leaf-one"><Icon name="leaf" size={68} /></div>
            <div className="art-leaf leaf-two"><Icon name="leaf" size={48} /></div>
            <div className="arch-caption">GOOD THINGS<br />FOR EVERY DAY</div>
          </div>
          <span className="art-sparkle sparkle-one">✳</span>
          <span className="art-sparkle sparkle-two">✳</span>
          <span className="welcome-art-note"><Icon name="leaf" size={17} /> A little closer to home</span>
        </div>
      </section>

      <section className="welcome-values">
        <article><span className="promise-icon"><Icon name="box" size={20} /></span><div><strong>Pantry favourites</strong><small>The everyday staples your home runs on.</small></div></article>
        <article><span className="promise-icon"><Icon name="leaf" size={20} /></span><div><strong>Chosen with care</strong><small>Good quality for your family and table.</small></div></article>
        <article><span className="promise-icon"><Icon name="users" size={20} /></span><div><strong>Here for the neighbourhood</strong><small>A familiar shop, always glad to see you.</small></div></article>
      </section>
      <footer className="welcome-footer"><strong>ALNOOR</strong><span>Good food, good homes, and a little more ease in the everyday.</span><span>© {currentYear} Alnoor</span></footer>
    </main>
  )
}

export default Welcome
