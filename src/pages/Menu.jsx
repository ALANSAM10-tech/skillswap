import { useState, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import SearchBar from '../components/common/SearchBar';
import CategoryFilter from '../components/food/CategoryFilter';
import FoodGrid from '../components/food/FoodGrid';
import { SlidersHorizontal } from 'lucide-react';

export default function Menu() {
  const { preferences } = usePreferences();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State variables initialised synchronously with user preferences
  const [category, setCategory] = useState(preferences.preferredCategory || 'All');
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState(preferences.sortBy || 'price-asc');

  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load menu products.');
        }
        return res.json();
      })
      .then(data => {
        if (active) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) {
          setError('Could not retrieve menu. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Search, category filtering, and sorting calculations
  const filteredProducts = products
    .filter((product) => {
      // Category check
      const matchesCategory = category === 'All' || product.category === category;
      // Search check
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                            product.description.toLowerCase().includes(search.toLowerCase());
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') {
        return a.price - b.price;
      }
      if (sortOption === 'price-desc') {
        return b.price - a.price;
      }
      if (sortOption === 'popularity') {
        return b.rating - a.rating || b.reviews - a.reviews;
      }
      return 0;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Canteen Menu</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Browse available canteen delicacies, filter by categories, or sort to find your favorite bite.
        </p>
      </div>

      {/* Filter Toolbar Container */}
      <div className="glass-panel" style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        {/* Search & Sort Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '1rem',
          alignItems: 'center'
        }} className="menu-toolbar-row">
          
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search food items (e.g., wrap, pancakes, coffee)..."
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
            <SlidersHorizontal size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="form-control"
              style={{
                height: '46px',
                borderRadius: '30px',
                padding: '0 1rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              id="sort-select"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity">Popularity (Rating)</option>
            </select>
          </div>

        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

        {/* Category Pills Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            marginRight: '0.5rem'
          }}>
            Categories:
          </span>
          <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
        </div>

      </div>

      {/* Results grid */}
      <div style={{ marginTop: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading menu items...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--danger)' }}>
            {error}
          </div>
        ) : (
          <FoodGrid products={filteredProducts} />
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-toolbar-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
    </div>
  );
}
