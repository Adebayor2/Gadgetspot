const express = require("express");
const router = express.Router();
const protect = require("../middleWares/authMiddleware");
const adminOnly = require("../middleWares/roleMiddleware");
const { getOrders, getMyOrders, getOrdersByEmail, updateOrderStatus, getRevenue, getRevenueHistory } = require("../controller/orderController");

router.get("/", protect, adminOnly, getOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/track", getOrdersByEmail);
router.get("/revenue", protect, adminOnly, getRevenue);
router.get("/revenue/history", protect, adminOnly, getRevenueHistory);
router.patch("/:orderId/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
