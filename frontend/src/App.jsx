import { BrowserRouter, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Subscription from './pages/Subscription'
import Profile from './pages/Profile'
import SubscriptionBilling from './pages/SubscriptionBilling'
import Chatbot from './components/Chatbot'
import SuccessPage from './pages/SuccessPage'

function Layout({ children }) {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(() => !!(localStorage.getItem('customerToken') || localStorage.getItem('staffToken')))
  const [toast, setToast] = useState(null)
  const logout = async () => {
    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}')
    if (staffUser.email) {
      try {
        await fetch(API + '/staff/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: staffUser.email })
        })
      } catch (e) {
        console.error('Logout logging failed:', e)
      }
    }
    localStorage.removeItem('cart')
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customer')
    localStorage.removeItem('staffToken')
    localStorage.removeItem('staffUser')
    setAuthed(false)
    window.location.href = '/'
  }
  useEffect(() => {
    // Re-observe reveals on route change
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })

  useEffect(() => {
    // Fix: Clear cart if it's the first time for a user
    if (!localStorage.getItem('hasVisited')) {
      localStorage.removeItem('cart')
      localStorage.setItem('hasVisited', 'true')
    }
    const handler = (e) => {
      setToast(e.detail || 'Done')
      setTimeout(() => setToast(null), 2000)
    }
    window.addEventListener('toast', handler)
    const storageHandler = () => {
      const hasAuth = !!(localStorage.getItem('customerToken') || localStorage.getItem('staffToken'))
      setAuthed(hasAuth)
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('toast', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])
  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="brand"><Link to="/">Milkman</Link></div>
          <div className="nav-links">
            <a onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{cursor:'pointer'}}>Home</a>
            <Link to="/products">Products</Link>
            <a onClick={() => { navigate('/subscription'); }} style={{cursor:'pointer'}}>Subscribe</a>
            <Link to="/cart">Cart</Link>
            {authed && <Link to="/profile">My Profile</Link>}
            {!authed && <Link to="/login">Login</Link>}
            {!authed && <Link to="/signup">Sign Up</Link>}
            <a href="http://localhost:5175" className="link-button" target="_blank" rel="noreferrer">Staff Admin</a>
            {authed && <button className="link-button" onClick={logout}>Logout</button>}
          </div>
        </div>
      </nav>
      <main className="container">{children}</main>
      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} Milkman</div>
      </footer>
      {toast && (
        <div className="toast">{toast}</div>
      )}
      <Chatbot />
    </div>
  )
}

const API = 'http://127.0.0.1:8000'

