const express = require('express');
const router = express.Router();
const { getUserOrders, getOrderById, updateOrderStatus, getLatestOrder } = require('../controllers/order.controller');

// Get user's orders
router.get('/', getUserOrders);

// Get specific order
router.get('/:orderId', getOrderById);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

// Get latest order for user
router.get('/latest', getLatestOrder);

module.exports = router;
