
import FoodCard from './FoodCard';
import { Sparkles } from 'lucide-react';

export default function FoodGrid({ products }) {
  if (products.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '5rem 2rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-glow)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>No Canteen Items Found</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
          We couldn't find any dishes matching your criteria. Try adjusting your search query or selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <FoodCard key={product.id} product={product} />
      ))}
    </div>
  );
}
