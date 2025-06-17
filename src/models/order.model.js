const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'refunded'],
    default: 'unpaid'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
