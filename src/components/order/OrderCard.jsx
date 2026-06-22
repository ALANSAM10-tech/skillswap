
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Trash2, Calendar, Clock, Receipt } from 'lucide-react';
import OrderTimeline from './OrderTimeline';
import { useCart } from '../../hooks/useCart';

export default function OrderCard({ order, onCancel }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleReorder = () => {
    // Load each item back into the cart
    order.items.forEach((item) => {
      // Simulate product object from cart item
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.image
      }, item.quantity);
    });
    navigate('/cart');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'var(--warning)';
      case 'Preparing': return 'var(--primary)';
      case 'Ready for Pickup': return 'var(--secondary)';
      case 'Completed': return 'var(--success)';
      case 'Cancelled': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="glass-panel" style={{
      backgroundColor: 'var(--bg-secondary)',
      border: `1px solid var(--border-color)`,
      borderTop: `4px solid ${getStatusColor(order.status)}`,
      padding: '1.5rem',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      
      {/* Header Info */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Order ID</span>
          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Receipt size={16} style={{ color: 'var(--primary)' }} />
            {order.id}
          </h4>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>{order.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <Clock size={14} />
            <span>Pickup: <strong style={{ color: 'var(--text-main)' }}>{order.pickupTime}</strong></span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex-between" style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>{item.quantity}x</strong> {item.name}
            </span>
            <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed var(--border-color)', margin: '0.25rem 0' }}></div>

      {/* Total & Status Summary */}
      <div className="flex-between">
        <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Total Amount</span>
        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>₹{order.total}</span>
      </div>

      {/* Live Timeline Tracker */}
      <OrderTimeline status={order.status} />

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        {order.status === 'Pending' && (
          <button
            onClick={() => onCancel(order.id)}
            className="btn btn-danger"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.8rem',
              borderRadius: '20px',
              gap: '0.4rem'
            }}
          >
            <Trash2 size={14} />
            Cancel Order
          </button>
        )}

        {(order.status === 'Completed' || order.status === 'Cancelled') && (
          <button
            onClick={handleReorder}
            className="btn btn-primary"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.8rem',
              borderRadius: '20px',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={14} />
            Reorder
          </button>
        )}
      </div>

    </div>
  );
}
