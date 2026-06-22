import { useNavigate } from 'react-router-dom';
import { Heart, Star, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';

export default function FoodCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const isFav = isFavorite(product.id);

  const handleCardClick = (e) => {
    // If user clicks a button or favorite trigger, do not navigate
    if (e.target.closest('.no-nav')) return;
    navigate(`/food/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="food-card"
      style={{ cursor: 'pointer' }}
    >
      {/* Image Container */}
      <div className="food-img-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="food-img"
          loading="lazy"
        />
        
        {/* Availability Badge */}
        {!product.availability ? (
          <span className="food-badge unavailable">Out of Stock</span>
        ) : (
          <span className="food-badge">{product.estimatedTime} mins</span>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(product)}
          className={`fav-btn no-nav ${isFav ? 'active' : ''}`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Product Info */}
      <div className="food-info">
        <span className="food-category">{product.category}</span>
        <h3 className="food-name">{product.name}</h3>
        <p className="food-desc">{product.description}</p>

        {/* Ratings and prep time */}
        <div className="food-meta">
          <div className="food-rating">
            <Star size={14} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
          <span>({product.reviews} reviews)</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} />
            {product.calories} kcal
          </span>
        </div>

        {/* Pricing and cart action */}
        <div className="food-footer">
          <span className="food-price">₹{product.price}</span>
          <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.availability}
            className="btn btn-primary no-nav"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              gap: '0.4rem'
            }}
          >
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
