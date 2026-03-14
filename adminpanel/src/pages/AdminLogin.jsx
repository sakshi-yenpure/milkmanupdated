import { useState } from 'react'
import { Link } from 'react-router-dom'
const API = 'http://127.0.0.1:8000'

export default function AdminLogin() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    const endpoint = isLogin ? '/staff/login/' : '/staff/signup/'
    const body = isLogin 
      ? { email, password } 
      : { email, password, name: employeeName, phone: '0000000000', address: 'Office' }

    try {
      const r = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const text = await r.text()
      let data = {}
      try { data = JSON.parse(text || '{}') } catch {}
      if (!r.ok) throw new Error(data.detail || (isLogin ? 'Login failed' : 'Signup failed'))
      
      localStorage.setItem('staffToken', data.token)
      localStorage.setItem('staffUser', JSON.stringify({
        id: data.staff_id,
        email: data.email,
        name: data.name
      }))
      
      // Track local activity
      const activities = JSON.parse(localStorage.getItem('staffActivities') || '[]')
      activities.unshift({ email: data.email, action: isLogin ? 'Logged in' : 'Signed up', ts: Date.now() })
      localStorage.setItem('staffActivities', JSON.stringify(activities.slice(0, 10)))
      
      window.location.href = '/admin-portal'
    } catch (e) {
      console.error('Login error:', e)
      setError(e.message || 'Connection to server failed. Please ensure the backend is running.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card auth-elevate">
          <div className="auth-header">
            <h2 className="gradient-title">{isLogin ? 'Staff Login' : 'Staff Signup'}</h2>
            <p className="auth-subtitle">{isLogin ? 'Access your dashboard' : 'Join the Milkman Team'}</p>
          </div>
          <form onSubmit={submit}>
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Employee Add (Full Name)" 
                value={employeeName} 
                onChange={e=>setEmployeeName(e.target.value)} 
                required 
              />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary btn-wide" type="submit">
              {isLogin ? 'Login as Staff' : 'Signup as Staff'}
            </button>
          </form>
          <div style={{marginTop:12, textAlign:'center'}}>
            <span className="muted">{isLogin ? 'New staff member? ' : 'Already have an account? '}</span>
            <button 
              className="link" 
              style={{background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: '#2f7d32'}}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Create a staff account' : 'Login here'}
            </button>
          </div>
          <div style={{marginTop:12, textAlign:'center'}}>
            <Link className="link" to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
