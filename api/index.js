const app = require('../src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Products API endpoints:`);
  console.log(`GET    http://localhost:${PORT}/api/products`);
  console.log(`GET    http://localhost:${PORT}/api/products/:id`);
  console.log(`POST   http://localhost:${PORT}/api/products`);
  console.log(`PUT    http://localhost:${PORT}/api/products/:id`);
  console.log(`DELETE http://localhost:${PORT}/api/products/:id`);
  console.log(`GET    http://localhost:${PORT}/api/products/categories`);
  console.log(`Stripe payment endpoint is available at http://localhost:${PORT}/api/create-checkout-session`);
}); 