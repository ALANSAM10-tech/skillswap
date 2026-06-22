
import { Sun, Moon } from 'lucide-react';
import { usePreferences } from '../../hooks/usePreferences';

export default function ThemeToggle() {
  const { preferences, toggleTheme } = usePreferences();
  const isDark = preferences.theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary-filled"
      style={{
        width: '40px',
        height: '40px',
        padding: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label="Toggle Theme"
      id="theme-toggle-btn"
    >
      {isDark ? (
        <Sun size={20} style={{ color: 'var(--warning)' }} />
      ) : (
        <Moon size={20} style={{ color: 'var(--text-main)' }} />
      )}
    </button>
  );
}
