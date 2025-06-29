const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

// Fallback swagger spec in case YAML loading fails
const fallbackSpec = {
  openapi: '3.0.0',
  info: {
    title: 'eCommerce API',
    version: '1.0.0',
    description: 'Backend REST API documentation for eCommerce application.'
  },
  servers: [
    {
      url: 'https://json-server-project-khaki.vercel.app',
      description: 'Production server'
    }
  ],
  paths: {},
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

let swaggerDocument;

try {
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
  swaggerDocument = {
    ...mainSwagger,
    paths: combinedPaths
  };

  console.log(`Swagger loaded successfully with ${Object.keys(combinedPaths).length} paths`);
} catch (error) {
  console.error('Error loading Swagger YAML files:', error.message);
  console.log('Using fallback Swagger spec');
  swaggerDocument = fallbackSpec;
}

module.exports = swaggerDocument;
