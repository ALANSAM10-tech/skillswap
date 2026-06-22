import { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, Plus, Edit2, Trash2, ClipboardList, X, RefreshCw } from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Desserts'];

export default function Admin() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  
  // Data lists
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Loaders & Feedback
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [formError, setFormError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Product Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Breakfast',
    price: '',
    stock: '',
    estimatedTime: '',
    calories: '',
    imageUrl: '',
    ingredients: '',
    protein: 'N/A',
    carbs: 'N/A',
    fat: 'N/A'
  });

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort orders newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        // Token might be expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch orders and products if token changes or is present
  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrders();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        sessionStorage.setItem('adminToken', data.token);
      } else {
        setLoginError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setLoginError('Server error. Please verify the backend is running.');
    }
  };

  function handleLogout() {
    setToken('');
    sessionStorage.removeItem('adminToken');
    setOrders([]);
    setProducts([]);
  }

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showFeedback(`Order ${orderId} updated to "${nextStatus}"`);
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showFeedback(`Order ${orderId} cancelled.`);
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(`Are you sure you want to delete this menu item?`)) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showFeedback('Menu item deleted successfully.');
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Breakfast',
      price: '',
      stock: '50',
      estimatedTime: '10',
      calories: '300',
      imageUrl: '',
      ingredients: '',
      protein: 'N/A',
      carbs: 'N/A',
      fat: 'N/A'
    });
    setFormError('');
    setShowProductForm(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      category: prod.category,
      price: prod.price.toString(),
      stock: prod.stock ? prod.stock.toString() : '50',
      estimatedTime: prod.estimatedTime ? prod.estimatedTime.toString() : '10',
      calories: prod.calories ? prod.calories.toString() : '300',
      imageUrl: prod.imageUrl || '',
      ingredients: prod.nutrition && prod.nutrition.ingredients ? prod.nutrition.ingredients.join(', ') : '',
      protein: prod.nutrition && prod.nutrition.protein ? prod.nutrition.protein : 'N/A',
      carbs: prod.nutrition && prod.nutrition.carbs ? prod.nutrition.carbs : 'N/A',
      fat: prod.nutrition && prod.nutrition.fat ? prod.nutrition.fat : 'N/A'
    });
    setFormError('');
    setShowProductForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock);
    const timeNum = parseInt(formData.estimatedTime);
    const calNum = parseInt(formData.calories);

    if (!formData.name.trim() || !formData.description.trim() || isNaN(priceNum) || isNaN(stockNum)) {
      setFormError('Please fill out all required fields with valid numbers.');
      return;
    }

    const ingredientsList = formData.ingredients
      ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
      : [];

    const productPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: priceNum,
      stock: stockNum,
      estimatedTime: timeNum,
      calories: calNum,
      imageUrl: formData.imageUrl.trim() || undefined,
      nutrition: {
        calories: `${calNum} kcal`,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        ingredients: ingredientsList
      },
      origin: 'Canteen Kitchen',
      benefits: ['Freshly prepared', 'Serve warm'],
      usage: 'Consume fresh.'
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productPayload)
      });

      if (res.ok) {
        showFeedback(editingProduct ? 'Menu item updated.' : 'New menu item added.');
        setShowProductForm(false);
        fetchProducts();
      } else {
        const errData = await res.json();
        setFormError(errData.message || 'Failed to save product details.');
      }
    } catch (err) {
      console.error('Product save error:', err);
      setFormError('Network error. Failed to save product details.');
    }
  };

  // Login View
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem' }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={36} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Canteen Admin Portal</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Authenticate using your canteen password to manage live order streams and menu catalogs.
            </p>
          </div>

          {loginError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-glow)',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="admin-pass">Admin Password</label>
              <input
                type="password"
                id="admin-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password (e.g., admin)"
                className="form-control"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px', marginTop: '0.5rem' }}>
              <LogIn size={18} />
              Login to Canteen Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Feedback Overlay */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--success)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '30px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 1000,
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <ShieldCheck size={18} />
          {feedbackMsg}
        </div>
      )}

      {/* Header Block */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
            Canteen Operations Dashboard
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Monitor real-time student/faculty orders and regulate the catalog.
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary-filled" style={{ borderColor: 'var(--border-color)', height: '40px' }}>
          Logout Panel
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary-filled'}`}
            style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
          >
            Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary-filled'}`}
            style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
          >
            Manage Menu ({products.length})
          </button>
        </div>

        <button
          onClick={activeTab === 'orders' ? fetchOrders : fetchProducts}
          className="btn btn-secondary-filled"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: '38px', padding: '0 0.85rem' }}
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loadingOrders || loadingProducts ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ORDERS TAB PANEL */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders && orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading active order stream...</p>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)' }}>
              <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Orders Placed Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Active student/faculty checkout orders will pop up here in real-time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => {
                const isCancelled = order.status === 'Cancelled';
                const isCompleted = order.status === 'Completed';
                
                let statusBadgeColor = 'var(--text-muted)';
                let statusBg = 'var(--bg-tertiary)';
                if (order.status === 'Pending') {
                  statusBadgeColor = 'var(--primary)';
                  statusBg = 'var(--primary-glow)';
                } else if (order.status === 'Preparing') {
                  statusBadgeColor = 'var(--secondary)';
                  statusBg = 'var(--secondary-glow)';
                } else if (order.status === 'Ready for Pickup') {
                  statusBadgeColor = 'var(--success)';
                  statusBg = 'var(--success-glow)';
                } else if (order.status === 'Cancelled') {
                  statusBadgeColor = 'var(--danger)';
                  statusBg = 'var(--danger-glow)';
                }

                return (
                  <div key={order.id} className="glass-panel" style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '1.5rem 2rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    
                    {/* Upper row */}
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                          #{order.id}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: statusBg,
                          color: statusBadgeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {order.status}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({order.pickupTime ? `Pickup: ${order.pickupTime}` : 'Immediate'})
                        </span>
                      </div>
                      
                      <div style={{ fontWeight: '800', fontSize: '1.15rem' }}>
                        ₹{order.total}
                      </div>
                    </div>

                    {/* Middle: customer profile & items */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }} className="admin-order-body">
                      
                      {/* Customer Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                          Customer Profile
                        </span>
                        <strong style={{ fontSize: '1rem' }}>{order.customerName}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Category: <strong>{order.role}</strong>
                        </span>
                        {order.identifier && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {order.role === 'Student' ? 'Roll No:' : 'Dept:'} <strong>{order.identifier}</strong>
                          </span>
                        )}
                      </div>

                      {/* Items List */}
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                          Items Ordered
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <span style={{ flexGrow: 1 }}>
                                <strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.name}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Lower: Admin Action controls */}
                    {!isCancelled && !isCompleted && (
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'Preparing')}
                            className="btn btn-secondary-filled"
                            style={{ height: '36px', fontSize: '0.85rem', backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', border: 'none' }}
                          >
                            Accept & Prepare
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'Ready for Pickup')}
                            className="btn btn-secondary-filled"
                            style={{ height: '36px', fontSize: '0.85rem', backgroundColor: 'var(--success-glow)', color: 'var(--success)', border: 'none' }}
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'Ready for Pickup' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'Completed')}
                            className="btn btn-primary"
                            style={{ height: '36px', fontSize: '0.85rem' }}
                          >
                            Mark Completed (Delivered)
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="btn btn-secondary-filled"
                          style={{ height: '36px', fontSize: '0.85rem', color: 'red', borderColor: 'rgba(255,0,0,0.1)' }}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MENU MANAGEMENT TAB PANEL */}
      {activeTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Controls row */}
          <div className="flex-between">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Canteen Food Catalog</h3>
            <button onClick={handleOpenAddForm} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: '38px' }}>
              <Plus size={18} />
              Add Menu Item
            </button>
          </div>

          {/* Form Modal Dialog */}
          {showProductForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowProductForm(false)}
                  style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem' }}>
                  {editingProduct ? 'Edit Menu Product' : 'Add New Menu Product'}
                </h3>

                {formError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--danger-glow)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}>
                    {formError}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Basic fields */}
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Canteen Butter Naan"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. 120"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Initial Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="e.g. 50"
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Prep Time (mins)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                        placeholder="e.g. 10"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Calories (kcal)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        placeholder="e.g. 350"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Description *</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter recipe details, allergen warning, or servings description."
                      style={{ height: '70px', resize: 'vertical' }}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Custom Image URL (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="e.g. /uploads/special-item.jpg (leaves blank for placeholder)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ingredients (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      placeholder="e.g. Wheat Flour, Cheddar, Spices"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Protein (g)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        placeholder="e.g. 8g"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Carbs (g)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                        placeholder="e.g. 45g"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fat (g)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                        placeholder="e.g. 12g"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setShowProductForm(false)} className="btn btn-secondary-filled" style={{ flex: 1, border: 'none', height: '46px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '46px' }}>
                      Save Product details
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* Menu Catalog List */}
          {loadingProducts && products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading catalog items...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {products.map((prod) => (
                <div key={prod.id} className="glass-panel" style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem 1.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                        {prod.category}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                        {prod.name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Price: <strong>₹{prod.price}</strong> | Stock: <strong>{prod.stock}</strong> units | Time: <strong>{prod.estimatedTime} mins</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEditForm(prod)}
                      className="btn btn-secondary-filled"
                      style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="btn btn-secondary-filled"
                      style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', borderColor: 'rgba(255,0,0,0.1)' }}
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
