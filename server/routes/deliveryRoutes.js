const express = require('express');
const protect = require('../middleWares/authMiddleware');
const adminOnly = require('../middleWares/roleMiddleware');
const {
  calculateDeliveryFee,
  getAdminDeliverySettings,
  getDeliveryLocations,
  updateAdminDeliverySettings,
} = require('../controller/deliveryController');

const router = express.Router();
router.get('/delivery-fee', calculateDeliveryFee);
router.get('/delivery-locations', getDeliveryLocations);
router.get('/admin/delivery-settings', protect, adminOnly, getAdminDeliverySettings);
router.put('/admin/delivery-settings', protect, adminOnly, updateAdminDeliverySettings);

module.exports = router;
