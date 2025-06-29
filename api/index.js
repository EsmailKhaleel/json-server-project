const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../src/swagger/swagger');
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

// Body parser middleware
app.use(express.json());


// Serve API documentation at root endpoint
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log("Api docs at http://localhost:3000/api/docs");
});

// Export the Express app for serverless use
module.exports = app;