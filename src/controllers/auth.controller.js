const User = require('../models/user.model');
const Product = require('../models/product.model');
const { successResponse, errorResponse } = require('../utils/response.utils');
const cloudinary = require('../config/cloudinary');
const { 
  getGoogleAuthURL, 
  getTokensFromCode, 
  getGoogleUserInfo
} = require('../config/google.config');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
}).single('image');

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    return successResponse(
      res,
      { token, user },
      201
    );
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    return successResponse(
      res,
      { token, user }
    );
  } catch (error) {
    next(error);
  }
};

// Get current logged in user
exports.getMe = async (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Not authenticated', 401);
  }
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

// Update user details
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    return successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    user.password = req.body.newPassword;
    await user.save();

    // Generate new token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    return successResponse(res, { user, token });
  } catch (error) {
    next(error);
  }
};

// Add product to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const user = await User.findById(req.user.id);

    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      // Update quantity if product exists
      user.cart[cartItemIndex].quantity = quantity;
    } else {
      // Add new product to cart
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    // Populate cart items with product details
    await user.populate('cart.product');

    return successResponse(res, {
      "message": "Product added to cart",
      "cart": user.cart
    });
  } catch (error) {
    next(error);
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );
    await user.save();

    await user.populate('cart.product');
    return successResponse(res, {
      message: 'Product removed from cart',
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// Add/Remove product to/from wishlist
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }

    const user = await User.findById(req.user.id);

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
    }

    await user.save();

    await user.populate('wishlist');
    return successResponse(res, {
      message: index > -1 ?
        'Product removed from wishlist'
        :
        'Product added to wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Clear all items from cart
exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    return successResponse(res, {
      message: 'Cart cleared successfully',
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// Clear all items from wishlist
exports.clearWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = [];
    await user.save();

    return successResponse(res, {
      message: 'Wishlist cleared successfully',
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's cart
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    return successResponse(res, {
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    return successResponse(res, {
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Upload user profile image
exports.uploadImage = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      if (!req.file) {
        return errorResponse(res, 'Please upload an image file', 400);
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'user_profiles',
        resource_type: 'auto'
      });

      // Update user's image URL
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { image: result.secure_url },
        { new: true }
      );

      return successResponse(res, {
        message: 'Image uploaded successfully',
        image: result.secure_url,
        user
      });
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth - Step 1: Get authorization URL
exports.googleAuthURL = async (req, res, next) => {
  try {
    const authUrl = getGoogleAuthURL();
    return successResponse(
      res,
      { 
        authUrl,
        message: 'Google OAuth URL generated successfully'
      }
    );
  } catch (error) {
    console.error('Google auth URL error:', error);
    return errorResponse(res, 'Failed to generate Google auth URL', 500);
  }
};

// Google OAuth - Step 2: Handle callback and sign in
exports.googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return errorResponse(res, 'Authorization code is required', 400);
    }

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);
    
    // Get user info from Google
    const googleUserInfo = await getGoogleUserInfo(tokens.access_token);

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: googleUserInfo.email },
        { googleId: googleUserInfo.id }
      ]
    });

    if (user) {
      // Update user with Google data if they don't have googleId
      if (!user.googleId) {
        user.googleId = googleUserInfo.id;
        user.image = googleUserInfo.picture || user.image;
        await user.save();
      }
    } else {
      // Create new user
      console.log("The new google user:" + googleUserInfo);
      user = await User.create({
        name: googleUserInfo.name,
        email: googleUserInfo.email,
        googleId: googleUserInfo.id,
        image: googleUserInfo.picture,
        password: undefined // No password for Google OAuth users
      });
    }

    // Generate JWT token
    const authToken = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    // Redirect to frontend with token (you can customize this)
    const frontendUrl = process.env.CLIENT_URL;
    const redirectUrl = `${frontendUrl}/auth/success?token=${authToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL;
    const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent('Google sign-in failed')}`;
    res.redirect(errorUrl);
  }
};

// Sign Out (client-side token removal)
exports.signOut = async (req, res, next) => {
  try {
    return successResponse(
      res,
      { message: 'Sign out successful.' }
    );
  } catch (error) {
    next(error);
  }
};
