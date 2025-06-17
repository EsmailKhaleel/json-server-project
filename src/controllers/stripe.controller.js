const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/product.model');
const Order = require('../models/order.model');

const createCheckoutSession = async (req, res, next) => {
  try {
    const { products, userId, email } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Please provide products' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch product details from database
    const productIds = products.map(p => p.id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== products.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // Calculate order total and prepare line items
    const lineItems = products.map(product => {
      const dbProduct = dbProducts.find(p => p._id.toString() === product.id);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbProduct.name,
            images: dbProduct.images || [dbProduct.image],
            description: dbProduct.description,
          },
          unit_amount: Math.round(dbProduct.price * 100),
        },
        quantity: product.amount
      };
    });

    // Calculate total amount
    const totalAmount = dbProducts.reduce((sum, product) => {
      const orderedProduct = products.find(p => p.id === product._id.toString());
      return sum + (product.price * orderedProduct.amount);
    }, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',      
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart?canceled=true`,
      metadata: {
        userId,
        products: JSON.stringify(products),
        totalAmount: totalAmount.toString()
      },
      customer_email: email
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, products, totalAmount } = session.metadata;
      const parsedProducts = JSON.parse(products);

      // Fetch product details from database
      const productIds = parsedProducts.map(p => p.id);
      const dbProducts = await Product.find({ _id: { $in: productIds } });

      // Create order
      const order = await Order.create({
        userId,
        paymentIntentId: session.payment_intent,
        products: parsedProducts.map(product => {
          const dbProduct = dbProducts.find(p => p._id.toString() === product.id);
          return {
            productId: product.id,
            quantity: product.amount,
            price: dbProduct.price,
            name: dbProduct.name,
            image: dbProduct.image || (dbProduct.images && dbProduct.images[0])
          };
        }),
        totalAmount: parseFloat(totalAmount),
        status: 'processing',
        shippingAddress: session.shipping_details || {},
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        createdAt: new Date()
      });

      // Clear user's cart after successful order
      await User.findByIdAndUpdate(userId, { cart: [] });

      // Update product stock/inventory if needed
      for (const product of parsedProducts) {
        const dbProduct = dbProducts.find(p => p._id.toString() === product.id);
        if (dbProduct && dbProduct.stock) {
          await Product.findByIdAndUpdate(product.id, {
            $inc: { stock: -product.amount }
          });
        }
      }

      return res.json({ received: true, order });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook
}
