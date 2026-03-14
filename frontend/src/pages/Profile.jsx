import { Link } from 'react-router-dom'

export default function Profile() {
  const customer = JSON.parse(localStorage.getItem('customer') || '{}')
  
  // Filter orders to show only for the current user
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
  const orders = allOrders
    .filter(o => o.billing?.customer_id == customer.id)
    .slice()
    .reverse()

  // Fetch user-specific active subscription
  const activeSub = JSON.parse(localStorage.getItem(`activeSubscription_${customer.id}`) || 'null')
  
  if (!customer.id) {
    return <div className="auth-card reveal"><h2>My Profile</h2><div className="muted">Please login to view your profile.</div></div>
  }
  return (
    <div className="reveal profile-page">
      <div className="sub-hero glow-card">
        <div>
          <h2 className="gradient-title">My Profile</h2>
          <p className="muted">Account details, subscriptions and past orders.</p>
        </div>
      </div>
      <div className="grid">
        <div className="card glow-card reveal">
          <div className="card-body" style={{borderTop:'4px solid #0d6efd'}}>
            <h3>Account</h3>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Name:</strong> {customer.name || 'N/A'}</p>
          </div>
        </div>
        <div className="card glow-card reveal">
          <div className="card-body" style={{borderTop:'4px solid #5aa95d'}}>
            <h3>Active Subscription</h3>
            {activeSub ? (
              <div className="sub-info">
                <p><strong>Plan:</strong> {activeSub.plan}</p>
                <p><strong>Price:</strong> ${activeSub.price}</p>
                <p><strong>Slot:</strong> {activeSub.slot}</p>
                <p><strong>Status:</strong> <span style={{color: '#2f7d32', fontWeight: 'bold'}}>{activeSub.status}</span></p>
                <p><strong>Since:</strong> {activeSub.date}</p>
              </div>
            ) : (
              <div className="muted">No active subscription. <Link to="/subscription" style={{color: '#2f7d32', fontWeight: 'bold'}}>Explore plans</Link></div>
            )}
          </div>
        </div>
      </div>
      <div style={{marginTop:16}} className="card glow-card reveal">
        <div className="card-body" style={{borderTop:'4px solid #fb8500'}}>
          <h3>Past Orders</h3>
          {orders.length === 0 && <div className="muted">No orders yet.</div>}
          {orders.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Items</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={idx}>
                    <td>{new Date(o.ts).toLocaleString()}</td>
                    <td>{o.items.map(i => `${i.name || i.product_id} x ${i.quantity}`).join(', ')}</td>
                    <td>${Number(o.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
