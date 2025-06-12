const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/stripe.controller');

router.post('/create-checkout-session', createCheckoutSession);

module.exports = router; 