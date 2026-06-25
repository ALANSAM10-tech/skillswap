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

// --- Cold Start Wake-up Banner ---
// Shows a friendly toast when Render's free backend is waking up from sleep.
let bannerShown = false;
let bannerEl = null;

function showWakeUpBanner() {
  if (bannerShown) return;
  bannerShown = true;
  bannerEl = document.createElement('div');
  bannerEl.id = 'wakeup-banner';
  bannerEl.innerHTML = `
    <div style="
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #1e1e2e, #2d2d44);
      color: #e2e8f0; padding: 0.85rem 1.5rem;
      border-radius: 50px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(99,102,241,0.3);
      display: flex; align-items: center; gap: 0.75rem;
      font-family: 'Inter', system-ui, sans-serif; font-size: 0.875rem; font-weight: 500;
      z-index: 99999; white-space: nowrap;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="
        width: 16px; height: 16px; border: 2px solid rgba(99,102,241,0.3);
        border-top-color: #6366f1; border-radius: 50%;
        animation: spin 0.8s linear infinite; flex-shrink: 0;
      "></div>
      <span>⚡ Waking up server — first load may take ~30s on free tier…</span>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes slideUp { from { opacity:0; transform: translate(-50%,16px); } to { opacity:1; transform: translate(-50%,0); } }
    </style>
  `;
  document.body.appendChild(bannerEl);
}

function hideWakeUpBanner() {
  if (bannerEl) {
    bannerEl.style.transition = 'opacity 0.5s';
    bannerEl.style.opacity = '0';
    setTimeout(() => bannerEl?.remove(), 500);
    bannerEl = null;
  }
}

if (API_BASE) {
  const _fetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const isApi =
      (typeof input === 'string' && input.startsWith('/api/')) ||
      (input instanceof Request && input.url.startsWith('/api/'));

    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = API_BASE + input;
    } else if (input instanceof Request && input.url.startsWith('/api/')) {
      input = new Request(API_BASE + input.url, input);
    }

    if (isApi) {
      // Show banner after 2 seconds if request hasn't resolved
      const timer = setTimeout(showWakeUpBanner, 2000);
      return _fetch(input, init).then(res => {
        clearTimeout(timer);
        hideWakeUpBanner();
        return res;
      }).catch(err => {
        clearTimeout(timer);
        hideWakeUpBanner();
        throw err;
      });
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

