import { Link } from 'react-router-dom'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const customer = JSON.parse(localStorage.getItem('customer') || '{}')
  
  // Fetch user-specific data
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
  const userOrders = allOrders.filter(o => o.billing?.customer_id == customer.id)
  const lastOrder = userOrders.length > 0 ? userOrders[userOrders.length - 1] : null
  const activeSub = JSON.parse(localStorage.getItem(`activeSubscription_${customer.id}`) || 'null')

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Milkman</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="active">Dashboard</Link>
          <Link to="/products">Browse Products</Link>
          <Link to="/subscription">My Subscriptions</Link>
          <Link to="/profile">Profile Settings</Link>
          <Link to="/cart">View Cart</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>Welcome, {customer.name || 'Valued Customer'}</h1>
          <div className="user-badge">Customer Panel</div>
        </header>
        <section className="admin-content">
          <div className="stat-cards">
            <div className="stat-card">
              <h3>Recent Orders</h3>
              {lastOrder ? (
                <p>Last order on {new Date(lastOrder.ts).toLocaleDateString()}</p>
              ) : (
                <p>No recent orders found</p>
              )}
            </div>
            <div className="stat-card">
              <h3>Active Subscription</h3>
              {activeSub ? (
                <p>{activeSub.plan} - <span style={{color: '#2f7d32'}}>{activeSub.status}</span></p>
              ) : (
                <p>You don't have an active subscription yet</p>
              )}
            </div>
            <div className="stat-card">
              <h3>Profile Completion</h3>
              <div className="progress-bar"><div className="progress" style={{width: '60%'}}></div></div>
              <p>60% Complete</p>
            </div>
          </div>
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/products" className="action-btn">Order Now</Link>
              <Link to="/subscription" className="action-btn secondary">Subscribe</Link>
              <Link to="/profile" className="action-btn tertiary">Edit Profile</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
