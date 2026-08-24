const express = require('express');
const router = express.Router();
const protect = require('../middleWares/authMiddleware');
const { addFavourites, removeFavourites, getFavourites, mergeFavourites } = require('../controller/favouriteController');

router.get('/', protect, getFavourites);
router.post('/add/:productId', protect, addFavourites);
router.post('/merge', protect, mergeFavourites);
router.delete('/remove/:productId', protect, removeFavourites);

module.exports = router;
