const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('../src/config/db.config');
const productRoutes = require('../src/routes/product.routes');
const stripeRoutes = require('../src/routes/stripe.routes');
const reviewRoutes = require('../src/routes/review.routes');
const authRoutes = require('../src/routes/auth.routes');
const orderRoutes = require('../src/routes/order.routes');
const { errorHandler, notFound } = require('../src/middleware/error.middleware');

const app = express();

// Middleware to ensure database connection
const ensureDbConnected = async (req, res, next) => {
  try {
    if (!global.mongoConnected) {
      await connectDB();
      global.mongoConnected = true;
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Database connection failed' 
    });
  }
};

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Important: Parse Stripe webhook payload before any other body parsers
app.post('/api/webhook', express.raw({ type: 'application/json' }), require('../src/controllers/stripe.controller').handleWebhook);

// Body parser middleware - after Stripe webhook
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Welcome page at root endpoint
app.get('/', (req, res) => {
  res.sendFile('../public/index.html', { root: './public' });
});


// Health check endpoint that doesn't require DB connection
app.get('/api/health', (req, res) => {
  res.json({ status: true, message: 'Server is running' });
});

// API routes with DB connection check
app.use('/api/auth', ensureDbConnected, authRoutes);
app.use('/api/products', ensureDbConnected, productRoutes);
app.use('/api/reviews', ensureDbConnected, reviewRoutes);
app.use('/api/stripe', ensureDbConnected, stripeRoutes);
app.use('/api/orders', ensureDbConnected, orderRoutes);

// Handle 404 errors for unmatched routes
app.use(notFound);

// Handle all other errors
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('\nAPI Endpoints:');

  console.log('\nAuthentication Endpoints:');
  console.log(`POST   http://localhost:${PORT}/api/auth/register        - Register user`);
  console.log(`POST   http://localhost:${PORT}/api/auth/login          - Login user`);
  console.log(`GET    http://localhost:${PORT}/api/auth/me             - Get current user`);
  console.log(`PUT    http://localhost:${PORT}/api/auth/updatedetails  - Update user details`);
  console.log(`PUT    http://localhost:${PORT}/api/auth/updatepassword - Update password`);
  console.log(`GET    http://localhost:${PORT}/api/auth/cart           - Get cart`);
  console.log(`POST   http://localhost:${PORT}/api/auth/cart           - Add to cart`);
  console.log(`DELETE http://localhost:${PORT}/api/auth/cart/:productId- Remove from cart`);
  console.log(`DELETE http://localhost:${PORT}/api/auth/cart           - Clear cart`);
  console.log(`GET    http://localhost:${PORT}/api/auth/wishlist       - Get wishlist`);
  console.log(`POST   http://localhost:${PORT}/api/auth/wishlist       - Toggle wishlist`);
  console.log(`DELETE http://localhost:${PORT}/api/auth/wishlist       - Clear wishlist`);

  console.log('\nProduct Endpoints:');
  console.log(`GET    http://localhost:${PORT}/api/products              - Get all products`);
  console.log(`GET    http://localhost:${PORT}/api/products/:id          - Get single product`);
  console.log(`POST   http://localhost:${PORT}/api/products              - Create product`);
  console.log(`PUT    http://localhost:${PORT}/api/products/:id          - Update product`);
  console.log(`DELETE http://localhost:${PORT}/api/products/:id          - Delete product`);
  console.log(`GET    http://localhost:${PORT}/api/products/categories   - Get categories`);

  console.log('\nReview Endpoints:');
  console.log(`GET    http://localhost:${PORT}/api/reviews              - Get all reviews`);
  console.log(`GET    http://localhost:${PORT}/api/reviews?productId=ID - Get product reviews`);
  console.log(`GET    http://localhost:${PORT}/api/reviews/product/:productId/rating - Get product rating`);
  console.log(`POST   http://localhost:${PORT}/api/reviews              - Create review`);
  console.log(`PUT    http://localhost:${PORT}/api/reviews/:id          - Update review`);
  console.log(`DELETE http://localhost:${PORT}/api/reviews/:id          - Delete review`);

  console.log('\nPayment Endpoints:');
  console.log(`POST   http://localhost:${PORT}/api/stripe/create-checkout-session - Create payment session`);
  console.log(`POST   http://localhost:${PORT}/api/webhook               - Stripe webhook endpoint`);
});

// Export the Express app for serverless use
module.exports = app;
