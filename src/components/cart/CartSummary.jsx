
import { CreditCard } from 'lucide-react';

export default function CartSummary({ subtotal, packagingFee, cgst, sgst, total, onCheckout, buttonText = "Proceed to Checkout", showCheckoutBtn = true }) {
  return (
    <div className="glass-panel" style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      padding: '1.75rem',
      borderRadius: 'var(--radius-md)'
    }}>
      <h3 style={{
        fontSize: '1.15rem',
        fontWeight: '700',
        marginBottom: '1.25rem',
        color: 'var(--text-main)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        Order Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        
        {/* Subtotal */}
        <div className="flex-between">
          <span>Subtotal</span>
          <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>₹{subtotal}</span>
        </div>

        {/* Packaging Fee */}
        <div className="flex-between">
          <span>Canteen Packaging Charge</span>
          <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>₹{packagingFee}</span>
        </div>

        {/* CGST */}
        <div className="flex-between">
          <span>CGST (2.5%)</span>
          <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>₹{cgst}</span>
        </div>

        {/* SGST */}
        <div className="flex-between">
          <span>SGST (2.5%)</span>
          <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>₹{sgst}</span>
        </div>

        {/* Border divider */}
        <div style={{ borderTop: '1px dashed var(--border-color)', margin: '0.5rem 0' }}></div>

        {/* Total Price */}
        <div className="flex-between" style={{
          fontSize: '1.2rem',
          fontWeight: '800',
          color: 'var(--text-main)'
        }}>
          <span>Grand Total</span>
          <span style={{ color: 'var(--primary)' }}>₹{total}</span>
        </div>
      </div>

      {showCheckoutBtn && (
        <button
          onClick={onCheckout}
          disabled={total <= 0}
          className="btn btn-primary"
          style={{
            width: '100%',
            marginTop: '1.5rem',
            height: '48px',
            fontSize: '0.95rem'
          }}
        >
          <CreditCard size={18} />
          {buttonText}
        </button>
      )}
    </div>
  );
}
