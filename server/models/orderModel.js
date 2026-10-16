const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userInfo",
      default: null,
    },
    customerName: {
      type: String,
      required: true,
    }, 
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required:true,
    },
    shippingAddress: { type: String },
    fulfillmentType: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number },
    shipping: { type: Number },
    total: { type: Number },
    deliveryFee: { type: Number, required: true, min: 0 },
    address: {
      line1: { type: String, required: true },
      state: { type: String, default: "" },
      lga: { type: String, default: "" },
    },
    amountPaid: { type: Number, required: true, min: 0 },
    reference: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
