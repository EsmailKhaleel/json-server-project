const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Please provide products' });
    }

    const lineItems = products.map(product => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name || 'Product',
          images: product.images || [],
          description: product.description,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.amount
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession
}; 