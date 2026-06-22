import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import CartSummary from '../components/cart/CartSummary';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, packagingFee, cgst, sgst, total, clearCart } = useCart();
  const { placeOrder } = useOrders();

  // Generate pickup times (8:00 AM to 6:00 PM, 15 min intervals)
  const timeSlots = useMemo(() => {
    const slots = [];
    const startHour = 8;
    const endHour = 18; // 6 PM
    
    // Get current time to restrict past slots
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    for (let hr = startHour; hr < endHour; hr++) {
      for (let min = 0; min < 60; min += 15) {
        const timeStr = `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Show slot if it's in the future (minimum 10 mins from now), or if it's tomorrow
        const isFutureSlot = hr > currentHour || (hr === currentHour && min > currentMin + 10);
        
        // If current time is after 6 PM, show all slots for tomorrow
        const showSlot = currentHour >= endHour || isFutureSlot;
        
        if (showSlot) {
          const suffix = currentHour >= endHour ? ' (Tomorrow)' : '';
          slots.push({
            value: timeStr + suffix,
            label: `${hr % 12 || 12}:${min.toString().padStart(2, '0')} ${hr >= 12 ? 'PM' : 'AM'}${suffix}`
          });
        }
      }
    }
    return slots;
  }, []);

  const [name, setName] = useState('');
  const [role, setRole] = useState('Student'); // Student, Faculty, Staff
  const [identifier, setIdentifier] = useState(''); // Roll No / Dept
  const [pickupTime, setPickupTime] = useState(() => (timeSlots.length > 0 ? timeSlots[0].value : ''));
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!identifier.trim()) {
      setError(role === 'Student' ? 'Please enter your Roll Number.' : 'Please enter your Department.');
      return;
    }

    if (!pickupTime) {
      setError('Please select a pickup time.');
      return;
    }

    // Place order
    placeOrder(cartItems, pickupTime, total, name, role, identifier);
    
    // Clear cart
    clearCart();
    
    // Redirect to track orders page
    navigate('/orders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary-filled"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', padding: '0.5rem 1.25rem', marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} />
          Back to Cart
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Order Checkout</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Fill in your pickup credentials and schedule your collection window.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1.1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="checkout-grid">
        
        {/* Left: Pickup Credentials Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: '2rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            Pickup Details
          </h3>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-glow)',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="user-name">Full Name</label>
            <input
              type="text"
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (e.g. Rahul Sharma)"
              className="form-control"
              required
            />
          </div>

          {/* Role selection */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Canteen Category</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['Student', 'Faculty', 'Staff'].map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setIdentifier('');
                    }}
                    className={`btn ${active ? 'btn-primary' : 'btn-secondary-filled'}`}
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roll number or Dept */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="user-identifier">
              {role === 'Student' ? 'Roll Number' : 'Department'}
            </label>
            <input
              type="text"
              id="user-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={role === 'Student' ? "Enter Roll Number (e.g. CS23B104)" : "Enter Department name (e.g. Physics Dept)"}
              className="form-control"
              required
            />
          </div>

          {/* Pickup time selector */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="pickup-time-select">Scheduled Pickup Time</label>
            {timeSlots.length === 0 ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                Note: Canteen operational hours are between 8:00 AM and 6:00 PM. Currently closed.
              </p>
            ) : (
              <select
                id="pickup-time-select"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="form-control"
                style={{ cursor: 'pointer' }}
                required
              >
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Note (Simulated payment) */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            backgroundColor: 'var(--success-glow)',
            color: 'var(--success)',
            border: '1px solid var(--success)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            alignItems: 'flex-start',
            marginTop: '0.5rem'
          }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Pay on Delivery / UPI Scanner</strong>
              <span>Cash payment, UPI scanner code, and canteen food vouchers are accepted upon pickup at the counter. No pre-payment is required!</span>
            </div>
          </div>

        </form>

        {/* Right: Order Summary Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              Items Review
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="flex-between" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{item.quantity}x</strong> {item.name}
                  </span>
                  <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <CartSummary
            subtotal={subtotal}
            packagingFee={packagingFee}
            cgst={cgst}
            sgst={sgst}
            total={total}
            showCheckoutBtn={true}
            buttonText="Place Canteen Order"
            onCheckout={handleSubmit}
          />
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>

    </div>
  );
}
