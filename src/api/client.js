import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// When the frontend and backend are hosted separately, backend image URLs
// arrive as relative paths ("/uploads/x.jpg") and must be resolved against
// the backend origin. Absolute and data URLs pass through untouched.
export const mediaUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (!API_BASE.startsWith('http')) return url; // same origin — already correct
  return new URL(url, API_BASE.replace(/\/api\/?$/, '')).toString();
};

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send the httpOnly JWT cookie
});

/* Bearer-token fallback: when frontend and backend are hosted on different
   origins, browsers that block third-party cookies (Safari, Firefox) would
   drop the session cookie — the token from the login response keeps auth
   working everywhere. */
const TOKEN_KEY = 'cf_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setStoredToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
