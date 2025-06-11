const express = require("express");
const cors = require("cors");
const fs = require('fs');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create the Express server
const server = express();

// Enable CORS and JSON parsing
server.use(cors());
server.use(express.json());

// Helper function to read the database file
const readDB = () => {
  const data = fs.readFileSync('../db.json', 'utf8');
  return JSON.parse(data);
};

// Helper function to write to the database file
const writeDB = (data) => {
  fs.writeFileSync('../db.json', JSON.stringify(data, null, 2));
};

// Products Routes
server.get('/products', (req, res) => {
  const db = readDB();
  const { category, _sort, _order, q } = req.query;
  
  
  let products = [...db.products];

  console.log("products:", products);
  // Handle search query
  if (q) {
    const searchTerm = q.toLowerCase();
    products = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  // Handle category filter
  if (category) {
    products = products.filter(product => product.category === category);
  }

  // Handle sorting
  if (_sort) {
    products.sort((a, b) => {
      if (_order === 'desc') {
        return b[_sort] - a[_sort];
      }
      return a[_sort] - b[_sort];
    });
  }

  res.json(products);
});

// Get single product
server.get('/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Create product
server.post('/products', (req, res) => {
  const db = readDB();
  const newProduct = {
    ...req.body,
    id: Math.random().toString(36).substring(2, 9)
  };
  
  db.products.push(newProduct);
  writeDB(db);
  
  res.status(201).json(newProduct);
});

// Update product
server.put('/products/:id', (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id: req.params.id // Ensure ID doesn't change
  };
  
  writeDB(db);
  res.json(db.products[index]);
});

// Delete product
server.delete('/products/:id', (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  db.products.splice(index, 1);
  writeDB(db);
  
  res.status(204).send();
});

// Stripe payment endpoint
server.post('/create-checkout-session', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Products API endpoints:`);
  console.log(`GET    http://localhost:${PORT}/products`);
  console.log(`GET    http://localhost:${PORT}/products/:id`);
  console.log(`POST   http://localhost:${PORT}/products`);
  console.log(`PUT    http://localhost:${PORT}/products/:id`);
  console.log(`DELETE http://localhost:${PORT}/products/:id`);
  console.log(`Stripe payment endpoint is available at http://localhost:${PORT}/create-checkout-session`);
});