function FeaturedProducts() {
  const [items, setItems] = useState([])
  useEffect(() => {
    fetch(API + '/product/public/')
      .then(r => r.json())
      .then(d => setItems(d.slice(0, 3)))
      .catch(() => setItems([]))
  }, [])
  const add = (p) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.product_id === p.id)
    if (existing) existing.quantity += 1
    else cart.push({ product_id: p.id, name: p.name, price: p.price, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('toast', { detail: 'Your product is added to cart' }))
  }
  return (
    <section className="container" style={{marginTop: 32}}>
      <div className="products-header" style={{marginBottom: 12}}>
        <h2>We Assure</h2>
        <Link className="btn btn-secondary" to="/products">View All</Link>
      </div>
      <div className="grid">
        {items.map(p => (
          <div key={p.id} className="card product-card">
            <div className="card-body">
              <h3>{p.name}</h3>
              <p className="muted">{p.description}</p>
              <div className="product-meta">
                <span className="price">${Number(p.price).toFixed(2)}</span>
                <button className="btn btn-primary" onClick={() => add(p)}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      <section className="hero hero-visual reveal">
        <div className="container hero-inner">
          <h1>Fresh Milk Delivered</h1>
          <p className="hero-tagline">Premium dairy products, flexible plans, and doorstep delivery.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/products">Shop Products</Link>
            <Link className="btn btn-secondary" to="/subscription">Explore Subscriptions</Link>
          </div>
        </div>
      </section>
      <FeaturedProducts />
      <section className="container reveal we-assure" style={{marginTop: 32}}>
        <div className="grid">
          <div className="card reveal">
            <div className="card-body">
              <h3>Quality First</h3>
              <p className="muted">Sourced from trusted farms with rigorous checks.</p>
            </div>
          </div>
          <div className="card reveal">
            <div className="card-body">
              <h3>Flexible Plans</h3>
              <p className="muted">Subscribe to daily or weekly deliveries.</p>
            </div>
          </div>
          <div className="card reveal">
            <div className="card-body">
              <h3>Easy Billing</h3>
              <p className="muted">Transparent pricing and secure payments.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="container reveal" style={{marginTop: 32}}>
        <div className="products-header" style={{marginBottom: 12}}>
          <h2>Our Products</h2>
          <Link className="btn btn-secondary" to="/products">Browse All</Link>
        </div>
        <div className="grid">
          <div className="card product-card reveal">
            <div className="product-image">
              <img src="https://images.pexels.com/photos/5946623/pexels-photo-5946623.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Milk" />
            </div>
            <div className="card-body">
              <h3>Milk</h3>
              <p className="muted">Whole, toned, and skim options.</p>
            </div>
          </div>
          <div className="card product-card reveal">
            <div className="product-image">
              <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop" alt="Cheese" />
            </div>
            <div className="card-body">
              <h3>Cheese</h3>
              <p className="muted">Cheddar, Mozzarella and more.</p>
            </div>
          </div>
          <div className="card product-card reveal">
            <div className="product-image">
              <img src="https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Curd" />
            </div>
            <div className="card-body">
              <h3>Curd & Yogurt</h3>
              <p className="muted">Fresh curd and Greek yogurt.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="container reveal" style={{marginTop: 64}}>
        <div className="products-header" style={{marginBottom: 32, textAlign: 'center', display: 'block'}}>
          <h2 style={{fontSize: '2.5rem', color: '#2f7d32'}}>Our Stores</h2>
          <p className="muted">Find us in your city for the freshest experience</p>
        </div>
        <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
          <div className="card reveal store-card">
            <div className="card-body" style={{padding: '30px', borderTop: '5px solid #2f7d32'}}>
              <div style={{fontSize: '2rem', marginBottom: '15px'}}>📍</div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>Mumbai Central</h3>
              <p className="muted" style={{fontSize: '1.1rem'}}>Flagship Store & Experience Center</p>
              <p style={{marginTop: '15px', color: '#666'}}>123, Dairy Lane, Mumbai - 400001</p>
            </div>
          </div>
          <div className="card reveal store-card">
            <div className="card-body" style={{padding: '30px', borderTop: '5px solid #2f7d32'}}>
              <div style={{fontSize: '2rem', marginBottom: '15px'}}>📍</div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>Bengaluru Indiranagar</h3>
              <p className="muted" style={{fontSize: '1.1rem'}}>Fresh Dairy Hub & Distribution</p>
              <p style={{marginTop: '15px', color: '#666'}}>45, 100ft Road, Bengaluru - 560038</p>
            </div>
          </div>
          <div className="card reveal store-card">
            <div className="card-body" style={{padding: '30px', borderTop: '5px solid #2f7d32'}}>
              <div style={{fontSize: '2rem', marginBottom: '15px'}}>📍</div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>Hyderabad Banjara Hills</h3>
              <p className="muted" style={{fontSize: '1.1rem'}}>Premium Selection & Gourmet Dairy</p>
              <p style={{marginTop: '15px', color: '#666'}}>89, Road No. 12, Hyderabad - 500034</p>
            </div>
          </div>
        </div>
      </section>
      <section className="container reveal" style={{marginTop: 80, padding: '60px 0', background: '#f8fbf9', borderRadius: '30px'}}>
        <div className="products-header" style={{marginBottom: 40, textAlign: 'center', display: 'block'}}>
          <h2 style={{fontSize: '2.5rem', color: '#2f7d32'}}>Our Stats</h2>
          <p className="muted">The impact we make every single day</p>
        </div>
        <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', padding: '0 40px'}}>
          <div className="reveal stat-item" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: '3.5rem', color: '#2f7d32', marginBottom: '10px', fontWeight: '800'}}>1,200+</h3>
            <p className="muted" style={{fontSize: '1.2rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px'}}>Daily Orders</p>
          </div>
          <div className="reveal stat-item" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: '3.5rem', color: '#2f7d32', marginBottom: '10px', fontWeight: '800'}}>98%</h3>
            <p className="muted" style={{fontSize: '1.2rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px'}}>On-time Delivery</p>
          </div>
          <div className="reveal stat-item" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: '3.5rem', color: '#2f7d32', marginBottom: '10px', fontWeight: '800'}}>10+</h3>
            <p className="muted" style={{fontSize: '1.2rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px'}}>Cities Served</p>
          </div>
        </div>
      </section>
      <section className="container reveal" style={{marginTop: 80, marginBottom: 80}}>
        <div className="card reveal" style={{overflow: 'hidden', borderRadius: '40px', boxShadow: '0 30px 60px rgba(47, 125, 50, 0.2)'}}>
          <div className="card-body" style={{
            background: 'linear-gradient(135deg, #1b5e20 0%, #2f7d32 50%, #43a047 100%)', 
            padding: '100px 80px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '60px',
            position: 'relative'
          }}>
            <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%'}}></div>
            <div style={{position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%'}}></div>
            
            <div style={{flex: '1', minWidth: '350px', position: 'relative', zIndex: 1}}>
              <div style={{display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '30px', marginBottom: '25px', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase'}}>Special Offer</div>
              <h2 style={{fontSize: '4.5rem', color: '#fff', marginBottom: '25px', lineHeight: '1.1', fontWeight: '900'}}>Subscribe & <br/><span style={{color: '#a8e6cf'}}>Save Every Day</span></h2>
              <p style={{fontSize: '1.4rem', opacity: .9, marginBottom: '50px', maxWidth: '650px', lineHeight: '1.6'}}>Freshness guaranteed. Get your daily essentials delivered before 7 AM. Join 50,000+ happy families today.</p>
              
              <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <div style={{width: '50px', height: '50px', background: 'rgba(255,255,255,0.15)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>🚚</div>
                  <div>
                    <strong style={{display: 'block', fontSize: '1.1rem'}}>Free Delivery</strong>
                    <span style={{fontSize: '0.9rem', opacity: 0.8}}>On all orders</span>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <div style={{width: '50px', height: '50px', background: 'rgba(255,255,255,0.15)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>💰</div>
                  <div>
                    <strong style={{display: 'block', fontSize: '1.1rem'}}>Flat 20% Off</strong>
                    <span style={{fontSize: '0.9rem', opacity: 0.8}}>Subscription plans</span>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <div style={{width: '50px', height: '50px', background: 'rgba(255,255,255,0.15)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>🔄</div>
                  <div>
                    <strong style={{display: 'block', fontSize: '1.1rem'}}>Easy Pause</strong>
                    <span style={{fontSize: '0.9rem', opacity: 0.8}}>Anytime, anywhere</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{textAlign: 'center', position: 'relative', zIndex: 1}}>
              <div style={{background: 'rgba(255,255,255,0.1)', padding: '40px', borderRadius: '30px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)'}}>
                <div style={{fontSize: '1rem', marginBottom: '10px', opacity: 0.9}}>Plans starting from</div>
                <div style={{fontSize: '3.5rem', fontWeight: '900', marginBottom: '30px'}}>$9.99<span style={{fontSize: '1rem', fontWeight: 'normal', opacity: 0.7}}>/week</span></div>
                <Link className="btn" to="/subscription" style={{
                  background: '#fff', 
                  color: '#2f7d32', 
                  padding: '22px 60px', 
                  fontSize: '1.4rem', 
                  borderRadius: '50px',
                  fontWeight: '900',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s',
                  display: 'block'
                }}>Get Started</Link>
                <p style={{marginTop: '25px', fontSize: '0.9rem', opacity: 0.7}}>Risk-free. Cancel with one click.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/subscription-billing" element={<SubscriptionBilling />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
