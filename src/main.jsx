import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

// --- Production API proxy ---
// In local dev, Vite proxies /api/* to localhost:5000.
// In production (Firebase Hosting), we intercept fetch calls to /api/*
// and redirect them to the Render backend so no code changes are needed elsewhere.
const API_BASE = import.meta.env.VITE_API_URL || '';
if (API_BASE) {
  const _fetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = API_BASE + input;
    } else if (input instanceof Request && input.url.startsWith('/api/')) {
      input = new Request(API_BASE + input.url, input);
    }
    return _fetch(input, init);
  };
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
