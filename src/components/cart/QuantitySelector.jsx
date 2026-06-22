
import { Plus, Minus } from 'lucide-react';

export default function QuantitySelector({ quantity, onIncrease, onDecrease, min = 1, max = 10 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: 'var(--bg-tertiary)',
      padding: '0.25rem 0.5rem',
      borderRadius: '30px',
      border: '1px solid var(--border-color)',
      width: 'fit-content'
    }}>
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        style={{
          background: 'none',
          border: 'none',
          cursor: quantity <= min ? 'not-allowed' : 'pointer',
          color: quantity <= min ? 'var(--text-muted)' : 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          transition: 'var(--transition-fast)'
        }}
        className="quantity-btn-action"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      
      <span style={{
        fontSize: '0.9rem',
        fontWeight: '700',
        minWidth: '18px',
        textAlign: 'center',
        color: 'var(--text-main)',
        userSelect: 'none'
      }}>
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        style={{
          background: 'none',
          border: 'none',
          cursor: quantity >= max ? 'not-allowed' : 'pointer',
          color: quantity >= max ? 'var(--text-muted)' : 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          transition: 'var(--transition-fast)'
        }}
        className="quantity-btn-action"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
