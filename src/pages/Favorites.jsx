import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { foodData } from '../data/foodData';
import FavoriteCard from '../components/favorites/FavoriteCard';

export default function Favorites() {
  const { favorites } = useFavorites();

  // Resolve the short favorites structure [{ id: "...", name: "..." }] to full product details
  const favoritedProducts = foodData.filter((product) =>
    favorites.some((fav) => fav.id === product.id)
  );

  if (favoritedProducts.length === 0) {
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
          backgroundColor: 'var(--danger-glow)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Heart size={36} fill="#ef4444" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>No Favorites Saved</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '380px', lineHeight: '1.5' }}>
          You haven't favorited any canteen food items yet. Add them to your list by tapping the heart icon on any card.
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
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Your Favorites</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Quickly view, manage, and order your saved campus bites.
        </p>
      </div>

      {/* Grid of favorite cards */}
      <div className="products-grid">
        {favoritedProducts.map((product) => (
          <FavoriteCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}
