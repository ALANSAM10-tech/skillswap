
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    packagingFee,
    cgst,
    sgst,
    total
  } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '6rem 2rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-glow)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '380px', lineHeight: '1.5' }}>
          Looks like you haven't added any canteen delights to your cart yet. Head back to the menu to explore delicious campus bites!
        </p>
        <Link to="/menu" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Shopping Cart</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Review your items and adjust quantities before placing your canteen order.
          </p>
        </div>
        
        <button
          onClick={clearCart}
          className="btn btn-secondary-filled"
          style={{
            border: 'none',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            padding: '0.5rem 1.25rem',
            gap: '0.4rem'
          }}
        >
          <Trash2 size={16} />
          Clear Cart
        </button>
      </div>

      {/* Cart Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="cart-grid">
        
        {/* Left: Cart Items List */}
        <div className="glass-panel" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem 2rem',
          borderRadius: 'var(--radius-md)'
        }}>
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}

          {/* Quick back link */}
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/menu" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Cart Summary Panel */}
        <div>
          <CartSummary
            subtotal={subtotal}
            packagingFee={packagingFee}
            cgst={cgst}
            sgst={sgst}
            total={total}
            onCheckout={handleCheckout}
          />
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>

    </div>
  );
}
