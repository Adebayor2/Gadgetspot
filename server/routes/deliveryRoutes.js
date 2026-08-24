const express = require('express');
const { calculateDeliveryFee, getDeliveryLocations } = require('../controller/deliveryController');

const router = express.Router();
router.get('/delivery-fee', calculateDeliveryFee);
router.get('/delivery-locations', getDeliveryLocations);

module.exports = router;
