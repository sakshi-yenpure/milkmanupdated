import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000'

export default function SubscriptionBilling() {
  const [customer] = useState(() => JSON.parse(localStorage.getItem('customer') || '{}'))
  const [items, setItems] = useState([])
  const [plan, setPlan] = useState(() => JSON.parse(localStorage.getItem('subscriptionPlan') || 'null'))
  const [status, setStatus] = useState(null)
  const [payment, setPayment] = useState('cod')
  const [showCard, setShowCard] = useState(false)
  const [showUpi, setShowUpi] = useState(false)
  const [card, setCard] = useState({ name:'', number:'', expiry:'', cvv:'' })
  const [upi, setUpi] = useState({ id:'' })
  
  const itemsTotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  const planPrice = plan?.price || 0
  const total = itemsTotal + planPrice

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  const doSubmit = async () => {
    if (!customer.id) { setStatus('login_required'); return }
    setStatus('processing')
    const payload = {
      customer_id: customer.id,
      items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      delivery_slot: plan?.slot || 'morning',
      payment_method: payment,
      subscription_plan: plan?.plan,
      subscription_price: plan?.price
    }
    try {
      const r = await fetch(API + '/subscription/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!r.ok) throw new Error('failed')
      const data = await r.json()
      localStorage.removeItem('cart')
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push({ ts: Date.now(), items, plan, total, billing: payload, type: 'subscription' })
      localStorage.setItem('orders', JSON.stringify(orders))
      
      // Save active subscription for profile display (user-specific)
      localStorage.setItem(`activeSubscription_${customer.id}`, JSON.stringify({
        ...plan,
        date: new Date().toLocaleDateString(),
        status: 'Active'
      }))

      setStatus('success')
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Subscription purchased successfully' }))
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1500)
    } catch (e) {
      localStorage.removeItem('cart')
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push({ ts: Date.now(), items, plan, total, billing: payload, type: 'subscription', simulated: true })
      localStorage.setItem('orders', JSON.stringify(orders))
      
      localStorage.setItem(`activeSubscription_${customer.id}`, JSON.stringify({
        ...plan,
        date: new Date().toLocaleDateString(),
        status: 'Active (Simulated)'
      }))

      setStatus('success')
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Subscription purchased (demo)' }))
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1500)
    }
  }
  const submit = async () => {
    if (payment === 'card') { setShowCard(true); return }
    if (payment === 'upi') { setShowUpi(true); return }
    await doSubmit()
  }
  const confirmCard = async (e) => {
    e.preventDefault()
    if (!card.name || !card.number || !card.expiry || !card.cvv) return
    setShowCard(false)
    await doSubmit()
  }
  const confirmUpi = async (e) => {
    e.preventDefault()
    if (!upi.id) return
    setShowUpi(false)
    await doSubmit()
  }

  return (
    <div className="reveal">
      <h2>Subscription Billing</h2>
      {!plan && <div className="muted">No plan selected. Please choose a plan on the Subscription page.</div>}
      <div className="checkout-grid" style={{marginTop: 16}}>
        <div className="card reveal">
          <div className="card-body" style={{borderTop:'4px solid #0d6efd'}}>
            <h3>Plan Summary</h3>
            {plan ? (
              <div className="form-grid">
                <div><strong>Plan:</strong> {plan.plan}</div>
                <div><strong>Preferred Slot:</strong> {plan.slot}</div>
              </div>
            ) : <div className="muted">No plan selected</div>}
            <h3 style={{marginTop:16}}>Payment</h3>
            <div className="payment-options">
              <div className={`payment-tile ${payment==='cod' ? 'selected' : ''}`} onClick={()=>setPayment('cod')}>
                <input type="radio" name="payment" value="cod" checked={payment==='cod'} readOnly />
                <span>Cash on Delivery</span>
              </div>
              <div className={`payment-tile ${payment==='card' ? 'selected' : ''}`} onClick={()=>setPayment('card')}>
                <input type="radio" name="payment" value="card" checked={payment==='card'} readOnly />
                <span>Credit / Debit Card</span>
              </div>
              <div className={`payment-tile ${payment==='upi' ? 'selected' : ''}`} onClick={()=>setPayment('upi')}>
                <input type="radio" name="payment" value="upi" checked={payment==='upi'} readOnly />
                <span>UPI</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card order-card reveal">
          <div className="card-body" style={{borderTop:'4px solid #5aa95d'}}>
            <h3>Order Summary</h3>
            <ul className="order-list">
              {plan && (
                <li style={{borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px'}}>
                  <span><strong>{plan.plan} Plan</strong></span>
                  <span><strong>${Number(plan.price).toFixed(2)}</strong></span>
                </li>
              )}
              {items.map((i, idx) => (
                <li key={idx}>
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="order-total" style={{marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #333'}}>
              <strong>Total Payable</strong>
              <strong style={{fontSize: '1.4rem', color: '#2f7d32'}}>${total.toFixed(2)}</strong>
            </div>
            <button className="btn btn-primary" onClick={submit} disabled={status==='processing' || !plan} style={{width: '100%', marginTop: '20px', padding: '15px'}}>Confirm & Pay</button>
            {status === 'login_required' && <div className="error mt-2">Login required to subscribe</div>}
            {status === 'success' && <div className="success mt-2">Subscription Active! Redirecting...</div>}
            {status === 'error' && <div className="error mt-2">Payment failed. Please try again.</div>}
          </div>
        </div>
        {showCard && (
          <div className="modal">
            <div className="modal-card">
              <h3>Pay by Card</h3>
              <form onSubmit={confirmCard} className="form-grid">
                <input type="text" placeholder="Name on Card" value={card.name} onChange={e=>setCard({...card, name:e.target.value})} required />
                <input type="text" placeholder="Card Number" value={card.number} onChange={e=>setCard({...card, number:e.target.value})} required />
                <input type="text" placeholder="MM/YY" value={card.expiry} onChange={e=>setCard({...card, expiry:e.target.value})} required />
                <input type="password" placeholder="CVV" value={card.cvv} onChange={e=>setCard({...card, cvv:e.target.value})} required />
                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn-primary" type="submit">Pay & Confirm</button>
                  <button className="btn btn-secondary" type="button" onClick={()=>setShowCard(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showUpi && (
          <div className="modal">
            <div className="modal-card">
              <h3>Pay by UPI</h3>
              <form onSubmit={confirmUpi} className="form-grid">
                <input type="text" placeholder="UPI ID (e.g., name@bank)" value={upi.id} onChange={e=>setUpi({ id:e.target.value })} required />
                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn-primary" type="submit">Pay & Confirm</button>
                  <button className="btn btn-secondary" type="button" onClick={()=>setShowUpi(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
