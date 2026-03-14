import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Cart() {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  const updateQty = (idx, q) => {
    const next = items.slice()
    next[idx].quantity = q
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }

  const removeItem = (idx) => {
    const next = items.slice()
    next.splice(idx, 1)
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)

  return (
    <div>
      <h2>Cart</h2>
      <div style={{marginBottom:12}}>
        <button className="btn btn-secondary" onClick={() => { setItems([]); localStorage.removeItem('cart') }}>Clear Cart</button>
      </div>
      {items.length === 0 && <div>Your cart is empty</div>}
      {items.length > 0 && (
        <>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.name}</td>
                  <td>${i.price}</td>
                  <td>
                    <input type="number" min="1" value={i.quantity} onChange={e => updateQty(idx, Number(e.target.value))} />
                  </td>
                  <td>${(Number(i.price) * i.quantity).toFixed(2)}</td>
                  <td><button className="btn btn-secondary" onClick={() => removeItem(idx)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
          <Link className="btn btn-primary" to="/checkout">Proceed to Billing</Link>
        </>
      )}
    </div>
  )
}
