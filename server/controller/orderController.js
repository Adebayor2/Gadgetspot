const Order = require('../models/orderModel');
const mongoose = require('mongoose');
const { sendOrderStatusUpdateEmail } = require('../services/emailService');

const ORDER_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'];





const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'fullName email');
        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const getOrdersByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address to track your orders',
            });
        }

        const orders = await Order.find({ customerEmail: email.toLowerCase().trim() })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' });
        }
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status' });
        }

        const order = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after', runValidators: true })
            .populate('user', 'fullName email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const recipientEmail = order.customerEmail || order.user?.email;
        const recipientName = order.customerName || order.user?.fullName || 'Customer';
        if (recipientEmail) {
            sendOrderStatusUpdateEmail({
                to: recipientEmail,
                name: recipientName,
                order: {
                    reference: order.reference,
                    status: order.status,
                    items: order.items,
                    subtotal: order.subtotal,
                    deliveryFee: order.deliveryFee,
                    total: order.total,
                    shippingAddress: order.shippingAddress,
                    address: order.address,
                    createdAt: order.createdAt,
                },
            }).catch((emailError) => {
                console.error('Status update email error:', emailError);
            });
        }

        return res.status(200).json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Unable to update order status' });
    }
};

const getRevenue = async (req, res) => {
    try {
        const { period = 'monthly', startDate, endDate, month, year } = req.query;
        const now = new Date();
        let start = startDate ? new Date(startDate) : null;
        let end = endDate ? new Date(endDate) : null;

        if (!start || !end) {
            if (period === 'weekly') {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
                end = now;
            } else {
                if (month && year) {
                    start = new Date(Number(year), Number(month) - 1, 1);
                    end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
                } else {
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    end = now;
                }
            }
        }

        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
        }).sort({ createdAt: -1 });

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
        const totalOrders = orders.length;

        const breakdown = orders.map((order) => ({
            _id: order._id,
            reference: order.reference,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            status: order.status,
            subtotal: Number(order.subtotal || 0),
            deliveryFee: Number(order.deliveryFee || 0),
            total: Number(order.total || 0),
            createdAt: order.createdAt,
        }));

        res.status(200).json({
            success: true,
            period,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            totalOrders,
            totalRevenue,
            breakdown,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const getRevenueHistory = async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
        }).sort({ createdAt: -1 });

        const monthlyMap = new Map();

        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();

            if (!monthlyMap.has(key)) {
                monthlyMap.set(key, {
                    month: monthName,
                    year,
                    key,
                    totalRevenue: 0,
                    totalOrders: 0,
                });
            }

            const entry = monthlyMap.get(key);
            entry.totalRevenue += Number(order.subtotal || 0);
            entry.totalOrders += 1;
        });

        const history = Array.from(monthlyMap.values()).sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            const monthA = Number(a.key.split('-')[1]);
            const monthB = Number(b.key.split('-')[1]);
            return monthB - monthA;
        });

        res.status(200).json({
            success: true,
            history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

module.exports = { getOrders, getMyOrders, getOrdersByEmail, updateOrderStatus, getRevenue, getRevenueHistory };
