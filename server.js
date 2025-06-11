const jsonServer = require("json-server");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const server = express();
const jsonServerRouter = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Enable CORS and JSON parsing
server.use(cors());
server.use(express.json());

// Use JSON Server middleware
server.use(middlewares);

// Stripe configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Mount JSON Server router at root level
server.use(jsonServerRouter);

// Stripe payment endpoint under /api
server.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { products } = req.body;
    console.log('Received line items:', JSON.stringify(products));

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Please provide products' });
    }

    // Validate line items structure
    const lineItems = products.map(product => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name || 'Product',
          images: product.images || [],
          description: product.description,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.amount
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart?canceled=true`,
    });
    console.log("Stripe session created:", session);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`JSON Server is available at http://localhost:${PORT}`);
  console.log(`Stripe payment endpoint is available at http://localhost:${PORT}/api/create-checkout-session`);
});
