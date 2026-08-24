import { useSyncExternalStore } from 'react';
import api, { getAccessToken, setAccessToken } from './apiConfig';

const USER_KEY = 'gadgetspot_user';
const FAVORITES_KEY = 'gadgetspot_favorites';
const CART_KEY = 'gadgetspot_cart';

const readUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeUser = (newUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  } catch (error) {
    console.error(error);
  }
};

const readStoredItems = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredItems = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

const normalizeProduct = (product) => {
  if (!product) return null;
  const productId = product.id || product._id;
  const image =
    product.image ||
    product.imageUrl ||
    (Array.isArray(product.images) && product.images[0]?.url) ||
    '';

  return {
    ...product,
    _id: product._id || productId,
    id: productId,
    name: product.name || product.title,
    image,
    price: product.price || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    featured: product.featured || false,
  };
};

const normalizeFavorites = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeProduct).filter(Boolean);
};

const normalizeCartItem = (item) => {
  if (!item) return null;
  const product = item.product || item;
  const normalizedProduct = normalizeProduct(product);
  if (!normalizedProduct) return null;

  return {
    ...normalizedProduct,
    quantity: item.quantity || product.quantity || 1,
    color: item.color || '',
  };
};

const normalizeCart = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeCartItem).filter(Boolean);
};

const getUserId = (user) => user?._id || user?.id;
const isAuthenticatedSession = () => Boolean(getUserId(state.user) || getAccessToken());

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    _id: user._id || user.id,
    id: user.id || user._id,
  };
};

const readGuestFavorites = () => {
  const direct = readStoredItems(FAVORITES_KEY, []);
  const legacy = readStoredItems('localFavorites', []);
  const legacyAlt = readStoredItems('localfavorites', []);
  const items = direct.length ? direct : legacy.length ? legacy : legacyAlt;
  return normalizeFavorites(items);
};

const readGuestCart = () => {
  const direct = readStoredItems(CART_KEY, []);
  const legacy = readStoredItems('localCart', []);
  const legacyAlt = readStoredItems('localcart', []);
  const items = direct.length ? direct : legacy.length ? legacy : legacyAlt;
  return normalizeCart(items);
};

let state = {
  user: normalizeUser(readUser()),
  favorites: readGuestFavorites(),
  cart: readGuestCart(),
};

const listeners = new Set();

