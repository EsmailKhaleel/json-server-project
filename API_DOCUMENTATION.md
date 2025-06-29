# eCommerce API Documentation

## Overview

This is a comprehensive REST API for an eCommerce application built with Node.js, Express, and MongoDB. The API provides endpoints for user authentication, product management, shopping cart, wishlist, orders, reviews, and payment processing.

## API Documentation

### Swagger UI
The complete API documentation is available through Swagger UI at:
```
http://localhost:3000/api/docs
```

### Features Documented

#### Authentication & User Management
- User registration and login
- JWT-based authentication
- User profile management
- Password updates
- Profile image upload

#### Shopping Cart
- Add/remove products from cart
- View cart contents
- Clear entire cart
- Quantity management

#### Wishlist
- Add/remove products from wishlist
- View wishlist contents
- Clear entire wishlist

#### Product Management
- CRUD operations for products
- Product categories
- Search and filtering
- Pagination support
- Image management

#### Reviews & Ratings
- Create, update, and delete reviews
- Product rating system
- Review filtering by product

#### Order Management
- View user orders
- Order status tracking
- Order history
- Admin order status updates

#### Payment Processing
- Stripe integration
- Checkout session creation
- Webhook handling

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-production-domain.com`

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the API documentation**:
   Open your browser and navigate to `http://localhost:3000/api/docs`

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/upload-image` - Upload profile image

### Cart
- `GET /api/auth/cart` - Get user's cart
- `POST /api/auth/cart` - Add product to cart
- `DELETE /api/auth/cart/:productId` - Remove product from cart
- `DELETE /api/auth/cart` - Clear cart

### Wishlist
- `GET /api/auth/wishlist` - Get user's wishlist
- `POST /api/auth/wishlist` - Toggle product in wishlist
- `DELETE /api/auth/wishlist` - Clear wishlist

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/categories` - Get all categories

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/latest` - Get latest order
- `GET /api/orders/:orderId` - Get order by ID
- `PATCH /api/orders/:orderId/status` - Update order status (Admin)

### Payments
- `POST /api/stripe/create-checkout-session` - Create checkout session
- `POST /api/webhook` - Stripe webhook handler

## Testing the API

You can test the API endpoints using:

1. **Swagger UI**: Interactive documentation at `/api/docs`
2. **Postman**: Import the collection from the Swagger documentation
3. **cURL**: Use the examples provided in the Swagger documentation

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication failures
- Database errors
- File upload errors
- Payment processing errors

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse.

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Secure headers

