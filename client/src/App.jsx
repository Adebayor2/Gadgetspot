import React from 'react'
import { Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/user/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import UserDashboard from './pages/user/UserDashboard'
import UserProducts from './pages/user/UserProducts'
import UserOrders from './pages/user/Orders'
import UserProfile from './pages/user/UserProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminRevenue from './pages/admin/AdminRevenue'
import AdminCategories from './pages/admin/AdminCategories'
import AdminUsers from './pages/admin/AdminUsers'
import Settings from './pages/admin/Settings'
import Profile from './pages/admin/Profile'
import AdminProductDetail from './pages/admin/AdminProductDetail'
import Cart from './pages/user/Cart'
import Checkout from './pages/user/Checkout'
import GuestCart from './pages/GuestCart'
import GuestCheckout from './pages/GuestCheckout'
import GuestProductDetail from './pages/GuestProductDetail'
import ProtectedRoute from './pages/auth/ProtectedRoute'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import GuestFavourites from './pages/GuestFavourites'
import Favourites from './pages/user/Favourites'
import GuestTrackOrder from './pages/GuestTrackOrder'
import UserDashboardLayout from './components/user/UserDashboardLayout'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import PaymentCallback from './pages/PaymentCallback'
import { useStore } from './lib/useStore'
import NotFound from './pages/NotFound'

const CartPage = () => {
  const { user } = useStore();
  return user ? <Cart /> : <GuestCart />;
};

const CheckoutPage = () => {
  const { user } = useStore();
  return user ? <Checkout /> : <GuestCheckout />;
};

const ProductDetailPage = () => {
  const { user } = useStore();
  return user ? <ProductDetail /> : <GuestProductDetail />;
};

const App = () => {

  return (
    <>
      <Toaster />
      <div className="overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />

          <Route path="/guest/favourites" element={<GuestFavourites />} />
          <Route path="/guestorder" element={<GuestTrackOrder />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path='/payment/callback' element={<PaymentCallback />} />
          <Route path='/forgotpassword' element={<ForgotPassword />}></Route>
          <Route path='/reset-password' element={<ResetPassword />}></Route>
          <Route path='/verify-email' element={<VerifyEmail />}></Route>
          <Route path='*' element={<NotFound/>}></Route>




          <Route path='/dashboard' element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<Terms />} />

          <Route path='/user/products' element={
            <ProtectedRoute>
              <UserProducts />
            </ProtectedRoute>
          } />

          <Route path='/user/orders' element={
            <ProtectedRoute>
              <UserOrders />
            </ProtectedRoute>
          } />

          <Route path="/user/favourites" element={
            <ProtectedRoute>
              <Favourites />
            </ProtectedRoute>
          } />

          <Route path='/user/profile' element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />


          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/revenue" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRevenue />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/products/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProductDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes >
      </div>
    </>
  )
}

export default App
