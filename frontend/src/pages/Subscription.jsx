import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Subscription() {
  const [plan, setPlan] = useState('weekly')
  const [slot, setSlot] = useState('morning')
  const plans = {
    daily: { name: 'Daily Delivery', price: 29.99, desc: 'Fresh dairy delivered every day.', color: '#4e9b51' },
    weekly: { name: 'Weekly Delivery', price: 9.99, desc: 'Deliveries once or twice a week.', color: '#0d6efd' },
    monthly: { name: 'Monthly Saver', price: 89.99, desc: 'Full month of premium service.', color: '#fb8500' }
  }

  const proceed = () => {
    localStorage.setItem('subscriptionPlan', JSON.stringify({ 
      plan: plans[plan].name, 
      price: plans[plan].price,
      slot 
    }))
    window.location.href = '/subscription-billing'
  }
  return (
    <div className="reveal subscription-page">
      <div className="sub-hero glow-card">
        <div>
          <h2 className="gradient-title">Subscription Plans</h2>
          <p className="muted">Flexible schedules, prioritized delivery, and great value.</p>
        </div>
        <div className="chips">
          <span className="chip">Daily</span>
          <span className="chip">Weekly</span>
          <span className="chip">Monthly</span>
        </div>
      </div>
      <div className="grid">
        {Object.entries(plans).map(([key, p]) => (
          <div key={key} className={`card glow-card ${plan === key ? 'selected' : ''} reveal`}>
            <div className="card-body" style={{ borderTop: `4px solid ${p.color}` }}>
              <h3>{p.name}</h3>
              <p className="price" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2f7d32' }}>${p.price}</p>
              <p className="muted">{p.desc}</p>
              <ul>
                <li>Priority delivery</li>
                <li>Exclusive discounts</li>
              </ul>
              <button className="btn btn-secondary" onClick={() => setPlan(key)}>Select Plan</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }} className="card glow-card reveal">
        <div className="card-body" style={{ borderTop: '4px solid #5aa95d' }}>
          <h3>Delivery Preferences</h3>
          <div className="form-grid">
            <select value={slot} onChange={e => setSlot(e.target.value)}>
              <option value="morning">Morning (7–10 AM)</option>
              <option value="afternoon">Afternoon (1–4 PM)</option>
              <option value="evening">Evening (6–9 PM)</option>
            </select>
            <div className="sub-actions" style={{ display: 'flex', gap: '10px' }}>
              <Link className="btn btn-primary" to="/products">Add Products</Link>
              <button className="btn btn-secondary" onClick={proceed}>Proceed to Billing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
