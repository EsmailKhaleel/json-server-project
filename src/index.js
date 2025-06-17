const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db.config');
const productRoutes = require('./routes/product.routes');
const stripeRoutes = require('./routes/stripe.routes');
const reviewRoutes = require('./routes/review.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Parse Stripe webhook payload
app.post('/api/webhook', express.raw({ type: 'application/json' }), require('./controllers/stripe.controller').handleWebhook);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/orders', orderRoutes);

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
  console.log(`POST   http://localhost:${PORT}/api/auth/cart           - Add to cart`);
  console.log(`DELETE http://localhost:${PORT}/api/auth/cart/:productId- Remove from cart`);
  console.log(`POST   http://localhost:${PORT}/api/auth/wishlist       - Toggle wishlist`);
  
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
  
  console.log('\nPayment Endpoint:');
  console.log(`POST   http://localhost:${PORT}/api/create-checkout-session - Create payment session`);
});