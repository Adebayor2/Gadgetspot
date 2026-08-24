const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { getDeliveryFee } = require('../data/deliveryFees');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const paystackSecretKey = () => process.env.PAYSTACK_SECRET_KEY ;
const paystackHeaders = () => ({ Authorization: `Bearer ${paystackSecretKey()}` });

const validAddress = (address = {}) => (
  address && typeof address === 'object' &&
  typeof address.line1 === 'string' && address.line1.trim().length >= 5 &&
  typeof address.state === 'string' && address.state.trim() &&
  typeof address.lga === 'string' && address.lga.trim()
);

const buildOrderItems = async (items) => {
  if (!Array.isArray(items) || !items.length) throw new Error('At least one cart item is required');
  if (items.some((item) => !mongoose.Types.ObjectId.isValid(item.product) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new Error('Each cart item must have a valid product and a positive whole-number quantity');
  }

  const products = await Product.find({ _id: { $in: items.map((item) => item.product) } }).lean();
  if (products.length !== new Set(items.map((item) => String(item.product))).size) throw new Error('One or more products no longer exist');

  const byId = new Map(products.map((product) => [String(product._id), product]));
  return items.map((item) => {
    const product = byId.get(String(item.product));
    return {
      product: product._id,
      name: product.title,
      image: product.images?.[0]?.url || '',
      price: Number(product.discountPrice) > 0 ? Number(product.discountPrice) : Number(product.price),
      quantity: item.quantity,
      color: typeof item.color === 'string' ? item.color.trim() : '',
    };
  });
};

const createPaidOrder = async (transaction) => {
  const metadata = transaction.metadata || {};
  const items = metadata.items;
  const address = metadata.address;
  const deliveryFee = Number(metadata.deliveryFee);
  const subtotal = Number(metadata.subtotal);

  if (!validAddress(address) || !Array.isArray(items) || !Number.isFinite(deliveryFee) || !Number.isFinite(subtotal)) {
    throw new Error('Payment metadata is incomplete');
  }

  const expectedAmount = Math.round((subtotal + deliveryFee) * 100);
  if (transaction.amount !== expectedAmount) throw new Error('Payment amount does not match the order total');

  // The unique reference makes callback and webhook processing idempotent.
  const existingOrder = await Order.findOne({ reference: transaction.reference });
  if (!existingOrder) {
    const order = await Order.findOneAndUpdate(
      { reference: transaction.reference },
      {
        $setOnInsert: {
          user: metadata.userId || null,
          items,
          deliveryFee,
          address,
          amountPaid: transaction.amount / 100,
          reference: transaction.reference,
          status: 'paid',
          customerName: metadata.customerName,
          customerEmail: metadata.customerEmail,
          customerPhone: metadata.customerPhone,
          shippingAddress: address.line1,
          subtotal,
          shipping: deliveryFee,
          total: transaction.amount / 100,
        },
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    if (order && order.customerEmail && order.customerName) {
      Promise.resolve()
        .then(() => sendOrderConfirmationEmail({
          to: order.customerEmail,
          name: order.customerName,
          order: order.toObject ? order.toObject() : order,
        }))
        .catch((err) => console.error('Order confirmation email error:', err));
    }

    await deductStock(items);

    return order;
  }

  if (existingOrder && existingOrder.customerEmail && existingOrder.customerName) {
    Promise.resolve()
      .then(() => sendOrderConfirmationEmail({
        to: existingOrder.customerEmail,
        name: existingOrder.customerName,
        order: existingOrder.toObject ? existingOrder.toObject() : existingOrder,
      }))
      .catch((err) => console.error('Order confirmation email error:', err));
  }

  return existingOrder;
}

const deductStock = async (items) => {
  if (!Array.isArray(items) || !items.length) return;
  const bulkOps = items
    .filter((item) => item && item.product && Number.isInteger(item.quantity) && item.quantity > 0)
    .map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity, sold: item.quantity } },
      },
    }));

  if (!bulkOps.length) return;

  try {
    await Product.bulkWrite(bulkOps);
  } catch (error) {
    console.error('Stock deduction failed:', error);
  }
};

const verifyReference = async (reference) => {
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: paystackHeaders() });
  if (!response.data?.status || response.data.data?.status !== 'success') throw new Error('Payment verification failed');
  return response.data.data;
};

const initializePayment = async (req, res, next) => {
  try {
    const { email, items, address, customerName, customerPhone } = req.body;
    const userId = req.user?.id || req.user?._id;
    if (!/^\S+@\S+\.\S+$/.test(email || '') || !validAddress(address) || !customerName?.trim() || !customerPhone?.trim()) {
      return res.status(400).json({ success: false, message: 'Provide valid contact, address, state and LGA details' });
    }
    if (!paystackSecretKey()) return res.status(500).json({ success: false, message: 'Paystack is not configured.' });

    const orderItems = await buildOrderItems(items);
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = getDeliveryFee(address.state, address.lga);
    const amount = Math.round((subtotal + deliveryFee) * 100);

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email.trim().toLowerCase(),
      amount,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      metadata: { ...(userId && { userId: String(userId) }), items: orderItems, deliveryFee, subtotal, address, customerName: customerName.trim(), customerEmail: email.trim().toLowerCase(), customerPhone: customerPhone.trim() },
    }, { headers: { ...paystackHeaders(), 'Content-Type': 'application/json' } });

    return res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    if (error.message?.includes('cart item') || error.message?.includes('products')) return res.status(400).json({ success: false, message: error.message });
    if (error.response?.data?.message) return res.status(502).json({ success: false, message: error.response.data.message });
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;
    if (!reference || reference.length > 200) return res.status(400).json({ success: false, message: 'Invalid payment reference' });
    const transaction = await verifyReference(reference);
    const userId = String(req.user?.id || req.user?._id || '');
    if (String(transaction.metadata?.userId) !== userId) return res.status(403).json({ success: false, message: 'This payment belongs to another user' });
    const order = await createPaidOrder(transaction);
    return res.status(200).json({ success: true, message: 'Payment verified', order });
  } catch (error) {
    if (error.message === 'Payment verification failed' || error.message?.includes('metadata') || error.message?.includes('amount')) return res.status(400).json({ success: false, message: error.message });
    if (error.response?.data?.message) return res.status(502).json({ success: false, message: error.response.data.message });
    return next(error);
  }
};

const verifyGuestPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;
    if (!reference || reference.length > 200) return res.status(400).json({ success: false, message: 'Invalid payment reference' });
    const transaction = await verifyReference(reference);
    if (transaction.metadata?.userId) return res.status(403).json({ success: false, message: 'Use the signed-in verification route for this payment' });
    const order = await createPaidOrder(transaction);
    return res.status(200).json({ success: true, message: 'Payment verified', order });
  } catch (error) {
    if (error.message === 'Payment verification failed' || error.message?.includes('metadata') || error.message?.includes('amount')) return res.status(400).json({ success: false, message: error.message });
    if (error.response?.data?.message) return res.status(502).json({ success: false, message: error.response.data.message });
    return next(error);
  }
};

const paystackWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const secretKey = paystackSecretKey();
    if (!secretKey) return res.status(500).json({ success: false, message: 'Paystack is not configured' });
    const expected = crypto.createHmac('sha512', secretKey).update(req.body).digest('hex');
    // Verify the raw payload before accepting a webhook event.
    if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ success: false, message: 'Invalid Paystack signature' });
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'charge.success' && event.data?.reference) {
      const transaction = await verifyReference(event.data.reference);
      await createPaidOrder(transaction);
    }
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
};

module.exports = { initializePayment, verifyPayment, verifyGuestPayment, paystackWebhook };
