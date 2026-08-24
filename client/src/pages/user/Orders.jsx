import { useEffect, useState } from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import UserDashboardLayout from '../../components/user/UserDashboardLayout';
import api from '../../lib/apiConfig';
import Loader from '../../components/Loader';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders/my-orders');
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const totalSpent = orders.reduce((total, order) => total + Number(order.amountPaid || order.total || 0), 0);
    const pendingCount = orders.filter((order) => order.status === 'pending').length;
    const deliveredCount = orders.filter((order) => order.status === 'delivered').length;

    return (
        <UserDashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
                <div className="space-y-3 mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
                    <p className="text-sm md:text-base font-medium text-slate-400">Review the status of your recent purchases and shipping details.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard label="Total Orders" value={orders.length} icon={<FiPackage />} />
                    <MetricCard label="Pending" value={pendingCount} icon={<FiClock />} />
                    <MetricCard label="Total Spent" value={`₦${totalSpent.toLocaleString()}`} icon={<FiCheckCircle />} />
                </div>

                <div className="space-y-4 mt-8">
                    <div className="grid gap-4 md:hidden">
                        {loading ? (
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-center text-slate-400 shadow-sm">
                                <Loader text="Loading orders..." size="sm" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center text-slate-400 shadow-sm">
                                You have no orders yet.
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
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
                            ))
                        )}
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10">
                                                <div className="flex items-center justify-center">
                                                    <Loader text="Loading orders..." size="sm" />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                                                You have no orders yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </UserDashboardLayout>
    );
};

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

export default Orders;
