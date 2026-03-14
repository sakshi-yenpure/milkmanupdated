import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000'

export default function Checkout() {
  const [customer, setCustomer] = useState(() => JSON.parse(localStorage.getItem('customer') || '{}'))
  const [items, setItems] = useState([])
  const [status, setStatus] = useState(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('morning')
  const [payment, setPayment] = useState('cod')
  const [showCard, setShowCard] = useState(false)
  const [showUpi, setShowUpi] = useState(false)
  const [card, setCard] = useState({ name:'', number:'', expiry:'', cvv:'' })
  const [upi, setUpi] = useState({ id:'' })
  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  const doSubmit = async () => {
    setStatus('processing')
    const payload = {
      customer_id: customer.id,
      items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      delivery_address: address,
      delivery_phone: phone,
      delivery_date: date,
      delivery_slot: slot,
      payment_method: payment,
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
      setStatus('success')
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        orders.push({
          ts: Date.now(),
          items,
          total,
          billing: payload
        })
        localStorage.setItem('orders', JSON.stringify(orders))
      } catch {}
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Order placed successfully' }))
    } catch (e) {
      localStorage.removeItem('cart')
      setStatus('success')
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        orders.push({
          ts: Date.now(),
          items,
          total,
          billing: payload,
          simulated: true
        })
        localStorage.setItem('orders', JSON.stringify(orders))
      } catch {}
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Order placed (demo)' }))
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
    <div>
      <h2>Billing</h2>
      {!customer.id && <div className="error">Login required to complete checkout</div>}
      {customer.id && (
        <div className="checkout-grid">
          <div className="card">
            <div className="card-body">
              <h3>Delivery Details</h3>
              <div className="form-grid">
                <input type="text" placeholder="Delivery Address" value={address} onChange={e=>setAddress(e.target.value)} required />
                <input type="text" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required />
                <input type="date" placeholder="Delivery Date" value={date} onChange={e=>setDate(e.target.value)} required />
                <select value={slot} onChange={e=>setSlot(e.target.value)}>
                  <option value="morning">Morning (7–10 AM)</option>
                  <option value="afternoon">Afternoon (1–4 PM)</option>
                  <option value="evening">Evening (6–9 PM)</option>
                </select>
              </div>
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
          <div className="card order-card">
            <div className="card-body">
              <h3>Order Summary</h3>
              <ul className="order-list">
                {items.map((i, idx) => (
                  <li key={idx}>
                    <span>{i.name} × {i.quantity}</span>
                    <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <button className="btn btn-primary" onClick={submit} disabled={status==='processing'}>Place Order</button>
              {status === 'success' && <div className="success mt-2">Order placed</div>}
              {status === 'error' && <div className="error mt-2">Failed to place order</div>}
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
                    <button className="btn btn-primary" type="submit">Pay & Place Order</button>
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
                    <button className="btn btn-primary" type="submit">Pay & Place Order</button>
                    <button className="btn btn-secondary" type="button" onClick={()=>setShowUpi(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
