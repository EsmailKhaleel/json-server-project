const Order = require('../models/order.model');
const { successResponse } = require('../utils/response.utils');

const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const orders = await Order.find({ userId })
      .populate('products.productId', 'name price originalId')
      .sort({ createdAt: -1 });

    return successResponse(res, { orders }, 200);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('products.productId', 'name price originalId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return successResponse(res, { order }, 200);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return successResponse(res, { order }, 200);
  } catch (error) {
    next(error);
  }
};

const getLatestOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      userId: req.user._id 
    }).sort({ createdAt: -1 });
    
    if (!order) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    return successResponse(res, { order }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getLatestOrder
};
