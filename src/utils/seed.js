const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Review = require('../models/review.model');
const products = require('../../db.json').products;
const reviews = require('../../reviews.json').reviews;
require('dotenv').config();

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Cleared existing reviews');

    // Get all existing products with their original IDs
    const existingProducts = await Product.find({}, 'originalId');
    console.log(`Found ${existingProducts.length} existing products`);
    
    // Create a map using the original product IDs
    const productIdMap = {};
    existingProducts.forEach(product => {
      if (product.originalId) {
        productIdMap[product.originalId] = product._id;
      }
    });

    // Update review productIds to use MongoDB ObjectIds
    const updatedReviews = reviews.map(review => {
      const mongoProductId = productIdMap[review.productId];
      if (!mongoProductId) {
        console.warn(`Warning: No matching product found for productId ${review.productId}`);
        return null;
      }
      return {
        ...review,
        productId: mongoProductId
      };
    }).filter(review => review !== null);

    console.log(`Found ${updatedReviews.length} valid reviews out of ${reviews.length} total`);

    if (updatedReviews.length === 0) {
      // If no valid reviews, we need to reset products to maintain original IDs
      console.log('No valid reviews found. Resetting products to maintain original IDs...');
      
      // Clear and reinsert products with original IDs
      await Product.deleteMany({});
      const productsWithOriginalIds = products.map(product => ({
        ...product,
        originalId: product.id // Store the original ID
      }));
      await Product.insertMany(productsWithOriginalIds);
      console.log('Products reset with original IDs. Please run the seed script again.');
      process.exit(0);
    }

    // Insert reviews
    const insertedReviews = await Review.insertMany(updatedReviews);
    console.log(`Successfully inserted ${insertedReviews.length} reviews`);

    console.log('Reviews seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

seedProducts();