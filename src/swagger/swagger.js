const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

// Load the main swagger file with components and info
const mainSwagger = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Load all route-specific YAML files
const routeFiles = [
  'auth.yaml',
  'cart.yaml', 
  'wishlist.yaml',
  'products.yaml',
  'reviews.yaml',
  'orders.yaml',
  'payments.yaml'
];

// Combine all paths from route files
const combinedPaths = {};

routeFiles.forEach(file => {
  try {
    const routeDoc = YAML.load(path.join(__dirname, file));
    if (routeDoc.paths) {
      Object.assign(combinedPaths, routeDoc.paths);
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${file}:`, error.message);
  }
});

// Create the final swagger document
const swaggerDocument = {
  ...mainSwagger,
  paths: combinedPaths
};

module.exports = swaggerDocument;
