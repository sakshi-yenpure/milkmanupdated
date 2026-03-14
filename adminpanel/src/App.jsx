import { BrowserRouter, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import AdminLogin from './pages/AdminLogin'
import AdminPortal from './pages/AdminPortal'
import AdminDashboard from './pages/AdminDashboard'
import StaffSignup from './pages/StaffSignup'

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
    return () => {
      window.removeEventListener('toast', handler)
      window.removeEventListener('storage', storageHandler)
      observer.disconnect()
    }
  }, [])
  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="brand"><Link to="/">Milkman</Link></div>
          <div className="nav-links">
            <a href="http://localhost:5173" className="link-button" target="_blank" rel="noreferrer">Main Site</a>
            {authed && <Link to="/admin-portal">Admin Portal</Link>}
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
    </div>
  )
}

const API = 'http://127.0.0.1:8000'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/staff-signup" element={<StaffSignup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
