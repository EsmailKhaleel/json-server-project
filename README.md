# MongoDB E-commerce API

A RESTful API for an e-commerce application built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Product management (CRUD operations)
- Product categories
- Product reviews and ratings
- Shopping cart functionality
- Wishlist management
- Order processing
- Stripe payment integration
- Search, filter, and sort functionality
- Pagination

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Stripe account (for payment processing)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Routes
```
POST /api/auth/register
- Register a new user
- Body: { name, email, password }

POST /api/auth/login
- Login user
- Body: { email, password }

GET /api/auth/me
- Get current user profile
- Protected Route
- Headers: Authorization: Bearer {token}

PUT /api/auth/updatedetails
- Update user details
- Protected Route
- Body: { name, email }
- Headers: Authorization: Bearer {token}

PUT /api/auth/updatepassword
- Update password
- Protected Route
- Body: { currentPassword, newPassword }
- Headers: Authorization: Bearer {token}
```

### Cart & Wishlist Routes
```
POST /api/auth/cart
- Add item to cart
- Protected Route
- Body: { productId, quantity }
- Headers: Authorization: Bearer {token}

DELETE /api/auth/cart/:productId
- Remove item from cart
- Protected Route
- Headers: Authorization: Bearer {token}

POST /api/auth/wishlist
- Toggle wishlist item
- Protected Route
- Body: { productId }
- Headers: Authorization: Bearer {token}
```

### Product Routes
```
GET /api/products
- Get all products
- Query Parameters:
  - page: Page number for pagination
  - limit: Number of items per page
  - search: Search term
  - category: Filter by category
  - sort: Sort by field (e.g., price, name)
  - order: Sort order (asc, desc)

GET /api/products/:id
- Get product by ID

POST /api/products
- Create new product
- Protected Route (Admin)
- Body: { name, description, price, category, image }
- Headers: Authorization: Bearer {token}

PUT /api/products/:id
- Update product
- Protected Route (Admin)
- Body: { name, description, price, category, image }
- Headers: Authorization: Bearer {token}

DELETE /api/products/:id
- Delete product
- Protected Route (Admin)
- Headers: Authorization: Bearer {token}
```

### Review Routes
```
GET /api/reviews
- Get all reviews
- Query Parameters:
  - productId: Filter reviews by product

POST /api/reviews
- Create new review
- Protected Route
- Body: { productId, rating, comment }
- Headers: Authorization: Bearer {token}

PUT /api/reviews/:id
- Update review
- Protected Route
- Body: { rating, comment }
- Headers: Authorization: Bearer {token}

DELETE /api/reviews/:id
- Delete review
- Protected Route
- Headers: Authorization: Bearer {token}
```

### Order Routes
```
GET /api/orders
- Get user's orders
- Protected Route
- Query Parameters:
  - userId: Filter orders by user
- Headers: Authorization: Bearer {token}

GET /api/orders/:orderId
- Get specific order
- Protected Route
- Headers: Authorization: Bearer {token}

PATCH /api/orders/:orderId/status
- Update order status
- Protected Route (Admin)
- Body: { status }
- Headers: Authorization: Bearer {token}
```

### Payment Routes
```
POST /api/stripe/create-checkout-session
- Create Stripe checkout session
- Protected Route
- Body: { products: [{ id, amount }], userId }
- Headers: Authorization: Bearer {token}

POST /api/webhook
- Stripe webhook endpoint
- Handles successful checkout events
- Creates orders automatically
```

## Response Format

### Success Response
```json
{
  "status": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": false,
  "error": "Error message"
}
```

## Authentication

Most routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Rate Limiting

API requests are limited to 100 requests per IP address per 15-minute window.

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## License

MIT
- `GET /api/products/categories` - Get all categories

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/product/:productId/rating` - Get product average rating
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Payments
- `POST /api/create-checkout-session` - Create Stripe checkout session

## Query Parameters

### Products
- `category` - Filter by category
- `_sort` - Sort by field (e.g., price)
- `_order` - Sort order (asc/desc)
- `q` - Search query
- `page` - Page number
- `limit` - Items per page
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

### Reviews
- `productId` - Filter reviews by product ID

## Error Handling

The API uses a centralized error handling middleware that handles:
- Validation errors
- Duplicate key errors
- Invalid ID format errors
- General server errors

## Development

The project uses:
- Express.js for the web framework
- MongoDB for the database
- Mongoose for ODM
- Stripe for payment processing
- Morgan for logging
- CORS for cross-origin requests
- Dotenv for environment variables 