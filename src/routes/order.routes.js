const express = require('express');
const router = express.Router();
const { getUserOrders, getOrderById, updateOrderStatus, getLatestOrder } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

// Get user's orders
router.get('/', getUserOrders);

// Get latest order for user
router.get('/latest', getLatestOrder);

// Get specific order
router.get('/:orderId', getOrderById);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

module.exports = router;
