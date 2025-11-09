const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Ensure user is seller
const ensureSeller = (req, res) => {
  if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
    res.status(401).json({ success: false, message: 'Not authorized as seller' });
    return false;
  }
  return true;
};

// GET /api/vendor/orders
// List orders containing products of this vendor
const listVendorOrders = async (req, res) => {
  try {
    if (!ensureSeller(req, res)) {return;}

    const vendorId = req.user._id?.toString();
    const { status, limit = 50, page = 1 } = req.query;

    // Find product IDs for this vendor
    const productIds = await Product.find({ seller: vendorId }).select('_id');
    const pidList = productIds.map(p => p._id);
    if (pidList.length === 0) {
      return res.json({ success: true, data: { orders: [], total: 0, page: Number(page), pages: 0 } });
    }

    const query = { 'orderItems.product': { $in: pidList } };
    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('orderNumber user orderItems shippingAddress status isPaid totalPrice createdAt')
      .populate('user', 'name email')
      .populate('orderItems.product', 'name seller');

    // Filter order items to only this vendor's products
    const filtered = orders.map(o => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      user: o.user,
      status: o.status,
      isPaid: o.isPaid,
      totalPrice: o.totalPrice,
      createdAt: o.createdAt,
      shippingAddress: o.shippingAddress,
      orderItems: o.orderItems.filter(it => (it.product?.seller?.toString?.() || '') === vendorId)
    }));

    return res.json({ success: true, data: { orders: filtered, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error('listVendorOrders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor orders' });
  }
};

// PATCH /api/vendor/orders/:orderId/items/:itemId/status
// Update per-item vendorStatus by seller
const updateItemStatus = async (req, res) => {
  try {
    if (!ensureSeller(req, res)) {return;}
    const vendorId = req.user._id?.toString();
    const { orderId, itemId } = req.params;
    const { status, note } = req.body || {};

    const allowed = ['packaging','dispatched','shipped','out_for_delivery','delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(orderId).populate('orderItems.product', 'seller');
    if (!order) {return res.status(404).json({ success: false, message: 'Order not found' });}

    const item = order.orderItems.id(itemId);
    if (!item) {return res.status(404).json({ success: false, message: 'Order item not found' });}

    // Ensure this item belongs to this vendor
    const itemSeller = item.product?.seller?.toString?.();
    if (itemSeller !== vendorId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    item.vendorStatus = status;
    item.vendorStatusHistory = item.vendorStatusHistory || [];
    item.vendorStatusHistory.push({ status, note, updatedBy: new mongoose.Types.ObjectId(vendorId) });

    // If all items in order are delivered by vendors, mark order delivered
    const allDelivered = order.orderItems.every(it => it.vendorStatus === 'delivered');
    if (allDelivered) {
      order.status = 'delivered';
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (status === 'shipped' && order.status === 'processing') {
      order.status = 'shipped';
    } else if (status === 'out_for_delivery') {
      order.status = 'out_for_delivery';
    } else if (status === 'dispatched' && order.status === 'confirmed') {
      order.status = 'processing';
    }

    await order.save();
    return res.json({ success: true, message: 'Item status updated', data: { orderId, itemId, status } });
  } catch (err) {
    console.error('updateItemStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update item status' });
  }
};

module.exports = { listVendorOrders, updateItemStatus };
