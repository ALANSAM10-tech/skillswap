/* eslint-disable react-refresh/only-export-components */
import { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  // Store as [{ id: "...", name: "..." }] as per PRD specification
  const [favorites, setFavorites] = useLocalStorage('food_favorites', []);

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, { id: product.id, name: product.name }];
      }
    });
  };

  const isFavorite = (id) => {
    return favorites.some((item) => item.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
