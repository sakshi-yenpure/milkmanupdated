import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './StaffDashboard.css'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [staff, setStaff] = useState(() => JSON.parse(localStorage.getItem('staffUser') || '{}'))
  const [activities, setActivities] = useState(() => JSON.parse(localStorage.getItem('staffActivities') || '[]'))

  useEffect(() => {
    if (!localStorage.getItem('staffToken')) {
      navigate('/admin')
    }
    
    // Refresh activities from local storage every few seconds to catch logout/login from other tabs
    const interval = setInterval(() => {
      setActivities(JSON.parse(localStorage.getItem('staffActivities') || '[]'))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="staff-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="gradient-title">Staff Dashboard</h1>
            <p className="muted">Welcome back, {staff.name || 'Team Member'}</p>
          </div>
          <div className="header-right">
            <span className="staff-badge">Staff Mode</span>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="card reveal activity-card">
            <div className="card-body">
              <div className="card-header">
                <h3>Staff Activity Feed</h3>
                <span className="live-dot">Live</span>
              </div>
              <div className="activity-list">
                {activities.length === 0 ? (
                  <p className="muted">No recent activities recorded.</p>
                ) : (
                  activities.map((act, i) => (
                    <div key={i} className={`activity-item ${act.action.toLowerCase().replace(' ', '-')}`}>
                      <div className="activity-icon">
                        {act.action.includes('Logged in') && '🔑'}
                        {act.action.includes('Signed up') && '✨'}
                        {act.action.includes('Logged out') && '🚪'}
                      </div>
                      <div className="activity-content">
                        <p><strong>{act.email}</strong> {act.action}</p>
                        <span className="activity-time">{new Date(act.ts).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card reveal stats-card">
            <div className="card-body">
              <h3>Team Overview</h3>
              <div className="quick-stats">
                <div className="stat-box">
                  <span className="stat-value">Active</span>
                  <span className="stat-label">System Status</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{activities.filter(a => a.action === 'Logged in').length}</span>
                  <span className="stat-label">Recent Logins</span>
                </div>
              </div>
              <div className="staff-actions" style={{marginTop: '30px'}}>
                <Link to="/products" className="btn btn-secondary btn-wide">Manage Products</Link>
                <Link to="/profile" className="btn btn-primary btn-wide mt-2">Team Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
