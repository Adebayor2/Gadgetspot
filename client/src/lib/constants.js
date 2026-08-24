export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

export const APP_ROUTES = {
  home: '/',
  products: '/products',
  about: '/about',
  contact: '/contact',
  signIn: '/signin',
  signUp: '/signup',
  forgotPassword: '/forgotpassword',
  resetPassword: '/reset-password',
  cart: '/cart',
  checkout: '/checkout',
  dashboard: '/dashboard',
  user: {
    products: '/user/products',
    profile: '/user/profile',
  },
  admin: {
    dashboard: '/admin/dashboard',
    products: '/admin/products',
    categories: '/admin/categories',
    users: '/admin/users',
    profile: '/admin/profile',
    settings: '/admin/settings',
  },
};

/** Compute a 0-5 password strength score */
export const calcPasswordStrength = (value) => {
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  return score;
};

export const STRENGTH_LABELS = ['', 'Weak', 'Weak', 'Fair', 'Strong', 'Strong'];
export const STRENGTH_COLORS = [
  'bg-slate-200',
  'bg-red-400',
  'bg-red-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-emerald-400',
];
