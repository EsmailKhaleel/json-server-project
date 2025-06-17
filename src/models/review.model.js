const mongoose = require('mongoose');
const Product = require('./product.model');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from the same user for the same product
reviewSchema.index({ productId: 1, userName: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0].averageRating,
      numReviews: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.productId);
});

// Call calculateAverageRating before remove
reviewSchema.pre('remove', function() {
  this.constructor.calculateAverageRating(this.productId);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;