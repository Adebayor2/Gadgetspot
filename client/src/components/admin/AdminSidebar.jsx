import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/useStore';
import logoutUser from '../../lib/logOut';

import {
  FiHome,
  FiBox,
  FiTag,
  FiUsers,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiShoppingBag,
  FiDollarSign
} from 'react-icons/fi';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser({ logout, navigate });
  };



  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiHome /> },
    { name: 'Revenue', path: '/admin/revenue', icon: <FiDollarSign /> },
    { name: 'Products', path: '/admin/products', icon: <FiBox /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingBag /> },
    { name: 'Categories', path: '/admin/categories', icon: <FiTag /> },
    { name: 'Customers', path: '/admin/users', icon: <FiUsers /> },
    { name: 'Profile', path: '/admin/profile', icon: <FiUser /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-amber-50/70 backdrop-blur-sm transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/gadgetspot-logo.png" alt="GadgetSpot" className="h-8 w-8 object-contain bg-transparent" />
              <span className="text-xl font-semibold text-sky-500 bg-clip-text ">
                Gadget <span className='text-slate-800'>spot</span>
              </span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
              <FiX size={20} />
            </button>
          </div>

          <div className="px-4 mb-4">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-600 px-4 mb-2">
             <span className='text-sky-500'>Admin</span> Management
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin/dashboard'}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-amber-100/40 text-sky-500'
                    : 'text-slate-500 hover:bg-amber-50 hover:text-amber-500'}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-slate-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-xl font-medium transition-all duration-200 group"
            >
              <FiLogOut className="text-lg transition-transform group-hover:-translate-x-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

