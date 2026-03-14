import { Link } from 'react-router-dom'
import './SuccessPage.css'

export default function SuccessPage() {
  const customer = JSON.parse(localStorage.getItem('customer') || '{}')
  
  return (
    <div className="success-container">
      <div className="success-card reveal">
        <div className="success-icon">🎉</div>
        <h1>Welcome to Milkman!</h1>
        <p>You've successfully {localStorage.getItem('customerToken') ? 'logged in' : 'signed up'}.</p>
        <div className="user-details">
          <p><strong>Name:</strong> {customer.name || 'Valued Customer'}</p>
          <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
        </div>
        <p>Ready to get some fresh dairy delivered?</p>
        <div className="success-actions">
          <Link to="/products" className="btn primary">Browse Products</Link>
          <Link to="/subscription" className="btn secondary">Set Up Subscription</Link>
        </div>
      </div>
    </div>
  )
}
