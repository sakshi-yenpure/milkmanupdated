import { useEffect, useState } from 'react'
import './StaffDashboard.css'
const API = 'http://127.0.0.1:8000'

export default function AdminPortal() {
  const [activities, setActivities] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const token = localStorage.getItem('staffToken') || ''

  const [tempData, setTempData] = useState({})

  const handleInlineChange = (id, field, value) => {
    setTempData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || products.find(p => p.id === id)),
        [field]: value
      }
    }))
  }

  const handleSaveInline = async (id) => {
    const updatedProduct = tempData[id]
    if (!updatedProduct) return

    try {
      // Ensure price is a number and name is trimmed
      const payload = {
        ...updatedProduct,
        price: parseFloat(updatedProduct.price),
        name: updatedProduct.name.trim()
      }

      const r = await fetch(`${API}/product/product/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify(payload)
      })
      
      if (r.ok) {
        // Clear temp data for this product
        const newTemp = { ...tempData }
        delete newTemp[id]
        setTempData(newTemp)
        
        // Refresh local list
        await fetchProducts()
        
        // Show confirmation popup
        alert('Product changes are updated on site!')
        window.dispatchEvent(new CustomEvent('toast', { detail: 'Product updated successfully' }))
      } else {
        const errorData = await r.json()
        alert('Failed to update: ' + (errorData.detail || 'Server error'))
      }
    } catch (e) {
      console.error('Update error:', e)
      alert('Error updating product. Please check your connection.')
    }
  }

  const fetchActivities = async () => {
    try {
      const r = await fetch(API + '/staff/activities/', {
        headers: token ? { Authorization: 'Token ' + token } : {}
      })
      if (!r.ok) throw new Error('Unauthorized')
      const data = await r.json()
      setActivities(data)
    } catch (e) {
      console.error('Failed to fetch activities:', e)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Trying to fetch from /product/product/ which is the CRUD endpoint
      const r = await fetch(API + '/product/product/', {
        headers: token ? { Authorization: 'Token ' + token } : {}
      })
      if (!r.ok) {
        // Fallback to public if CRUD fails (e.g. permission issues during debug)
        const r2 = await fetch(API + '/product/public/')
        if (!r2.ok) throw new Error('Failed to fetch products from both endpoints')
        const data = await r2.json()
        setProducts(data)
      } else {
        const data = await r.json()
        setProducts(data)
      }
    } catch (e) {
      console.error('Fetch products error:', e)
      // Final fallback to ensure the list is never empty if database has items
      try {
        const r3 = await fetch(API + '/product/public/')
        const data = await r3.json()
        setProducts(data)
      } catch (err) {}
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const r = await fetch(API + '/category/category/', {
        headers: token ? { Authorization: 'Token ' + token } : {}
      })
      if (!r.ok) throw new Error('Failed to fetch categories')
      const data = await r.json()
      setCategories(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.href = '/'
      return
    }

    const loadData = async () => {
      await Promise.all([fetchActivities(), fetchProducts(), fetchCategories()])
    }
    loadData()
    const interval = setInterval(fetchActivities, 3000)
    return () => clearInterval(interval)
  }, [token])

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => !selectedCategory || p.category.toString() === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price)
      return 0
    })

  const handleUpdatePrice = async (id, newPrice, newName) => {
    try {
      const body = { price: newPrice }
      if (newName) body.name = newName
      const r = await fetch(`${API}/product/product/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify(body)
      })
      if (r.ok) {
        window.dispatchEvent(new CustomEvent('toast', { detail: 'Product updated successfully' }))
        fetchProducts()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      const r = await fetch(`${API}/product/product/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Token ' + token }
      })
      if (r.ok) {
        window.dispatchEvent(new CustomEvent('toast', { detail: 'Product deleted' }))
        fetchProducts()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const r = await fetch(`${API}/product/product/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify(newProduct)
      })
      if (r.ok) {
        window.dispatchEvent(new CustomEvent('toast', { detail: 'Product added successfully' }))
        setShowAddModal(false)
        setNewProduct({ name: '', price: '', category: '', description: '' })
        fetchProducts()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      const r = await fetch(`${API}/product/product/${editingProduct.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify(editingProduct)
      })
      if (r.ok) {
        window.dispatchEvent(new CustomEvent('toast', { detail: 'Product updated successfully' }))
        setEditingProduct(null)
        fetchProducts()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="gradient-title">Admin Portal</h1>
            <p className="muted">Managing Employees & Products</p>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="staff-badge" style={{ whiteSpace: 'nowrap' }}>Admin Mode</span>
          </div>
        </header>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Quick Stats */}
          <div className="quick-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="stat-icon" style={{ background: '#e8f5e9', padding: '15px', borderRadius: '12px', fontSize: '1.5rem' }}>📦</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Products</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#2f7d32' }}>{products.length}</p>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="stat-icon" style={{ background: '#fff3e0', padding: '15px', borderRadius: '12px', fontSize: '1.5rem' }}>🏷️</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Categories</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#ef6c00' }}>{categories.length}</p>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="stat-icon" style={{ background: '#e3f2fd', padding: '15px', borderRadius: '12px', fontSize: '1.5rem' }}>💰</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Avg Price</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1565c0' }}>
                  ${products.length ? (products.reduce((acc, p) => acc + parseFloat(p.price), 0) / products.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Product Inventory Section */}
          <div className="card reveal">
            <div className="card-body">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Product Inventory</h3>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add New Product</button>
              </div>

              <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', background: '#f8fbf9', padding: '15px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search by product name..." 
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <select 
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                </select>
              </div>

              <div className="table-responsive" style={{ marginTop: '20px' }}>
                {loading ? (
                  <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading products...</p>
                  </div>
                ) : (
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '15px' }}>Product Name</th>
                        <th style={{ padding: '15px' }}>Price</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No products found matching your search</td></tr>
                      ) : (
                        filteredProducts.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' }}>
                            <td style={{ padding: '15px' }}>
                              <input 
                                type="text" 
                                value={tempData[p.id]?.name ?? p.name}
                                onChange={(e) => handleInlineChange(p.id, 'name', e.target.value)}
                                style={{ fontWeight: '600', color: '#333', border: '1px solid #eee', background: 'white', width: '100%', padding: '8px', borderRadius: '4px' }}
                                title="Edit name"
                              />
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#2f7d32' }}>$</span>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={tempData[p.id]?.price ?? p.price}
                                  onChange={(e) => handleInlineChange(p.id, 'price', e.target.value)}
                                  style={{ width: '100px', padding: '8px', borderRadius: '5px', border: '1px solid #eee', fontWeight: 'bold' }}
                                  title="Edit price"
                                />
                              </div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button 
                                  className="btn btn-primary btn-sm" 
                                  onClick={() => handleSaveInline(p.id)} 
                                  disabled={!tempData[p.id]}
                                  style={{ padding: '6px 15px', opacity: !tempData[p.id] ? 0.5 : 1 }}
                                >💾 Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingProduct(p)} style={{ padding: '6px 12px' }}>✏️ Details</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p.id)} style={{ background: '#ff4d4d', color: 'white', padding: '6px 12px' }}>🗑️ Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Staff Activity Feed Section */}
          <div className="card reveal activity-card" style={{ marginTop: '40px' }}>
            <div className="card-body">
              <div className="card-header">
                <h3>Employee Activity Feed (Live)</h3>
                <span className="live-dot">Database Sync</span>
              </div>
              <div className="activity-list">
                {activities.length === 0 ? (
                  <p className="muted">No recent employee activities found in database.</p>
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
                        <span className="activity-time">{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="modal-card" style={{ background: 'white', padding: '35px', borderRadius: '20px', width: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>✨ Add New Product</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
              </div>
              <form onSubmit={handleAddProduct} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>Product Name</label>
                  <input type="text" placeholder="e.g. Fresh Milk 1L" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>Price ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>Description</label>
                  <textarea placeholder="Tell customers about this product..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '100px', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button className="btn btn-primary" type="submit" style={{ flex: '2', padding: '14px' }}>Save Product</button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowAddModal(false)} style={{ flex: '1' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="modal-card" style={{ background: 'white', padding: '35px', borderRadius: '20px', width: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>✏️ Edit Product</h3>
                <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
              </div>
              <form onSubmit={handleUpdateProduct} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>Product Name</label>
                  <input type="text" placeholder="Product Name" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>Price ($)</label>
                  <input type="number" step="0.01" placeholder="Price" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>Description</label>
                  <textarea placeholder="Description" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '100px', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button className="btn btn-primary" type="submit" style={{ flex: '2', padding: '14px' }}>Update Product</button>
                  <button className="btn btn-secondary" type="button" onClick={() => setEditingProduct(null)} style={{ flex: '1' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
