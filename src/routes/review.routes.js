const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/review.controller');

// Get all reviews (with optional productId filter)
router.get('/', getAllReviews);

// Create a new review
router.post('/', createReview);

// Update a review
router.put('/:id', updateReview);

// Delete a review
router.delete('/:id', deleteReview);

module.exports = router;