import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiUser,
  FiShoppingCart,
  FiHeart,
} from 'react-icons/fi';

const navItems = [
  { name: 'Home', path: '/dashboard', icon: <FiHome /> },
  { name: 'Products', path: '/user/products', icon: <FiShoppingBag /> },
  { name: 'Orders', path: '/user/orders', icon: <FiPackage /> },
  { name: 'Favourites', path: '/user/favourites', icon: <FiHeart /> },
  { name: 'Profile', path: '/user/profile', icon: <FiUser /> },
  { name: 'Cart', path: '/cart', icon: <FiShoppingCart /> },
];

const UserDashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop Top Navbar */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 items-center px-8 relative">
        <div className="absolute left-8 flex items-center gap-2">
          <img src="/gadgetspot-logo.png" alt="GadgetSpot" className="h-12 w-12 object-contain bg-transparent" />
          <span className="text-lg font-bold bg-sky-500 bg-clip-text text-transparent">
            <span className='text-slate-800'>Gadget</span>Spot
          </span>
        </div>

        <nav className="mx-auto flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-sky-100 text-sky-600 shadow-lg shadow-sky-100'
                  : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'}
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/gadgetspot-logo.png" alt="GadgetSpot" className="h-10 w-10 object-contain bg-transparent" />
          <span className="text-lg font-bold bg-sky-500 bg-clip-text text-transparent">
            <span className='text-slate-800'>Gadget</span> Spot
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>


      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-100'
                    : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Icon Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-16
                ${isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <span className="text-xl">{item.icon}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:pt-16 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
};

export default UserDashboardLayout;
