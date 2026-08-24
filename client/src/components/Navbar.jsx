import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useStore } from '../lib/useStore';
import logoutUser from '../lib/logOut';



const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { cart, favorites, user, logout } = useStore();
  const cartItemsCount = cart.length;
  const favoritesCount = favorites.length;
  const navigate = useNavigate();

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
    setIsSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-sky-200/30 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1 group">
              <img src="/gadgetspot-logo.png" alt="GadgetSpot" className="h-12 w-12 object-contain bg-transparent" />
              <span className="text-md font-bold tracking-tight text-slate-800 focus:outline-none  sm:inline">
                Gadget<span className="text-sky-500">Spot</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-700 hover:text-sky-500  transition-colors duration-200">Home</Link>
            <Link to="/products" className="text-sm font-medium text-slate-700 hover:text-sky-500 transition-colors duration-200">Products</Link>
            <Link to="/about" className="text-sm font-medium text-slate-700 hover:text-sky-500 transition-colors duration-200">About</Link>
            <Link to="/contact" className="text-sm font-medium text-slate-700 hover:text-sky-500 transition-colors duration-200">Contact</Link>
            <Link to="/guestorder" className="text-sm font-medium text-slate-700 hover:text-sky-500 transition-colors duration-200">Track Order</Link>

          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              className="rounded-full p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 cursor-pointer"
            >
              <FiSearch className="h-5 w-5" />
            </button>

            <Link
              to={user?._id ? '/user/favourites' : '/guest/favourites'}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 cursor-pointer"
              aria-label="Favourites"
            >
              <FiHeart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-sky-50">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              aria-label="Cart"
            >
              <FiShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-sky-50">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <Link to="/signin" className="flex items-center gap-2 text-white bg-sky-500 hover:bg-sky-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-sky-100 transition-all duration-200">
              <FiUser className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          </div>


          {/* Mobile Menu Button and Icons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 hover:bg-slate-50  hover:text-slate-900 transition-all duration-200"
              aria-label="Search"
            >
              <FiSearch className="h-5 w-5" />
            </button>

            <Link
              to={user?._id ? '/user/favourites' : '/guest/favourites'}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 relative"
              aria-label="Favourites"
            >
              <FiHeart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3  w-3">
                  <span className="relative inline-flex h-2 w-2 rounded-full  font-bold bg-amber-500">
                  </span>
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 relative"
              aria-label="Cart"
            >
              <FiShoppingCart className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
              </span>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="border-b border-slate-100 bg-white shadow-md px-4 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleSearchSubmit}
                className="rounded-lg px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 transition-all duration-200"
                type="button"
              >
                Search
              </button>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                aria-label="Close search"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer/Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen border-b border-slate-100 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="space-y-1 px-4 pt-2 pb-6 bg-white shadow-inner">
          <Link to="/" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Home</Link>
          <Link to="/products" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Products</Link>
          <Link to={user?._id ? '/user/favourites' : '/guest/favourites'} onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Favourites</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Contact</Link>
          <Link to="/guestorder" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Track Order</Link>


          <div className="my-4 border-t border-slate-100 pt-4"></div>

          <div className="mt-4 px-4">


            <Link to="/signin" className="flex w-full items-center justify-center gap-2 rounded-xl border text-white bg-sky-400 border-slate-200 py-3 text-base font-medium hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
              <FiUser className="h-5 w-5" />
              <span>Sign In</span>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
