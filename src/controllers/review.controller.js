const Review = require('../models/review.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

const getAllReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    
    const query = {};
    if (productId) {
      // First try to find product by originalId
      const product = await Product.findOne({ originalId: productId });
      if (product) {
        query.productId = product._id;
      } else {
        // If not found by originalId, try MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(productId)) {
          query.productId = productId;
        } else {
          return res.status(404).json({ error: 'Product not found' });
        }
      }
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate('productId', 'name originalId'); // Populate product details

    res.json({ 
      reviews: reviews.map(review => ({
        ...review.toObject(),
        productId: review.productId.originalId, // Return the original product ID
        productName: review.productId.name
      }))
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, userName } = req.body;

    // Validate required fields
    if (!productId || !rating || !userName) {
      return res.status(400).json({ error: 'Product ID, rating, and user name are required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Find product by originalId first, then by MongoDB ObjectId
    let product = await Product.findOne({ originalId: productId });
    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newReview = new Review({
      productId: product._id,
      rating,
      comment: comment || '',
      userName,
      id: new mongoose.Types.ObjectId().toString() // Generate a unique ID for the review
    });

    const savedReview = await newReview.save();
    
    // Populate product details in the response
    await savedReview.populate('productId', 'name originalId');
    
    res.status(201).json({
      ...savedReview.toObject(),
      productId: savedReview.productId.originalId,
      productName: savedReview.productId.name
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await Review.findOneAndUpdate(
      { id }, // Use the string ID for finding the review
      { rating, comment },
      { new: true, runValidators: true }
    ).populate('productId', 'name originalId');

    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      ...updatedReview.toObject(),
      productId: updatedReview.productId.originalId,
      productName: updatedReview.productId.name
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findOneAndDelete({ id }); // Use the string ID

    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getProductAverageRating = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Find product by originalId first, then by MongoDB ObjectId
    let product = await Product.findOne({ originalId: productId });
    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = await Review.aggregate([
      { $match: { productId: product._id } },
      { 
        $group: { 
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          numberOfReviews: { $sum: 1 }
        } 
      }
    ]);

    const rating = result[0] || { averageRating: 0, numberOfReviews: 0 };

    res.json({
      productId: product.originalId,
      averageRating: Math.round(rating.averageRating * 10) / 10,
      numberOfReviews: rating.numberOfReviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getProductAverageRating
};