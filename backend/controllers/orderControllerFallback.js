// Fallback (mock) order controller for development without strict Mongo dependencies
// Stores orders in-memory so flows work with mock tokens and non-ObjectId product IDs

const crypto = require('crypto');

// In-memory store
const mockOrders = [];

// Helpers
const nowISO = () => new Date().toISOString();
const randomId = () => crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

// Normalize incoming order item to a simple structure
function normalizeItem(item) {
  return {
    // Keep original provided product id as string for traceability
    product: String(item.product || item.productId || item.id || randomId()),
    name: String(item.name || 'Product'),
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    image: (item.image && (item.image.url || item.image)) || undefined
  };
}

function buildOrderNumber() {
  const ts = Date.now().toString();
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${ts}-${rnd}`;
}

// POST /api/orders
async function addOrderItems(req, res) {
  try {
    const {
      orderItems = [],
      shippingAddress = {},
      paymentMethod = 'cod',
      taxPrice = 0,
      shippingPrice = 0,
      totalPrice = 0,
      couponCode,
      discountAmount = 0,
      notes
    } = req.body || {};

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Normalize items; skip stock checks in mock
    const items = orderItems.map(normalizeItem);

    const order = {
      _id: randomId(),
      orderNumber: buildOrderNumber(),
      user: String(req.user?._id || 'mock_user'),
      orderItems: items,
      shippingAddress: {
        street: shippingAddress.street || 'N/A',
        city: shippingAddress.city || 'N/A',
        state: shippingAddress.state || 'N/A',
        zipCode: shippingAddress.zipCode || '000000',
        country: shippingAddress.country || 'N/A'
      },
      paymentMethod: String(paymentMethod),
      paymentProvider: String(paymentMethod).toLowerCase(),
      taxPrice: Number(taxPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice: Number(totalPrice) || items.reduce((s, it) => s + it.price * it.quantity, 0),
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode || undefined,
      isPaid: String(paymentMethod).toLowerCase() !== 'cod',
      paidAt: String(paymentMethod).toLowerCase() !== 'cod' ? nowISO() : undefined,
      isDelivered: false,
      status: 'pending',
      notes: notes || undefined,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    mockOrders.push(order);

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to create order (mock)' });
  }
}

// GET /api/orders/myorders
async function getMyOrders(req, res) {
  try {
    const userId = String(req.user?._id || '');
    const orders = mockOrders
      .filter(o => String(o.user) === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch orders (mock)' });
  }
}

// GET /api/orders/:id
async function getOrderById(req, res) {
  try {
    const order = mockOrders.find(o => String(o._id) === String(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch order (mock)' });
  }
}

// PUT /api/orders/:id/pay
async function updateOrderToPaid(req, res) {
  try {
    const order = mockOrders.find(o => String(o._id) === String(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isPaid = true;
    order.paidAt = nowISO();
    order.status = 'processing';
    order.paymentResult = {
      id: req.body?.id,
      status: req.body?.status || 'paid',
      update_time: nowISO(),
      email_address: req.body?.email_address
    };
    order.updatedAt = nowISO();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update payment (mock)' });
  }
}

// GET /api/orders (admin)
async function getOrders(req, res) {
  try {
    const orders = [...mockOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch all orders (mock)' });
  }
}

// PUT /api/orders/:id/deliver (admin)
async function updateOrderToDelivered(req, res) {
  try {
    const order = mockOrders.find(o => String(o._id) === String(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isDelivered = true;
    order.deliveredAt = nowISO();
    order.status = 'delivered';
    order.updatedAt = nowISO();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update delivery (mock)' });
  }
}

// POST /api/orders/create-payment-intent
async function createPaymentIntent(req, res) {
  try {
    const { amount = 0 } = req.body || {};
    // Return a mock client secret
    return res.json({ clientSecret: `mock_client_secret_${amount}_${Date.now()}` });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to create payment intent (mock)' });
  }
}

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  createPaymentIntent,
  // Provide a mock tracker to keep the route stable in dev
  trackOrder: async (req, res) => {
    const orderId = req.params.id;
    return res.json({
      orderId,
      status: 'in_transit',
      timeline: [
        { status: 'confirmed', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { status: 'preparing', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
        { status: 'picked_up', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
        { status: 'in_transit', timestamp: new Date().toISOString() }
      ],
      etaMinutes: 12
    });
  }
};