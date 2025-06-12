const { readDB, writeDB } = require('../utils/db.utils');

const getAllProducts = (req, res, next) => {
  try {
    const db = readDB();
    const { category, _sort, _order, q, page, limit, minPrice, maxPrice } = req.query;
    
    let products = [...db.products];

    // Handle search query
    if (q) {
      const searchTerms = q.toLowerCase().trim().split(/\s+/);
      products = products.filter(product => {
        const productName = product.name.toLowerCase();
        const productDescription = product.description.toLowerCase();
        
        return searchTerms.every(term => 
          productName.includes(term) || 
          productDescription.includes(term)
        );
      });
    }

    // Handle category filter
    if (category) {
      products = products.filter(product => product.category === category);
    }

    // Handle price range filter
    if (minPrice) {
      const minPriceNum = parseFloat(minPrice);
      products = products.filter(product => product.price >= minPriceNum);
    }
    
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      products = products.filter(product => product.price <= maxPriceNum);
    }

    // Handle sorting
    if (_sort) {
      products.sort((a, b) => {
        if (_order === 'desc') {
          return b[_sort] - a[_sort];
        }
        return a[_sort] - b[_sort];
      });
    }

    // Handle pagination
    if (page && limit) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const startIndex = (pageNumber - 1) * limitNumber;
      const endIndex = pageNumber * limitNumber;
      
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      return res.json({
        products: paginatedProducts,
        total: products.length,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(products.length / limitNumber)
      });
    }

    res.json({ 
      products, 
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = (req, res, next) => {
  try {
    const db = readDB();
    const product = db.products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = (req, res, next) => {
  try {
    const db = readDB();
    const newProduct = {
      ...req.body,
      id: Math.random().toString(36).substring(2, 9)
    };

    db.products.push(newProduct);
    writeDB(db);

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = (req, res, next) => {
  try {
    const db = readDB();
    const index = db.products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      id: req.params.id
    };

    writeDB(db);
    res.json(db.products[index]);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = (req, res, next) => {
  try {
    const db = readDB();
    const index = db.products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products.splice(index, 1);
    writeDB(db);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getAllCategories = (req, res, next) => {
  try {
    const db = readDB();
    const categories = [...new Set(db.products.map(product => product.category))];
    res.json({ categories });
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
  getAllCategories
}; 