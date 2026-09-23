const express = require('express')
const router = express.Router()
const { optionalProtect } = require('../middleWares/authMiddleware')
const { initializePayment, verifyPayment, verifyGuestPayment, paystackWebhook } = require('../controller/paymentController')

router.post('/webhook', paystackWebhook)
router.post('/initialize', optionalProtect, initializePayment)
router.get('/verify/:reference', verifyPayment)
router.get('/guest/verify/:reference', verifyGuestPayment)

module.exports = router
