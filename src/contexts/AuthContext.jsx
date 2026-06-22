/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('skillswap_user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('skillswap_token') || null;
  });
  const [loading, setLoading] = useState(() => {
    const storedUser = localStorage.getItem('skillswap_user');
    return !storedUser; // only loading if no stored session exists to retrieve
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('skillswap_user');
    if (!storedUser) {
      // Auto-login as Alex Rivera (user-1) on first launch for a frictionless demo experience
      fetch('/api/users/user-1')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to auto-fetch default user');
        })
        .then(defaultUser => {
          setUser(defaultUser);
          setToken('mock-jwt-user-1');
          localStorage.setItem('skillswap_user', JSON.stringify(defaultUser));
          localStorage.setItem('skillswap_token', 'mock-jwt-user-1');
          setLoading(false);
        })
        .catch(err => {
          console.warn('Auto-login failed (backend might not be running yet):', err.message);
          setLoading(false);
        });
    }
  }, []);

  const login = async (email) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
      localStorage.setItem('skillswap_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
      localStorage.setItem('skillswap_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skillswap_user');
    localStorage.removeItem('skillswap_token');
  };

  const updateProfile = async (updatedData) => {
    if (!user) return { success: false, error: 'No authenticated user' };
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed');
      }
      setUser(data.user);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const switchUser = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch profile to switch');
      }
      const targetUser = await res.json();
      setUser(targetUser);
      const mockToken = 'mock-jwt-' + targetUser.id;
      setToken(mockToken);
      localStorage.setItem('skillswap_user', JSON.stringify(targetUser));
      localStorage.setItem('skillswap_token', mockToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
