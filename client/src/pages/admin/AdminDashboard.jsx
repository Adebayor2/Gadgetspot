import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { FiBox, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import Loader from '../../components/Loader';
import api from '../../lib/apiConfig';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const { data } = await api.get('/products');
        setAllProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load products', error);
      }

      try {
        const { data } = await api.get('/products', { params: { featured: 'true' } });
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load featured products', error);
      }

      try {
        const { data } = await api.get('/orders');
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to load orders', error);
      }

      try {
        const { data } = await api.get('/users');
        setCustomers(data.users || []);
      } catch (error) {
        console.error('Failed to load customers', error);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const paidOrders = useMemo(() => orders.filter((order) => ['paid', 'processing', 'shipped', 'delivered'].includes(order.status)), [orders]);
  const totalRevenue = useMemo(() => paidOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0), [paidOrders]);

  const stats = [
    { title: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, trend: 12.5, color: 'amber' },
    { title: 'Revenue Orders', value: paidOrders.length.toString(), icon: <FiShoppingBag />, trend: 3.2, color: 'rose' },
    { title: 'Total Products', value: allProducts.length.toString(), icon: <FiBox />, trend: -2.4, color: 'purple' },
    { title: 'Total Customers', value: customers.length.toString(), icon: <FiUsers />, trend: 8.1, color: 'green' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-sky-500 tracking-tight">Dashboard <span className='text-slate-900'>Overview</span></h1>
          <p className="text-slate-400 font-medium mt-1">Welcome back, Admin!</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader text="Loading dashboard..." size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-amber-50 border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
              <p className="text-sm text-slate-400 mt-1">Latest Paystack-confirmed purchases.</p>
            </div>
            <button onClick={() => navigate('/admin/orders')} className="text-amber-500 font-semibold text-sm hover:text-amber-600">Manage Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Reference</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8">
                      <div className="flex items-center justify-center">
                        <Loader text="Loading orders..." size="sm" />
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No orders yet.</td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{order.customerName}</p>
                        <p className="text-sm text-slate-400">{order.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{order.reference || '—'}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">₦{Number(order.amountPaid || order.total || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${order.status === 'paid' || order.status === 'pending' ? 'bg-amber-50 text-amber-600' : order.status === 'processing' ? 'bg-sky-50 text-sky-600' : order.status === 'shipped' ? 'bg-indigo-50 text-indigo-600' : order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-amber-50 border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Featured Products</h2>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-amber-500 font-semibold text-sm hover:text-amber-600 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading products...</td>
                  </tr>
                ) : featuredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No featured products yet.</td>
                  </tr>
                ) : (
                  featuredProducts.slice(0, 5).map((product) => (
                    <tr key={product._id} className="hover:bg-amber-50/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]?.url || product.image} alt={product.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                          <span className="font-bold text-slate-700 text-sm">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">{product.category}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm">₦{Number(product.price || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
                          Featured
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/products/${product._id}`)}
                          className="text-slate-400 hover:text-amber-500 transition-colors font-medium text-sm cursor-pointer"
                        >
                          View
                        </button>
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

export default AdminDashboard;
