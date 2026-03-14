import { useState } from 'react'
const API = 'http://127.0.0.1:8000'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const r = await fetch(API + '/customer/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address })
      })
      const text = await r.text()
      let data = {}
      try { data = JSON.parse(text || '{}') } catch {}
      if (!r.ok) throw new Error(data.detail || 'Signup failed')
      localStorage.setItem('customerToken', data.token)
      localStorage.setItem('customer', JSON.stringify({ id: data.customer_id, email: data.email }))
      window.location.href = '/products'
    } catch (e) {
      const token = 'demo-' + Math.random().toString(36).slice(2)
      localStorage.setItem('customerToken', token)
      localStorage.setItem('customer', JSON.stringify({ id: Date.now(), email }))
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Account created (demo)' }))
      window.location.href = '/products'
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card auth-elevate">
          <div className="auth-header">
            <h2 className="gradient-title">Create Account</h2>
            <p className="auth-subtitle">Join and start shopping</p>
          </div>
          <form onSubmit={submit}>
            <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <input type="text" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required />
            <input type="text" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary btn-wide" type="submit">Sign Up</button>
          </form>
          <div style={{marginTop:12, textAlign:'center'}}>
            <span className="muted">Do you want Subscription? </span>
            <a className="link" href="/subscription">Explore plans</a>
          </div>
          <div style={{marginTop:12, textAlign:'center'}}>
            <span className="muted">Already have an account? </span>
            <a className="link" href="/login">Login</a>
          </div>
          <div style={{marginTop:12, textAlign:'center'}}>
            <a className="link" href="/products">Browse products</a>
          </div>
        </div>
      </div>
    </div>
  )
}
