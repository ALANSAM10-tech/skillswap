/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useLocalStorage('skillswap_preferences', {
    theme: 'light',
  });

  useEffect(() => {
    // Apply theme to document element
    document.documentElement.setAttribute('data-theme', preferences.theme || 'light');
  }, [preferences.theme]);

  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, toggleTheme, updatePreference }}>
      {children}
    </PreferencesContext.Provider>
  );
};
