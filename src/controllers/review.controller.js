const { readReviewsDB, writeReviewsDB } = require('../utils/reviews.utils');
const { readDB } = require('../utils/db.utils');

const getAllReviews = (req, res, next) => {
  try {
    const { productId } = req.query;
    const db = readReviewsDB();
    
    let reviews = [...db.reviews];

    if (productId) {
      reviews = reviews.filter(review => review.productId === productId);
    }

    // Sort reviews by date (newest first)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = (req, res, next) => {
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

    // Check if product exists
    const productsDB = readDB();
    const product = productsDB.products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const db = readReviewsDB();
    const newReview = {
      id: Math.random().toString(36).substring(2, 9),
      productId,
      rating,
      comment: comment || '',
      userName,
      createdAt: new Date().toISOString()
    };

    db.reviews.push(newReview);
    writeReviewsDB(db);

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

const updateReview = (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const db = readReviewsDB();
    const reviewIndex = db.reviews.findIndex(r => r.id === id);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updatedReview = {
      ...db.reviews[reviewIndex],
      ...(rating && { rating }),
      ...(comment && { comment }),
      updatedAt: new Date().toISOString()
    };

    db.reviews[reviewIndex] = updatedReview;
    writeReviewsDB(db);

    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
};

const deleteReview = (req, res, next) => {
  try {
    const { id } = req.params;
    const db = readReviewsDB();
    const reviewIndex = db.reviews.findIndex(r => r.id === id);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    db.reviews.splice(reviewIndex, 1);
    writeReviewsDB(db);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getProductAverageRating = (req, res, next) => {
  try {
    const { productId } = req.params;
    const db = readReviewsDB();
    
    const productReviews = db.reviews.filter(review => review.productId === productId);
    
    if (productReviews.length === 0) {
      return res.json({ 
        averageRating: 0,
        totalReviews: 0
      });
    }

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;

    res.json({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: productReviews.length
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