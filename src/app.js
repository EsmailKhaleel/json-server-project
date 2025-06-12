const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const stripeRoutes = require('./routes/stripe.routes');
const reviewRoutes = require('./routes/review.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', stripeRoutes);

// Error handling
app.use(errorHandler);

module.exports = app; 