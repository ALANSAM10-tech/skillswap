

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Desserts'];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
      padding: '0.25rem 0'
    }}>
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary-filled'}`}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              borderRadius: '25px',
              border: isSelected ? 'none' : '1px solid var(--border-color)',
              boxShadow: isSelected ? '0 4px 10px var(--primary-glow)' : 'none'
            }}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
