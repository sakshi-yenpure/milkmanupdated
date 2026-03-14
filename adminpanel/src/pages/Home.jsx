import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './AdminDashboard.css' // Reusing some dashboard styles

const API = 'http://127.0.0.1:8000'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API + '/product/public/')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch products:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="home-page">
      <header className="hero" style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)' }}>
        <h1 className="gradient-title" style={{ fontSize: '3rem', marginBottom: '20px' }}>Fresh Milk Delivered to Your Door</h1>
        <p className="muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px' }}>
          Quality dairy products from our local farms, delivered fresh every single day.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
            Shop Now
          </button>
        </div>
      </header>

      <section id="products-section" className="container" style={{ marginTop: '60px', paddingBottom: '60px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Our Fresh Products</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading fresh products...</div>
        ) : (
          <div className="grid">
            {products.map(product => (
              <div key={product.id} className="card product-card glow-card">
                <div className="product-image">
                  <img src={product.image || '/vite.svg'} alt={product.name} />
                </div>
                <div className="card-body">
                  <div className="product-meta">
                    <span className={`badge badge-milk`}>{product.category_name || 'Dairy'}</span>
                    <span className="price">${product.price}</span>
                  </div>
                  <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
                  <p className="muted" style={{ fontSize: '0.9rem', minHeight: '40px' }}>{product.description}</p>
                  <button className="btn btn-secondary btn-wide" style={{ marginTop: '15px' }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container" style={{ margin: '40px auto', padding: '60px 20px', background: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🚜</div>
            <h3>Farm Fresh</h3>
            <p className="muted">Sourced directly from our local high-quality farms.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🚚</div>
            <h3>Fast Delivery</h3>
            <p className="muted">Delivered to your doorstep within hours of production.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🥛</div>
            <h3>Pure Quality</h3>
            <p className="muted">No preservatives, just pure natural dairy goodness.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
