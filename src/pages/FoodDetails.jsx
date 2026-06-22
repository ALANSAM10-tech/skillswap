import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, ShoppingCart, Heart, Activity, Flame, ShieldAlert } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import QuantitySelector from '../components/cart/QuantitySelector';

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Product not found');
        }
        return res.json();
      })
      .then(data => {
        if (active) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading item details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: '1.5rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>Food Item Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The canteen item you are looking for does not exist or has been removed from the menu.</p>
        <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
      </div>
    );
  }

  const isFav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Dynamic overlay notification or direct navigate
    navigate('/cart');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary-filled"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', padding: '0.5rem 1.25rem' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Main details panel split into two sections: Image vs Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '3rem',
        alignItems: 'start'
      }} className="food-details-grid">
        
        {/* Left Side: Product Image & Badges */}
        <div style={{ position: 'relative' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '420px',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'cover',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          {!product.availability && (
            <span style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontWeight: '700',
              padding: '0.5rem 1.25rem',
              borderRadius: '30px',
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              Out of Stock
            </span>
          )}
        </div>

        {/* Right Side: Specifications & Purchase Trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Row */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.25rem', color: 'var(--text-main)' }}>
              {product.name}
            </h1>
          </div>

          {/* Ratings & Prep Time metadata */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: '700', fontSize: '1.05rem' }}>
              <Star size={18} fill="currentColor" />
              <span>{product.rating}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                ({product.reviews} reviews)
              </span>
            </div>
            
            <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Clock size={16} />
              <span>Prep Time: <strong>{product.estimatedTime} mins</strong></span>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.6',
            color: 'var(--text-muted)'
          }}>
            {product.description}
          </p>

          {/* Nutritional Info Cards */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              flex: 1,
              backgroundColor: 'var(--bg-tertiary)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Flame size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Energy</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{product.calories} kcal</span>
              </div>
            </div>

            <div style={{
              flex: 1,
              backgroundColor: 'var(--bg-tertiary)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Activity size={20} style={{ color: 'var(--secondary)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: product.availability ? 'var(--success)' : 'var(--danger)' }}>
                  {product.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Border divider */}
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.5rem 0' }}></div>

          {/* Price & Quantity adjusting */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Price</span>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                ₹{product.price}
              </span>
            </div>

            {product.availability && (
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textAlign: 'right' }} className="qty-label-align">
                  Quantity
                </span>
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={() => setQuantity(prev => Math.min(prev + 1, 10))}
                  onDecrease={() => setQuantity(prev => Math.max(prev - 1, 1))}
                />
              </div>
            )}
          </div>

          {/* Checkout & Favorite Action Row */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={!product.availability}
              className="btn btn-primary"
              style={{
                flexGrow: 1,
                height: '48px',
                fontSize: '0.95rem'
              }}
            >
              <ShoppingCart size={18} />
              Add to Cart - ₹{product.price * quantity}
            </button>

            <button
              onClick={() => toggleFavorite(product)}
              className={`btn ${isFav ? 'btn-secondary' : 'btn-secondary-filled'}`}
              style={{
                width: '48px',
                height: '48px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: isFav ? '#ef4444' : 'var(--border-color)',
                color: isFav ? '#ef4444' : 'var(--text-main)'
              }}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 800px) {
          .food-details-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .qty-label-align {
            text-align: left !important;
          }
        }
      `}</style>
      
    </div>
  );
}
