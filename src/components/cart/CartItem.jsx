
import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1.25rem 0',
      borderBottom: '1px solid var(--border-color)',
      alignItems: 'center'
    }}>
      {/* Product Image */}
      <img
        src={item.image}
        alt={item.name}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-sm)',
          objectFit: 'cover',
          backgroundColor: 'var(--bg-tertiary)'
        }}
      />

      {/* Info Details */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: 'var(--text-main)'
        }}>
          {item.name}
        </h4>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ₹{item.price} each
        </span>
        
        {/* Quantity Controls for Mobile */}
        <div style={{ marginTop: '0.5rem' }} className="cart-item-mobile-qty">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
          />
        </div>
      </div>

      {/* Quantity Controls (Desktop) & Price */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        textAlign: 'right'
      }} className="cart-item-desktop-ctrls">
        <div className="cart-item-desktop-qty">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
          />
        </div>
        
        <div style={{ minWidth: '80px' }}>
          <span style={{
            fontSize: '1.05rem',
            fontWeight: '700',
            color: 'var(--text-main)'
          }}>
            ₹{item.price * item.quantity}
          </span>
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'var(--transition-fast)'
          }}
          className="delete-item-btn"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .cart-item-desktop-qty {
            display: none !important;
          }
          .cart-item-mobile-qty {
            display: block !important;
          }
        }
        @media (min-width: 601px) {
          .cart-item-mobile-qty {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