const setState = (updates) => {
  state = { ...state, ...updates };
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

const persistGuestState = () => {
  writeStoredItems(FAVORITES_KEY, state.favorites);
  writeStoredItems(CART_KEY, state.cart);
};

const mergeGuestStateToServer = async () => {
  if (!getUserId(state.user)) return;

  const guestFavorites = readGuestFavorites();
  const guestCart = readGuestCart();

  try {
    if (guestFavorites.length) {
      await api.post('/favourites/merge', { productIds: guestFavorites.map((item) => item.id || item._id) });
    }
  } catch (error) {
    console.error('Failed to merge guest favorites', error);
  }

  try {
    for (const item of guestCart) {
      const productId = item.id || item._id;
      if (productId) {
        await api.post('/carts/add', { productId, quantity: item.quantity || 1, color: item.color || '' });
      }
    }
  } catch (error) {
    console.error('Failed to merge guest cart', error);
  }

  localStorage.removeItem(FAVORITES_KEY);
  localStorage.removeItem(CART_KEY);
};

const loadServerFavorites = async () => {
  if (!isAuthenticatedSession()) return;

  try {
    const res = await api.get('/favourites');
    const favorites = normalizeFavorites(res.data?.favourites || res.data?.favorites || []);
    setState({ favorites });
    emit();
  } catch (error) {
    console.error('Failed to load favorites from server', error);
  }
};

const loadServerCart = async () => {
  if (!isAuthenticatedSession()) return;

  try {
    const res = await api.get('/carts');
    const cart = normalizeCart(res.data?.cart || res.data || []);
    setState({ cart });
    emit();
  } catch (error) {
    console.error('Failed to load cart from server', error);
  }
};

export const loadServerData = async () => {
  await Promise.all([loadServerFavorites(), loadServerCart()]);
  if (!isAuthenticatedSession()) {
    setState({
      favorites: readGuestFavorites(),
      cart: readGuestCart(),
    });
    emit();
  }
};

export const updateUser = (userData) => {
  const normalizedUser = normalizeUser({ ...state.user, ...userData });
  setState({ user: normalizedUser });
  writeUser(normalizedUser);
  emit();
};

export const setUser = async (newUser) => {
  const normalizedUser = normalizeUser(newUser);
  setState({ user: normalizedUser });
  writeUser(normalizedUser);

  if (isAuthenticatedSession()) {
    await loadServerData();
    await mergeGuestStateToServer();
    await loadServerData();
  } else {
    setState({
      favorites: readGuestFavorites(),
      cart: readGuestCart(),
    });
    emit();
  }
};

export const logout = async () => {
  setAccessToken(null);
  writeUser(null);
  setState({
    user: null,
    favorites: readGuestFavorites(),
    cart: readGuestCart(),
  });
  emit();
};

export const toggleFavorite = async (product) => {
  const normalizedProduct = normalizeProduct(product);
  if (!normalizedProduct) return;

  const productId = normalizedProduct.id || normalizedProduct._id;
  const isAlreadyFavorite = state.favorites.some((item) => (item.id || item._id) === productId);

  const previousFavorites = [...state.favorites];
  const nextFavorites = isAlreadyFavorite
    ? state.favorites.filter((item) => (item.id || item._id) !== productId)
    : [...state.favorites, normalizedProduct];

  setState({ favorites: nextFavorites });
  if (!isAuthenticatedSession()) {
    persistGuestState();
  }
  emit();

  if (!isAuthenticatedSession()) return;

  try {
    if (isAlreadyFavorite) {
      await api.delete(`/favourites/remove/${productId}`);
      const favorites = normalizeFavorites((await api.get('/favourites')).data?.favourites || []);
      setState({ favorites });
    } else {
      const res = await api.post(`/favourites/add/${productId}`);
      const favorites = normalizeFavorites(res.data?.favourites || res.data?.favorites || []);
      setState({ favorites });
    }
  } catch (error) {
    setState({ favorites: previousFavorites });
    console.error('Failed to sync favorites', error);
  }

  emit();
};

export const removeFavorite = async (product) => {
  const normalizedProduct = normalizeProduct(product);
  if (!normalizedProduct) return;
  const productId = normalizedProduct.id || normalizedProduct._id;
  if (!productId) return;

  const previousFavorites = [...state.favorites];
  setState({ favorites: state.favorites.filter((item) => (item.id || item._id) !== productId) });
  if (!isAuthenticatedSession()) {
    persistGuestState();
  }
  emit();

  if (!isAuthenticatedSession()) return;

  try {
    await api.delete(`/favourites/remove/${productId}`);
    const favorites = normalizeFavorites((await api.get('/favourites')).data?.favourites || []);
    setState({ favorites });
  } catch (error) {
    setState({ favorites: previousFavorites });
    console.error('Failed to remove favorite', error);
  }

  emit();
};

export const isFavorite = (product) => {
  const normalizedProduct = normalizeProduct(product);
  if (!normalizedProduct) return false;
  const productId = normalizedProduct.id || normalizedProduct._id;
  return state.favorites.some((item) => (item.id || item._id) === productId);
};

export const addToCart = async (product, quantity = 1, color = '') => {
  const normalizedProduct = normalizeProduct(product);
  if (!normalizedProduct) return;

  const productId = normalizedProduct.id || normalizedProduct._id;
  const previousCart = [...state.cart];
  const existingItem = state.cart.find((item) => (item.id || item._id) === productId && item.color === color);

  const nextCart = existingItem
    ? state.cart.map((item) =>
      (item.id || item._id) === productId && item.color === color
        ? { ...item, quantity: item.quantity + quantity }
        : item
    )
    : [...state.cart, { ...normalizedProduct, quantity, color }];

  setState({ cart: nextCart });
  if (!isAuthenticatedSession()) {
    persistGuestState();
  }
  emit();

  if (!isAuthenticatedSession()) return;

  try {
    const res = await api.post('/carts/add', { productId, quantity, color });
    const cart = normalizeCart(res.data?.cart || []);
    setState({ cart });
  } catch (error) {
    setState({ cart: previousCart });
    console.error('Failed to sync cart', error);
  }

  emit();
};

export const removeFromCart = async (productId, color = '') => {
  const previousCart = [...state.cart];
  setState({ cart: state.cart.filter((item) => !((item.id || item._id) === productId && item.color === color)) });
  if (!isAuthenticatedSession()) {
    persistGuestState();
  }
  emit();

  if (!isAuthenticatedSession()) return;

  try {
    const res = await api.delete(`/carts/remove/${productId}`, { data: { color } });
    const cart = normalizeCart(res.data?.cart || []);
    setState({ cart });
  } catch (error) {
    setState({ cart: previousCart });
    console.error('Failed to remove cart item', error);
  }

  emit();
};

export const updateQuantity = async (productId, quantity, color = '') => {
  const previousCart = [...state.cart];
  setState({
    cart: state.cart.map((item) =>
      (item.id || item._id) === productId && item.color === color
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ),
  });
  if (!isAuthenticatedSession()) {
    persistGuestState();
  }
  emit();

  if (!isAuthenticatedSession()) return;

  try {
    const res = await api.put(`/carts/update/${productId}`, { quantity: Math.max(1, quantity), color });
    const cart = normalizeCart(res.data || []);
    setState({ cart });
  } catch (error) {
    setState({ cart: previousCart });
    console.error('Failed to update cart quantity', error);
  }

  emit();
};

export const clearCart = async () => {
  setState({ cart: [] });
  persistGuestState();
  emit();

  if (!isAuthenticatedSession()) return;

  try {
    await api.delete('/carts/clear');
  } catch (error) {
    console.error('Failed to clear server cart', error);
  }
};

export const useStore = () => {
  const store = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );

  return {
    ...store,
    setUser,
    updateUser,
    logout,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    removeFavorite,
    isFavorite,
    loadServerData,
  };
};

if (typeof window !== 'undefined') {
  window.__gadgetspotStore = state;
  if (isAuthenticatedSession()) {
    loadServerData();
  }
}

export { readUser, writeUser };

