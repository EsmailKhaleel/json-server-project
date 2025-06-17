const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getWishlist,
  toggleWishlist,
  clearWishlist
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist', toggleWishlist);
router.delete('/wishlist', clearWishlist);

module.exports = router;
