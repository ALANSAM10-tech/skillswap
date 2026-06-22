
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';

export default function FavoriteCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite } = useFavorites();

  const handleCardClick = (e) => {
    if (e.target.closest('.no-nav')) return;
    navigate(`/food/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="food-card"
      style={{ cursor: 'pointer' }}
    >
      <div className="food-img-container" style={{ height: '150px' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="food-img"
          loading="lazy"
        />
        
        {/* Remove Button */}
        <button
          onClick={() => toggleFavorite(product)}
          className="fav-btn no-nav active"
          aria-label="Remove from favorites"
        >
          <Heart size={18} fill="currentColor" />
        </button>
      </div>

      <div className="food-info" style={{ padding: '1rem' }}>
        <span className="food-category" style={{ fontSize: '0.7rem' }}>{product.category}</span>
        <h3 className="food-name" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.75rem' }}>
          <Star size={12} fill="currentColor" />
          <span style={{ fontWeight: '600' }}>{product.rating}</span>
        </div>

        <div className="food-footer" style={{ border: 'none', paddingTop: 0 }}>
          <span className="food-price" style={{ fontSize: '1.15rem' }}>₹{product.price}</span>
          <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.availability}
            className="btn btn-primary no-nav"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              gap: '0.3rem'
            }}
          >
            <ShoppingCart size={12} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
