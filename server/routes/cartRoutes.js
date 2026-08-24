const express = require('express');
const router = express.Router();
const protect = require('../middleWares/authMiddleware');
const { addToCart, removeFromCart, updateCartQuantity, getCart, clearCart } = require('../controller/cartController');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/remove/:productId', protect, removeFromCart);
router.put('/update/:productId', protect, updateCartQuantity);
router.delete('/clear', protect, clearCart);

module.exports = router;