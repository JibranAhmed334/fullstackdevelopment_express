import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api'
import Icon from '../components/Icon'
import Navbar from '../components/navbar'
import { useAuth } from '../context/AuthContext'

const money = new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })
const currentYear = new Date().getFullYear()

function Home() {
  const { user } = useAuth()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('alnoor-cart')) || {}
    } catch {
      return {}
    }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/products')
      .then(({ data }) => {
        if (active) setProducts(Array.isArray(data.product) ? data.product : [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'We could not load the shelves. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    if (user) {
      api.get('/categories')
        .then(({ data }) => {
          if (active) {
            const categoryList = Array.isArray(data.data) ? data.data : []
            setCategories(categoryList.map((category) => category.category_name))
            setCategoryError('')
          }
        })
        .catch((requestError) => {
          if (active) setCategoryError(requestError.response?.data?.message || 'Categories could not be loaded.')
        })
    }

    return () => { active = false }
  }, [user])

  useEffect(() => {
    localStorage.setItem('alnoor-cart', JSON.stringify(cart))
  }, [cart])

  const categoryNames = useMemo(() => {
    const productCategories = products.map((product) => product.category?.category_name).filter(Boolean)
    return ['All', ...new Set([...categories, ...productCategories])]
  }, [categories, products])

  const visibleProducts = useMemo(() => products.filter((product) => {
    const categoryName = product.category?.category_name || ''
    const matchesCategory = filter === 'All' || categoryName.toLowerCase() === filter.toLowerCase()
    const matchesQuery = `${product.product_name} ${categoryName}`.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  }), [filter, products, query])

  const cartLines = products.filter((product) => cart[product._id])
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const cartTotal = cartLines.reduce((total, product) => total + product.price * cart[product._id], 0)

  function addToCart(product) {
    setCart((current) => ({ ...current, [product._id]: (current[product._id] || 0) + 1 }))
  }

  function changeQuantity(productId, change) {
    setCart((current) => {
      const quantity = (current[productId] || 0) + change
      const next = { ...current }
      if (quantity <= 0) delete next[productId]
      else next[productId] = quantity
      return next
    })
  }

  return (
    <div className="store-page">
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} onSearch={setQuery} />

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="leaf" size={15} /> THE EVERYDAY GOOD STUFF</span>
            <h1>Your home,<br /><em>well stocked.</em></h1>
            <p>Fresh pantry staples and everyday essentials, picked with care for the people around our table.</p>
            <a className="button button-dark" href="#shop">Shop the shelves <Icon name="arrow" size={17} /></a>
            <div className="hero-notes"><span><Icon name="check" size={15} /> Honest everyday prices</span><span><Icon name="check" size={15} /> The essentials you trust</span></div>
          </div>
          <div aria-label="Fresh pantry essentials" className="hero-art" role="img">
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
          </div>
        </section>

        <section className="promise-strip" aria-label="Store values">
          <div><span className="promise-icon"><Icon name="box" size={20} /></span><span><strong>Pantry favourites</strong><small>Everyday essentials, all in one place</small></span></div>
          <div><span className="promise-icon"><Icon name="leaf" size={20} /></span><span><strong>Chosen with care</strong><small>Good quality for your home</small></span></div>
          <div><span className="promise-icon"><Icon name="users" size={20} /></span><span><strong>Your local store</strong><small>Here for the neighbourhood</small></span></div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div><span className="eyebrow">A LITTLE BIT OF EVERYTHING</span><h2>Shop the shelves</h2></div>
            <p>From the first cup of chai to the last thing on your list.</p>
          </div>

          {categoryError && <p className="inline-notice">{categoryError} Showing categories from available products.</p>}
          <div aria-label="Filter by category" className="category-tabs" role="group">
            {categoryNames.map((category) => (
              <button aria-pressed={filter === category} className={`category-tab ${filter === category ? 'active' : ''}`} key={category} onClick={() => setFilter(category)} type="button">
                {category === 'All' && <Icon name="grid" size={15} />}{category}
              </button>
            ))}
          </div>

          {error ? (
            <div className="empty-state"><div className="empty-icon"><Icon name="box" size={27} /></div><h3>Couldn’t open the shelves</h3><p>{error}</p><button className="button button-outline" onClick={() => window.location.reload()} type="button">Try again</button></div>
          ) : loading ? (
            <div className="product-grid">{[1, 2, 3, 4].map((item) => <div aria-hidden="true" className="product-skeleton" key={item}><div /><span /><span /></div>)}</div>
          ) : visibleProducts.length ? (
            <div className="product-grid">
              {visibleProducts.map((product, index) => (
                <article className="product-card" key={product._id}>
                  <div className={`product-photo photo-tone-${index % 4}`}>
                    {product.product_image_url ? <img alt={product.product_name} loading="lazy" src={product.product_image_url} /> : <Icon name="box" size={42} />}
                    <span className="photo-category">{product.category?.category_name || 'Store pick'}</span>
                  </div>
                  <div className="product-details">
                    <p className="product-category">{product.category?.category_name || 'ALNOOR PICK'}</p>
                    <h3>{product.product_name}</h3>
                    <div className="product-buy"><strong>{money.format(product.price)}</strong><button aria-label={`Add ${product.product_name} to bag`} className="add-button" onClick={() => addToCart(product)} type="button"><Icon name="plus" size={18} /></button></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon"><Icon name="search" size={25} /></div><h3>{query ? 'Nothing on this shelf' : 'The shelves are being filled'}</h3><p>{query ? 'Try another search or browse all products.' : 'Our team is getting the store ready. Please check back soon.'}</p>{query && <button className="button button-outline" onClick={() => { setQuery(''); setFilter('All') }} type="button">Show everything</button>}</div>
          )}
        </section>

        <section className="closing-note">
          <span className="closing-mark"><Icon name="leaf" size={23} /></span>
          <p>Good food, good homes, and a little more ease in the everyday.</p>
          <span>That’s the Alnoor way.</span>
        </section>
      </main>

      <footer className="site-footer"><Link className="footer-brand" to="/">ALNOOR</Link><span>Everyday essentials, chosen with care.</span><span>© {currentYear} Alnoor</span></footer>

      {location.state?.message && <div className="toast-message" role="status">{location.state.message}</div>}
      {cartOpen && (
        <div className="cart-backdrop" onClick={() => setCartOpen(false)} role="presentation">
          <aside aria-label="Shopping bag" aria-modal="true" className="cart-drawer" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="cart-header"><div><span className="eyebrow">YOUR SELECTION</span><h2>Shopping bag <span>({cartCount})</span></h2></div><button aria-label="Close bag" className="icon-button" onClick={() => setCartOpen(false)} type="button"><Icon name="close" /></button></div>
            {cartLines.length ? (
              <>
                <div className="cart-lines">{cartLines.map((product) => <div className="cart-line" key={product._id}>
                  <div className="cart-thumb">{product.product_image_url && <img alt="" src={product.product_image_url} />}</div>
                  <div className="cart-product"><strong>{product.product_name}</strong><small>{money.format(product.price)} each</small><div className="quantity-control"><button aria-label={`Remove one ${product.product_name}`} onClick={() => changeQuantity(product._id, -1)} type="button">−</button><span>{cart[product._id]}</span><button aria-label={`Add one ${product.product_name}`} onClick={() => changeQuantity(product._id, 1)} type="button">+</button></div></div>
                  <strong>{money.format(product.price * cart[product._id])}</strong>
                </div>)}</div>
                <div className="cart-total"><span>Estimated total</span><strong>{money.format(cartTotal)}</strong></div>
                <p className="cart-footnote">Your bag is saved on this device. Visit or contact Alnoor to complete your order.</p>
              </>
            ) : <div className="empty-cart"><Icon name="bag" size={34} /><h3>Your bag is taking a breather</h3><p>Add a few everyday favourites to get started.</p></div>}
          </aside>
        </div>
      )}
    </div>
  )
}

export default Home
