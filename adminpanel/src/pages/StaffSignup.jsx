import { useState } from 'react'
import { Link } from 'react-router-dom'
const API = 'http://127.0.0.1:8000'

export default function StaffSignup() {
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
      const r = await fetch(API + '/staff/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address })
      })
      const text = await r.text()
      let data = {}
      try { data = JSON.parse(text || '{}') } catch {}
      if (!r.ok) throw new Error(data.detail || 'Signup failed')
      
      localStorage.setItem('staffToken', data.token)
      localStorage.setItem('staffUser', JSON.stringify({ id: data.staff_id, email: data.email, name: data.name }))
      
      // Track local activity
      const activities = JSON.parse(localStorage.getItem('staffActivities') || '[]')
      activities.unshift({ email: data.email, action: 'Signed up', ts: Date.now() })
      localStorage.setItem('staffActivities', JSON.stringify(activities.slice(0, 10)))
      
      window.location.href = '/staff-dashboard'
    } catch (e) {
      setError(e.message || 'Network error')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card auth-elevate">
          <div className="auth-header">
            <h2 className="gradient-title">Staff Signup</h2>
            <p className="auth-subtitle">Join the Milkman Team</p>
          </div>
          <form onSubmit={submit}>
            <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <input type="text" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required />
            <input type="text" placeholder="Work Address" value={address} onChange={e=>setAddress(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary btn-wide" type="submit">Sign Up as Staff</button>
          </form>
          <div style={{marginTop:12, textAlign:'center'}}>
            <span className="muted">Already have a staff account? </span>
            <Link className="link" to="/admin">Staff Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
