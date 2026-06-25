/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react';

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
  const [loading, setLoading] = useState(false);

  // Fetch with a 60-second timeout — prevents hanging on Render cold starts
  const fetchWithTimeout = (url, options = {}, timeoutMs = 60000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
      .then(res => { clearTimeout(timer); return res; })
      .catch(err => {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          throw new Error('Server is waking up — please wait ~30 seconds and try again.');
        }
        throw err;
      });
  };

  // Safely parse JSON — if server returns HTML (crash/404), shows a friendly error
  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error(`Server error (${res.status}) — please try again in a moment.`);
    }
    return res.json();
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Login failed');
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
      const res = await fetchWithTimeout('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Registration failed');
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

  const loginWithGoogle = async (googleProfile) => {
    try {
      setLoading(true);
      const res = await fetchWithTimeout('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleProfile)
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');
      if (!data.isNew) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('skillswap_user', JSON.stringify(data.user));
        localStorage.setItem('skillswap_token', data.token);
      }
      return { success: true, isNew: data.isNew, user: data.user, token: data.token };
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
      const res = await fetchWithTimeout(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Profile update failed');
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
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, switchUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
