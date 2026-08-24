import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { FiMenu, FiBell, FiSearch, FiUser } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen  flex">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30  backdrop-blur-md border-b border-amber-100 px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 lg:hidden text-slate-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <FiMenu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/50 group focus-within:bg-white focus-within:border-amber-400 transition-all duration-300">
              <FiSearch className="text-amber-400 group-focus-within:text-amber-500" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none outline-none text-sm text-slate-700 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <button className="relative p-2.5 text-slate-500 hover:bg-amber-50 rounded-xl transition-all duration-200 group">
              <FiBell size={20} className="group-hover:rotate-12" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-10 w-px bg-amber-100 mx-1"></div>

            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-amber-50 transition-all duration-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">Admin User</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-md shadow-amber-100">
                <FiUser size={20} />
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
