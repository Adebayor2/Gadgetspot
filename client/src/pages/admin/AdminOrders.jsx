import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/apiConfig';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiRefreshCw, FiEye, FiX as FiClose } from 'react-icons/fi';

const statusStyles = {
    paid: 'bg-amber-50 text-amber-600',
    pending: 'bg-amber-50 text-amber-600',
    processing: 'bg-sky-50 text-sky-600',
    shipped: 'bg-indigo-50 text-indigo-600',
    delivered: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-rose-50 text-rose-600',
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders');
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

    const updateStatus = async (orderId, status) => {
        try {
            setUpdatingId(orderId);
            const { data } = await api.patch(`/orders/${orderId}/status`, { status });
            setOrders((current) => current.map((order) => order._id === orderId ? data.order : order));
            toast.success('Order status updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update order status');
        } finally {
            setUpdatingId('');
        }
    };

    const openOrderDetail = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeOrderDetail = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-sky-500 tracking-tight">Orders <span className='text-slate-900'>Management</span></h1>
                        <p className="text-slate-400 font-medium mt-1">Track customer purchases and delivery status.</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-amber-50"
                    >
                        <FiRefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-500">Total Orders</p>
                            <FiPackage className="text-amber-400" />
                        </div>
                        <p className="mt-4 text-3xl font-black text-slate-900">{orders.length}</p>
                    </div>
                    <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-500">Pending</p>
                            <FiClock className="text-amber-400" />
                        </div>
                        <p className="mt-4 text-3xl font-black text-slate-900">{orders.filter((order) => order.status === 'pending').length}</p>
                    </div>
                    <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-500">Delivered</p>
                            <FiCheckCircle className="text-emerald-500" />
                        </div>
                        <p className="mt-4 text-3xl font-black text-slate-900">{orders.filter((order) => order.status === 'delivered').length}</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-amber-100 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-amber-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Items</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Update</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10">
                                          <div className="flex items-center justify-center">
                                            <Loader text="Loading orders..." size="sm" />
                                          </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-400">No orders found yet.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-800">{order.customerName}</p>
                                                <p className="text-sm text-slate-400">{order.customerEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">
                                                {order.items?.slice(0, 3).map((item) => (
                                                    <div key={`${order._id}-${item.product}`} className="flex items-center gap-2">
                                                        <span>{item.name}</span>
                                                        <span className="text-slate-400">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                                {order.items?.length > 3 ? <span className="text-slate-400">+{order.items.length - 3} more</span> : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">₦{Number(order.total || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusStyles[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {order.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select value={order.status || 'paid'} disabled={updatingId === order._id} onChange={(event) => updateStatus(order._id, event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 disabled:opacity-60">
                                                <option value="paid">Paid</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openOrderDetail(order)}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="View order details"
                                            >
                                                <FiEye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Detail Modal */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeOrderDetail} />
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Order Details</h2>
                                    <p className="text-sm text-slate-400 mt-1">Reference: {selectedOrder.reference || '—'}</p>
                                </div>
                                <button
                                    onClick={closeOrderDetail}
                                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                                >
                                    <FiClose size={24} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                                {/* Customer Info */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Customer Information</h3>
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                        <p className="text-sm text-slate-600"><span className="font-semibold">Name:</span> {selectedOrder.customerName}</p>
                                        <p className="text-sm text-slate-600"><span className="font-semibold">Email:</span> {selectedOrder.customerEmail}</p>
                                        <p className="text-sm text-slate-600"><span className="font-semibold">Phone:</span> {selectedOrder.customerPhone || '—'}</p>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Delivery Address</h3>
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        <p className="text-sm text-slate-600">{selectedOrder.shippingAddress || selectedOrder.address?.line1 || '—'}</p>
                                        <p className="text-sm text-slate-500 mt-1">{selectedOrder.address?.state || ''}{selectedOrder.address?.lga ? ', ' + selectedOrder.address.lga : ''}</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Order Items</h3>
                                    <div className="bg-slate-50 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-100/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Qty</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Price</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 text-sm text-slate-700">
                                                            <p className="font-medium">{item.name}</p>
                                                            {item.color && <p className="text-xs text-slate-400">Color: {item.color}</p>}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">₦{Number(item.price || 0).toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-800 text-right font-semibold">₦{(Number(item.price || 0) * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Order Summary</h3>
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Subtotal</span>
                                            <span>₦{Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Delivery Fee</span>
                                            <span>₦{Number(selectedOrder.deliveryFee || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-200">
                                            <span>Total</span>
                                            <span>₦{Number(selectedOrder.total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Date */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusStyles[selectedOrder.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {selectedOrder.status || 'pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {new Date(selectedOrder.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
