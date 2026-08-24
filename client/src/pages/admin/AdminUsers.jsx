import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiSearch, FiUsers, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import api from '../../lib/apiConfig';
import Loader from '../../components/Loader';

const roleBadge = (role) => {
  const isAdmin = role === 'admin';
  return (
    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${isAdmin ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
      {role}
    </span>
  );
};

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.toLowerCase().includes(q)
    );
  });

  const admins = users.filter((u) => u.role === 'admin').length;
  const customers = users.length - admins;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">User Management</h1>
          <p className="text-slate-400 font-medium mt-1">View and manage all registered customers and admins.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50/50 rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-500 flex items-center justify-center">
              <FiUsers size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-slate-800">{users.length}</p>
            </div>
          </div>
          <div className="bg-amber-50/50 rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <FiShield size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Admins</p>
              <p className="text-2xl font-bold text-slate-800">{admins}</p>
            </div>
          </div>
          <div className="bg-amber-50/50 rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <FiUsers size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Customers</p>
              <p className="text-2xl font-bold text-slate-800">{customers}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/50 focus-within:bg-white focus-within:border-amber-300 transition-all group">
            <FiSearch className="text-slate-400 group-focus-within:text-amber-500" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-amber-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider">User</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10">
                      <div className="flex items-center justify-center">
                        <Loader text="Loading users..." size="sm" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">No users found.</td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user._id} className="group hover:bg-amber-50/10 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{user.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                              <FiMail size={11} /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                          <FiPhone size={13} className="text-slate-400" /> {user.phone || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{roleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
