const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  old_price: {
    type: Number,
    min: [0, 'Old price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['clothes', 'furniture', 'groceries', 'beauty', 'fragrances', 'digital']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  images: [{
    type: String
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    set: val => Math.round(val * 10) / 10 // Rounds to 1 decimal place
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true, // Include virtual properties when document is converted to JSON
    transform: function(doc, ret) {
      ret.id = ret._id; // Copy _id to id
      delete ret.__v; // Remove version key
      return ret;
    }
  },
});

// // Virtual for id (alternative approach if you don't want to use transform)
// productSchema.virtual('id').get(function() {
//   return this._id;
// });

// Add text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;