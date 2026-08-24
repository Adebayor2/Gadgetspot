import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/apiConfig';
import { FiDownload, FiRefreshCw, FiDollarSign, FiShoppingBag, FiTrendingUp, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import Loader from '../../components/Loader';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminRevenue = () => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [history, setHistory] = useState([]);

    const fetchRevenue = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/orders/revenue', { params: { period: 'monthly', month: selectedMonth, year: selectedYear } });
            setRevenueData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/orders/revenue/history');
            setHistory(data.history || []);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    useEffect(() => {
        fetchRevenue();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatCurrency = (value) => `₦${Number(value || 0).toLocaleString()}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const handleHistoryClick = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const handleDownloadPDF = () => {
        if (!revenueData) return;

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) {
            alert('Please allow popups to download the PDF');
            return;
        }

        const periodLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`;
        const generatedOn = new Date().toLocaleString('en-NG');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${periodLabel} Revenue Report</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
                    h1 { font-size: 24px; margin-bottom: 4px; }
                    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
                    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
                    .summary-card { flex: 1; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; }
                    .summary-card h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
                    .summary-card p { font-size: 20px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    th, td { padding: 10px 12px; text-align: left; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
                    th { background: #f1f5f9; font-weight: 600; text-transform: uppercase; font-size: 11px; color: #475569; }
                    tr:last-child td { border-bottom: none; }
                    .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${periodLabel} Revenue Report</h1>
                <p class="subtitle">Generated on ${generatedOn}</p>
                <div class="summary">
                    <div class="summary-card">
                        <h3>Total Revenue (excl. delivery)</h3>
                        <p>${formatCurrency(revenueData.totalRevenue)}</p>
                    </div>
                    <div class="summary-card">
                        <h3>Total Orders</h3>
                        <p>${revenueData.totalOrders}</p>
                    </div>
                    <div class="summary-card">
                        <h3>Period</h3>
                        <p>${formatDate(revenueData.startDate)} - ${formatDate(revenueData.endDate)}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Subtotal</th>
                            <th>Delivery</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${revenueData.breakdown.map((order) => `
                            <tr>
                                <td>${formatDate(order.createdAt)}</td>
                                <td>${order.reference || '—'}</td>
                                <td>${order.customerName}<br/><span style="color:#64748b;font-size:11px;">${order.customerEmail}</span></td>
                                <td style="text-transform: capitalize;">${order.status}</td>
                                <td>${formatCurrency(order.subtotal)}</td>
                                <td>${formatCurrency(order.deliveryFee)}</td>
                                <td>${formatCurrency(order.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p class="footer">GadgetSpot Admin • Revenue Report</p>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    const monthLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Revenue</h1>
                        <p className="text-slate-400 font-medium mt-1">Track your income excluding delivery fees.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
                            <button
                                onClick={() => setSelectedMonth(new Date().getMonth() + 1)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear() ? 'bg-amber-400 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                This Month
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                            >
                                <FiChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-xl font-bold text-slate-800 min-w-[180px] text-center">{monthLabel}</h2>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                            >
                                <FiChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Excludes delivery fee</span>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {error && (
                            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-600 mb-6">
                                {error}
                            </div>
                        )}

                        {revenueData && (
                            <div className="grid gap-4 md:grid-cols-3 mb-8">
                                <div className="rounded-2xl border border-slate-100 bg-amber-50/50 p-5">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(revenueData.totalRevenue)}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-amber-50/50 p-5">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{revenueData.totalOrders}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-amber-50/50 p-5">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(revenueData.totalOrders ? revenueData.totalRevenue / revenueData.totalOrders : 0)}</p>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Reference</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Customer</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Subtotal</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Delivery</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8">
                                                <div className="flex items-center justify-center">
                                                    <Loader text="Loading revenue data..." size="sm" />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !revenueData || revenueData.breakdown.length === 0 ? (
                                        <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No orders found for this month.</td></tr>
                                    ) : (
                                        revenueData.breakdown.map((order) => (
                                            <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                                                <td className="px-4 py-3 text-sm text-slate-500 font-mono">{order.reference || '—'}</td>
                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    <p className="font-semibold">{order.customerName}</p>
                                                    <p className="text-xs text-slate-400">{order.customerEmail}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700 text-right font-medium">{formatCurrency(order.subtotal)}</td>
                                                <td className="px-4 py-3 text-sm text-slate-500 text-right">{formatCurrency(order.deliveryFee)}</td>
                                                <td className="px-4 py-3 text-sm text-slate-900 text-right font-bold">{formatCurrency(order.total)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={!revenueData || revenueData.breakdown.length === 0}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-100 transition hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiDownload className="h-4 w-4" />
                                Download {monthLabel} PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FiClock className="text-slate-400" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Revenue History</h2>
                                <p className="text-sm text-slate-400">Click a month to view detailed report</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Year</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Orders</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400">No revenue history available yet.</td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr
                                            key={item.key}
                                            onClick={() => handleHistoryClick(item.key.split('-')[1], item.year)}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.month}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{item.year}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700 text-right font-medium">{item.totalOrders}</td>
                                            <td className="px-6 py-4 text-sm text-slate-900 text-right font-bold">{formatCurrency(item.totalRevenue)}</td>
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

export default AdminRevenue;
