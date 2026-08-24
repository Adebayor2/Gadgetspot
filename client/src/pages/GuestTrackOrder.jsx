import { useState } from 'react';
import { FiPackage, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../lib/apiConfig';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';

const GuestTrackOrder = () => {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data } = await api.get(`/orders/track?email=${encodeURIComponent(trimmed)}`);

      if (data.success && data.orders && data.orders.length > 0) {
        setOrders(data.orders);
        toast.success(`Found ${data.orders.length} order(s)`);
      } else {
        setOrders([]);
        toast.error('No orders found for this email');
      }
    } catch (error) {
      setOrders([]);
      const message = error.response?.data?.message || 'Failed to track orders';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = orders.reduce((total, order) => total + Number(order.total || 0), 0);

  return (
    <div className="min-h-screen w-full">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-400">
            Enter the email used during checkout to view your order status and details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <label htmlFor="track-email" className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="track-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                onBlur={validateEmail}
                placeholder="you@example.com"
                className={`flex-1 px-4 py-3 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/5'}`}
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-sky-100 active:scale-95 disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    <FiSearch size={18} />
                    Track Order
                  </>
                )}
              </button>
            </div>
            {emailError && (
              <p className="mt-2 text-red-500 text-xs font-semibold">{emailError}</p>
            )}
          </div>
        </form>

        {searched && loading && (
          <div className="mt-10 flex items-center justify-center py-20">
            <Loader text="Searching for your orders..." size="md" />
          </div>
        )}

        {searched && !loading && orders.length === 0 && (
          <div className="mt-10 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FiPackage size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              We couldnt find any orders associated with this email. Please double-check your email and try again.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              <MetricCard label="Total Orders" value={orders.length} icon={<FiPackage />} />
              <MetricCard
                label="Pending"
                value={orders.filter((o) => o.status === 'pending').length}
                icon={<FiSearch />}
              />
              <MetricCard
                label="Total Spent"
                value={`₦${totalSpent.toLocaleString()}`}
                icon={<FiCheckCircle />}
              />
            </div>

            <div className="space-y-4 mt-8">
              <div className="grid gap-4 md:hidden">
                {orders.map((order) => (
                  <OrderCardMobile key={order._id} order={order} />
                ))}
              </div>

              <div className="hidden md:block bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50/70">
                      <tr>
                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order</th>
                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Items</th>
                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total</th>
                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-slate-800">#{order._id.slice(-6)}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 space-y-1">
                            {order.items?.slice(0, 2).map((item) => (
                              <div key={`${order._id}-${item.product}`} className="flex flex-wrap gap-2 items-center">
                                <span>{item.name}</span>
                                <span className="text-xs text-slate-400">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="text-xs text-slate-400">+{order.items.length - 2} more</span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-800">₦{Number(order.total || 0).toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusClasses(order.status)}`}>
                              {order.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

const OrderCardMobile = ({ order }) => (
  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700">Order #{order._id.slice(-6)}</p>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusClasses(order.status)}`}>
          {order.status || 'pending'}
        </span>
      </div>
      <div className="text-sm text-slate-500 space-y-2">
        <p>
          <span className="font-semibold text-slate-700">Items:</span>{' '}
          {order.items?.slice(0, 2).map((item, idx) => (
            <span key={`${order._id}-${item.product}-${idx}`}>
              {item.name} x{item.quantity}{idx < Math.min(order.items.length, 2) - 1 ? ', ' : ''}
            </span>
          ))}
          {order.items?.length > 2 && ` +${order.items.length - 2} more`}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Total:</span> ₦{Number(order.total || 0).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
);

const MetricCard = ({ label, value, icon }) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center text-xl">
        {icon}
      </div>
    </div>
  </div>
);

const getStatusClasses = (status) => {
  switch (status) {
    case 'processing':
      return 'bg-sky-50 text-sky-600';
    case 'shipped':
      return 'bg-indigo-50 text-indigo-600';
    case 'delivered':
      return 'bg-emerald-50 text-emerald-600';
    case 'cancelled':
      return 'bg-rose-50 text-rose-600';
    default:
      return 'bg-amber-50 text-amber-600';
  }
};

export default GuestTrackOrder;
