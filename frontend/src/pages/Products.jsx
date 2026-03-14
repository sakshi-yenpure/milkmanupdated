import { useEffect, useMemo, useState } from 'react'

const API = 'http://127.0.0.1:8000'
const IMG_BY_CATEGORY = {
  milk: 'https://images.pexels.com/photos/5946623/pexels-photo-5946623.jpeg?auto=compress&cs=tinysrgb&w=800',
  curd: '/curd.jpg',
  yogurt: '/yogurt.jpg',
  cheese: '/cheese.jpg',
  butter: '/butter.jpg',
  ghee: '/ghee.jpg',
  paneer: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
}
const FALLBACK_IMG = '/butter.jpg'
const IMG_BY_KEYWORD = [
  { k: 'cheddar', url: '/cheese.jpg' },
  { k: 'chedder', url: '/cheese.jpg' },
  { k: 'fresh curd', url: '/curd.jpg' },
  { k: 'salted butter', url: '/butter.jpg' },
  { k: 'unsalted butter', url: '/butter.jpg' },
  { k: 'unsaled butter', url: '/butter.jpg' },
  { k: 'greek yogurt', url: '/yogurt.jpg' },
  { k: 'cow ghee', url: '/ghee.jpg' },
  { k: 'milk', url: IMG_BY_CATEGORY.milk },
  { k: 'curd', url: IMG_BY_CATEGORY.curd },
  { k: 'yogurt', url: IMG_BY_CATEGORY.yogurt },
  { k: 'yoghurt', url: IMG_BY_CATEGORY.yogurt },
  { k: 'cheese', url: IMG_BY_CATEGORY.cheese },
  { k: 'butter', url: IMG_BY_CATEGORY.butter },
  { k: 'ghee', url: IMG_BY_CATEGORY.ghee },
  { k: 'paneer', url: IMG_BY_CATEGORY.paneer },
]
const getImageFor = (p) => {
  const name = (p.name || '').toLowerCase()
  for (const { k, url } of IMG_BY_KEYWORD) {
    if (name.includes(k)) return url
  }
  const cat = (p.category_name || '').toLowerCase().split(' ')[0]
  return IMG_BY_CATEGORY[cat] || FALLBACK_IMG
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const FALLBACK_PRODUCTS = [
    { id: 1, name: 'Fresh Milk 1L', description: 'Farm fresh cow milk', price: 2.5, category_name: 'Milk' },
    { id: 2, name: 'Fresh Milk 500ml', description: 'Daily toned milk', price: 1.5, category_name: 'Milk' },
    { id: 3, name: 'A2 Milk 1L', description: 'Single-origin A2 cow milk', price: 3.9, category_name: 'Milk' },
    { id: 4, name: 'Greek Yogurt 500g', description: 'Thick and creamy', price: 3.2, category_name: 'Yogurt' },
    { id: 5, name: 'Plain Yogurt 400g', description: 'Probiotic rich yogurt', price: 2.2, category_name: 'Yogurt' },
    { id: 6, name: 'Cheddar Cheese 200g', description: 'Aged and sharp', price: 4.0, category_name: 'Cheese' },
    { id: 7, name: 'Mozzarella Cheese 200g', description: 'Perfect for pizza', price: 3.6, category_name: 'Cheese' },
    { id: 8, name: 'Paneer 200g', description: 'Fresh cottage cheese', price: 2.9, category_name: 'Paneer' },
    { id: 9, name: 'Butter 200g', description: 'Creamy unsalted butter', price: 2.8, category_name: 'Butter' },
    { id: 10, name: 'Butter 100g', description: 'Table butter', price: 1.6, category_name: 'Butter' },
    { id: 11, name: 'Ghee 500ml', description: 'Traditional cow ghee', price: 8.5, category_name: 'Ghee' },
    { id: 12, name: 'Ghee 250ml', description: 'Rich aroma and taste', price: 4.6, category_name: 'Ghee' },
    { id: 13, name: 'Strawberry Yogurt 180g', description: 'Fruit yogurt cup', price: 1.2, category_name: 'Yogurt' },
    { id: 14, name: 'Mango Yogurt 180g', description: 'Seasonal delight', price: 1.2, category_name: 'Yogurt' },
    { id: 15, name: 'Lassi Sweet 200ml', description: 'Refreshing sweet lassi', price: 0.9, category_name: 'Milk' },
    { id: 16, name: 'Lassi Salted 200ml', description: 'Traditional salted lassi', price: 0.9, category_name: 'Milk' },
    { id: 17, name: 'Curd 400g', description: 'Homestyle curd', price: 1.6, category_name: 'Curd' },
    { id: 18, name: 'Curd 1kg', description: 'Family pack', price: 3.2, category_name: 'Curd' },
    { id: 19, name: 'Whipping Cream 200ml', description: 'Perfect for desserts', price: 2.4, category_name: 'Milk' },
    { id: 20, name: 'Fresh Cream 250ml', description: 'Rich and smooth', price: 2.1, category_name: 'Milk' },
    { id: 21, name: 'Probiotic Drink 100ml', description: 'Live cultures', price: 0.7, category_name: 'Milk' },
    { id: 22, name: 'Salted Butter Sticks', description: 'Baking essential', price: 2.3, category_name: 'Butter' },
    { id: 23, name: 'Herb Butter 100g', description: 'Infused with herbs', price: 1.9, category_name: 'Butter' },
    { id: 24, name: 'Smoked Cheese 150g', description: 'Delicate smoky flavor', price: 4.2, category_name: 'Cheese' },
  ]
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category_name))
    return ['All', ...Array.from(set).filter(Boolean)]
  }, [products])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')

  useEffect(() => {
    fetch(API + '/product/public/')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) && data.length ? data : FALLBACK_PRODUCTS))
      .catch(() => {
        setError(null)
        setProducts(FALLBACK_PRODUCTS)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const addToCart = (p) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.product_id === p.id)
    if (existing) existing.quantity += 1
    else cart.push({ product_id: p.id, name: p.name, price: p.price, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('toast', { detail: 'Your product is added to cart' }))
  }
  const buyNow = (p, qty = 1) => {
    const cart = [{ product_id: p.id, name: p.name, price: p.price, quantity: qty }]
    localStorage.setItem('cart', JSON.stringify(cart))
    window.location.href = '/checkout'
  }
  const selectProduct = (p) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.product_id === p.id)
    if (existing) existing.quantity += 1
    else cart.push({ product_id: p.id, name: p.name, price: p.price, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('toast', { detail: 'Your product is added to cart' }))
    window.location.href = '/cart'
  }

  const visible = products
    .filter(p => filter === 'All' || p.category_name === filter)
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice()
    .sort((a, b) => {
      if (sort === 'price-asc') return Number(a.price) - Number(b.price)
      if (sort === 'price-desc') return Number(b.price) - Number(a.price)
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="container no-effects">
      <div className="products-hero">
        <h2>Our Products</h2>
        <p className="subtitle">Fresh, local, and delivered. Explore and add your favorites.</p>
      </div>
      {error && <div className="error">Showing sample products</div>}
      <div className="products-controls">
        <div className="filters">
          {categories.map(c => (
            <button
              key={c}
              className={`btn ${filter === c ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="tools">
          <input
            className="search"
            type="text"
            placeholder="Search products"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
          </select>
        </div>
      </div>
      {loading && (
        <div className="grid grid-products">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card product-card skeleton">
              <div className="product-image skeleton-img" />
              <div className="card-body">
                <div className="skeleton-line" style={{width:'60%', height:16, marginBottom:8}} />
                <div className="skeleton-line" style={{width:'90%', height:12}} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-products">
        {visible.map(p => (
          <div key={p.id} className="card product-card">
            <div className="product-image" style={{cursor:'pointer'}} onClick={() => selectProduct(p)}>
              <img src={getImageFor(p)} alt={p.name} />
            </div>
            <div className="card-body">
              <h3 style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <span>{p.name}</span>
                <span className={`badge badge-${(p.category_name || '').toLowerCase().split(' ')[0] || 'default'}`}>{p.category_name || 'General'}</span>
              </h3>
              <p className="muted">{p.description}</p>
              <div className="product-meta">
                <span className="price">${Number(p.price).toFixed(2)}</span>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <button className="btn btn-primary" onClick={() => addToCart(p)}>Add</button>
                  <button className="btn btn-secondary" onClick={() => buyNow(p)}>Buy Now</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
