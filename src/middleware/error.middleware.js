const { errorResponse } = require('../utils/response.utils');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return errorResponse(res, messages[0], 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `Duplicate ${field} entered`, 400);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found with id of ${err.value}`, 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Default error
  return errorResponse(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500
  );
};

// Handle 404 - Not Found
const notFound = (req, res) => {
  return errorResponse(
    res,
    `Route not found - ${req.originalUrl}`,
    404
  );
};

module.exports = { errorHandler, notFound };