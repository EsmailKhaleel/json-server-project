const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getProductAverageRating
} = require('../controllers/review.controller');

// Get all reviews (with optional productId filter)
router.get('/', getAllReviews);

// Get average rating for a product
router.get('/product/:productId/rating', getProductAverageRating);

// Create a new review
router.post('/', createReview);

// Update a review
router.put('/:id', updateReview);

// Delete a review
router.delete('/:id', deleteReview);

module.exports = router; 