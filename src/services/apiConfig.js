/**
 * Central API configuration.
 * - In local dev:  Vite proxy handles /api → localhost:5000
 * - In production: VITE_API_URL points to the deployed backend
 */

// __API_BASE__ is injected by vite.config.js from VITE_API_URL env var
// Falls back to '' (empty string) so /api paths work via Vite proxy in dev
const API_BASE = (typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : '') || '';

export const apiUrl = (path) => `${API_BASE}${path}`;

export default API_BASE;
