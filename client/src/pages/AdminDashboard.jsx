import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import Icon from '../components/Icon'
import Navbar from '../components/navbar'

const currentYear = new Date().getFullYear()

function getRequestError(error, fallback) {
  return error.response?.data?.message || error.response?.data?.massage || (error.response ? fallback : `${fallback} Check that the server is running and try again.`)
}

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [adminProfile, setAdminProfile] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [addedProduct, setAddedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [working, setWorking] = useState(false)
  const [inventoryQuery, setInventoryQuery] = useState('')

  const filteredProducts = useMemo(() => products.filter((product) => (
    `${product.product_name} ${product.category?.category_name || ''}`.toLowerCase().includes(inventoryQuery.toLowerCase())
  )), [inventoryQuery, products])

  const loadStoreData = useCallback(async () => {
    try {
      const [productResponse, categoryResponse, profileResponse] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/auth/profile'),
      ])
      setProducts(Array.isArray(productResponse.data.product) ? productResponse.data.product : [])
      setCategories(Array.isArray(categoryResponse.data.data) ? categoryResponse.data.data : [])
      setAdminProfile(profileResponse.data.profile)
      setError('')
    } catch (requestError) {
      setError(getRequestError(requestError, 'We could not load the store dashboard.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStoreData() }, [loadStoreData])

  async function handleAddCategory(event) {
    event.preventDefault()
    setNotice('')
    setError('')
    setWorking(true)
    const form = event.currentTarget
    const categoryName = new FormData(form).get('category_name')
    try {
      await api.post('/categories', { category_name: categoryName })
      form.reset()
      setNotice('Category added to the store.')
      await loadStoreData()
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not add this category.'))
    } finally {
      setWorking(false)
    }
  }

  async function handleAddProduct(event) {
    event.preventDefault()
    setNotice('')
    setError('')
    const form = event.currentTarget
    const values = new FormData(form)
    const image = values.get('product_image')
    if (!(image instanceof File) || !image.size) {
      setError('Choose a product image before adding this item.')
      return
    }
    if (!image.type.startsWith('image/')) {
      setError('The selected file must be an image.')
      return
    }
    if (image.size > 8 * 1024 * 1024) {
      setError('Choose an image smaller than 8 MB.')
      return
    }
    setWorking(true)
    try {
      const { data } = await api.post('/products', values)
      if (!data.success || !data.product?._id) {
        throw new Error(data.massage || data.message || 'The server did not confirm that the product was saved.')
      }

      const savedProduct = {
        ...data.product,
        category: categories.find((category) => category._id === data.product.category) || data.product.category,
      }
      form.reset()
      setProducts((current) => [savedProduct, ...current])
      setAddedProduct(savedProduct)
      setNotice('')
      void loadStoreData()
    } catch (requestError) {
      setError(getRequestError(requestError, requestError.message || 'Could not add this product.'))
    } finally {
      setWorking(false)
    }
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Remove ${product.product_name} from the store?`)) return
    setError('')
    setNotice('')
    try {
      const { data } = await api.delete(`/products/${product._id}`)
      setProducts((current) => current.filter((item) => item._id !== product._id))
      setNotice(data.warning || `${product.product_name} was removed.`)
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not remove this product.'))
    }
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Remove the ${category.category_name} category?`)) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/categories/${category._id}`)
      setCategories((current) => current.filter((item) => item._id !== category._id))
      setNotice(`${category.category_name} category was removed.`)
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not remove this category.'))
    }
  }

  async function openCategoryEditor(category) {
    setError('')
    try {
      const { data } = await api.get(`/categories/${category._id}`)
      setEditingCategory(data.category)
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not load this category.'))
    }
  }

  async function saveCategory(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setWorking(true)
    const categoryName = new FormData(event.currentTarget).get('category_name')
    try {
      await api.put(`/categories/${editingCategory._id}`, { category_name: categoryName })
      setEditingCategory(null)
      setNotice('Category updated.')
      await loadStoreData()
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not update this category.'))
    } finally {
      setWorking(false)
    }
  }

  async function openProductEditor(product) {
    setError('')
    try {
      const { data } = await api.get(`/products/${product._id}`)
      setEditingProduct(data.product)
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not load this product.'))
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setWorking(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await api.patch(`/products/${editingProduct._id}`, values)
      setEditingProduct(null)
      setNotice('Product updated.')
      await loadStoreData()
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not update this product.'))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="store-page">
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-heading">
          <div><span className="eyebrow">ALNOOR STORE DESK</span><h1>A good day to keep things moving.</h1><p>Manage the products and categories your neighbours see in the store.</p>{adminProfile && <p className="dashboard-greeting">Signed in as {adminProfile.name} · {adminProfile.email}</p>}</div>
          <Link className="button button-outline" to="/"><Icon name="bag" size={17} /> View shop</Link>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}

        <section className="dashboard-stats" aria-label="Store summary">
          <article className="stat-card"><span className="stat-icon"><Icon name="box" size={20} /></span><span className="stat-label">Products on shelf</span><strong>{loading ? '—' : products.length}</strong><small>Available in the shop</small></article>
          <article className="stat-card"><span className="stat-icon stat-icon-warm"><Icon name="grid" size={20} /></span><span className="stat-label">Store categories</span><strong>{loading ? '—' : categories.length}</strong><small>Ways to find the essentials</small></article>
          <article className="stat-card"><span className="stat-icon stat-icon-blue"><Icon name="shield" size={20} /></span><span className="stat-label">Store status</span><strong className="status-open">Open</strong><small>Catalog is ready for customers</small></article>
        </section>

        <div className="dashboard-columns">
          <section className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">THE PANTRY AND MORE</span><h2>Add a product</h2></div><span className="panel-mark"><Icon name="plus" size={18} /></span></div>
            <form className="form-stack" onSubmit={handleAddProduct}>
              <label className="field-label">Product name<input className="field-input" name="product_name" placeholder="e.g. Basmati rice" required /></label>
              <div className="form-grid">
                <label className="field-label">Price (PKR)<input className="field-input" min="1" name="price" placeholder="0" required step="any" type="number" /></label>
                <label className="field-label">Category<select className="field-input" defaultValue="" name="category" required><option disabled value="">Choose category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.category_name}</option>)}</select></label>
              </div>
              {!categories.length && <p className="field-hint">Add a category first to make products available.</p>}
              <label className="field-label">Product photo<input accept="image/*" className="field-input file-input" name="product_image" required type="file" /></label>
              <button className="button button-dark" disabled={working || !categories.length} type="submit">{working ? 'Saving…' : 'Add to shelves'}<Icon name="arrow" size={17} /></button>
            </form>
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">ORGANISE THE SHOP</span><h2>Product categories</h2></div><span className="panel-mark panel-mark-warm"><Icon name="grid" size={18} /></span></div>
            <form className="category-create" onSubmit={handleAddCategory}>
              <label className="field-label">New category<input className="field-input" name="category_name" placeholder="e.g. Rice & grains" required /></label>
              <button aria-label="Add category" className="button button-dark" disabled={working} type="submit"><Icon name="plus" size={17} /> Add</button>
            </form>
            <div className="admin-category-list">
              {categories.length ? categories.map((category) => <div className="admin-category" key={category._id}><span className="category-dot"><Icon name="leaf" size={16} /></span><strong>{category.category_name}</strong><button aria-label={`Edit ${category.category_name} category`} className="icon-button" onClick={() => openCategoryEditor(category)} type="button"><Icon name="pencil" size={15} /></button><button aria-label={`Delete ${category.category_name} category`} className="icon-button delete-button" onClick={() => handleDeleteCategory(category)} type="button"><Icon name="close" size={16} /></button></div>) : <p className="muted-copy">No categories yet. Add one to start organising products.</p>}
            </div>
          </section>
        </div>

        <section className="dashboard-panel inventory-panel">
          <div className="panel-heading"><div><span className="eyebrow">CURRENT CATALOG</span><h2>On the shelves</h2></div><span className="inventory-count">{products.length} items</span></div>
          <label className="inventory-search"><Icon name="search" size={16} /><input aria-label="Search inventory" onChange={(event) => setInventoryQuery(event.target.value)} placeholder="Find a product or category" type="search" value={inventoryQuery} /></label>
          {loading ? <p className="muted-copy">Loading your catalog…</p> : filteredProducts.length ? (
            <div className="inventory-list">{filteredProducts.map((product) => <article className="inventory-item" key={product._id}>
              <div className="inventory-photo">{product.product_image_url && <img alt="" src={product.product_image_url} />}</div>
              <div className="inventory-info"><strong>{product.product_name}</strong><span>{product.category?.category_name || 'Uncategorised'}</span></div>
              <strong className="inventory-price">PKR {Number(product.price).toLocaleString('en-PK')}</strong>
              <div className="inventory-actions"><button aria-label={`Edit ${product.product_name}`} className="icon-button" onClick={() => openProductEditor(product)} type="button"><Icon name="pencil" size={15} /></button><button aria-label={`Delete ${product.product_name}`} className="icon-button delete-button" onClick={() => handleDeleteProduct(product)} type="button"><Icon name="close" size={17} /></button></div>
            </article>)}</div>
          ) : <p className="muted-copy">{products.length ? 'No items match that search. Try a different name or category.' : 'No products have been added yet.'}</p>}
        </section>
      </main>
      <footer className="site-footer"><Link className="footer-brand" to="/">ALNOOR</Link><span>Store desk · Manage with care.</span><span>© {currentYear} Alnoor</span></footer>
      {(editingCategory || editingProduct) && (
        <div className="cart-backdrop" onClick={() => { setEditingCategory(null); setEditingProduct(null) }} role="presentation">
          <section aria-labelledby="editor-title" aria-modal="true" className="editor-dialog" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="panel-heading"><div><span className="eyebrow">STORE CATALOG</span><h2 id="editor-title">Edit {editingCategory ? 'category' : 'product'}</h2></div><button aria-label="Close editor" className="icon-button" onClick={() => { setEditingCategory(null); setEditingProduct(null) }} type="button"><Icon name="close" /></button></div>
            {editingCategory ? (
              <form className="form-stack" onSubmit={saveCategory}><label className="field-label">Category name<input className="field-input" defaultValue={editingCategory.category_name} name="category_name" required /></label><button className="button button-dark" disabled={working} type="submit">{working ? 'Saving…' : 'Save category'}<Icon name="check" size={17} /></button></form>
            ) : (
              <form className="form-stack" onSubmit={saveProduct}><label className="field-label">Product name<input className="field-input" defaultValue={editingProduct.product_name} name="product_name" required /></label><div className="form-grid"><label className="field-label">Price (PKR)<input className="field-input" defaultValue={editingProduct.price} min="1" name="price" required step="any" type="number" /></label><label className="field-label">Category<select className="field-input" defaultValue={editingProduct.category?._id || editingProduct.category} name="category" required>{categories.map((category) => <option key={category._id} value={category._id}>{category.category_name}</option>)}</select></label></div><button className="button button-dark" disabled={working} type="submit">{working ? 'Saving…' : 'Save product'}<Icon name="check" size={17} /></button></form>
            )}
            {addedProduct && (
              <div className="cart-backdrop success-backdrop" onClick={() => setAddedProduct(null)} role="presentation">
                <section aria-labelledby="product-added-title" aria-modal="true" className="success-dialog" onClick={(event) => event.stopPropagation()} role="dialog">
                  <button aria-label="Close confirmation" className="icon-button success-close" onClick={() => setAddedProduct(null)} type="button"><Icon name="close" size={18} /></button>
                  <span className="success-check"><Icon name="check" size={30} /></span>
                  <span className="eyebrow">CATALOG UPDATED</span>
                  <h2 id="product-added-title">Product added successfully</h2>
                  <p><strong>{addedProduct.product_name}</strong> is now on the Alnoor shelves.</p>
                  <button autoFocus className="button button-dark success-dismiss" onClick={() => setAddedProduct(null)} type="button">Done<Icon name="check" size={17} /></button>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
