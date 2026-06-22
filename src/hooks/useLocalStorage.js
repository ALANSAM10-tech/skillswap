import { useState, useEffect } from 'react';
import { storage } from '../services/localStorageService';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    return storage.get(key, defaultValue);
  });

  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);

  return [value, setValue];
}
