const Product = require('../models/product.model');

const getAllProducts = async (req, res, next) => {
  try {
    const { category, _sort, _order, q, page, limit, minPrice, maxPrice, rating } = req.query;
    
    // Build query with lean() for better performance
    const query = {};
    
    // Handle search query
    if (q) {
      query.$text = { $search: q };
    }

    // Handle category filter
    if (category) {
      query.category = category;
    }

    // Handle price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort options
    const sortOptions = {};
    if (_sort) {
      sortOptions[_sort] = _order === 'desc' ? -1 : 1;
    }

    // Handle rating filter
    if (rating) {
      // the rating filter is up to the rating value
      query.averageRating = { $lte: parseFloat(rating) };
    }

    // Handle pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Set timeout for the query
    const queryTimeout = 5000; // 5 seconds

    // Execute query with pagination and timeout
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .maxTimeMS(queryTimeout), // Add timeout
      Product.countDocuments(query)
        .maxTimeMS(queryTimeout) // Add timeout
    ]);

    res.json({
      products,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    
    res.status(201).json(savedProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};


// Get all categories with their products
const getProductsGroupedByCategory = async (req, res, next) => {
  try {
    // Get distinct categories
    const categories = await Product.distinct('category');

    // Fetch products for each category in parallel
    const productsByCategory = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({ category }).lean();
        return { category, products };
      })
    );

    res.status(200).json({ categories: productsByCategory });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getProductsGroupedByCategory
}; 