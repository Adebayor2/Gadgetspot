const LEGACY_PAID_ORDER_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered', 'cancelled']);

export const getPaymentStatus = (order) => {
    if (order.paymentStatus) return order.paymentStatus;
    if (order.status === 'failed') return 'failed';
    return LEGACY_PAID_ORDER_STATUSES.has(order.status) ? 'paid' : 'pending';
};

export const getOrderStatus = (order) => (order.status === 'paid' ? 'pending' : order.status || 'pending');

export const getPaymentStatusClasses = (status) => {
    if (status === 'paid') return 'bg-emerald-50 text-emerald-600';
    if (status === 'failed') return 'bg-rose-50 text-rose-600';
    return 'bg-amber-50 text-amber-600';
};
