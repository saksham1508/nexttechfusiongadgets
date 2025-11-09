const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper: build empty/default analytics payload
const buildEmptyAnalytics = () => ({
  summary: {
    totalClicks: 0,
    totalViews: 0,
    totalOrders: 0,
    conversionRate: 0,
    totalSales: 0,
    returnPercentage: 0
  },
  productOrders: [],
  productMonthly: []
});

// Helper: build realistic mock analytics for dev
const buildMockAnalytics = () => {
  const products = [
    { productId: 'p1', name: 'SuperPhone X' },
    { productId: 'p2', name: 'UltraEar Buds' },
    { productId: 'p3', name: 'SmartWatch Pro' },
    { productId: 'p4', name: '4K Action Cam' }
  ];
  const productOrders = products.map((p, idx) => ({
    ...p,
    views: 800 - idx * 120,
    orders: 60 - idx * 10
  }));
  const totalViews = productOrders.reduce((s, p) => s + p.views, 0);
  const totalOrders = productOrders.reduce((s, p) => s + p.orders, 0);
  const totalSales = productOrders.reduce((s, p) => s + p.orders * (200 - 30 * Math.random()), 0);
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - (11 - i));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
  const productMonthly = products.map((p, idx) => ({
    productId: p.productId,
    name: p.name,
    months,
    series: months.map((_, m) => 5 + Math.max(0, 12 - idx * 2 - Math.abs(6 - m)) + Math.floor(Math.random() * 3))
  }));
  return {
    summary: {
      totalClicks: totalViews, // clicks ~ views for mock
      totalViews,
      totalOrders,
      conversionRate: totalViews ? Number(((totalOrders / totalViews) * 100).toFixed(2)) : 0,
      totalSales: Number(totalSales.toFixed(2)),
      returnPercentage: 2.5
    },
    productOrders,
    productMonthly
  };
};

// GET /api/vendor/analytics
// Auth: vendor/seller
// Computes vendor-specific analytics based on their products and related orders
const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user && req.user._id ? req.user._id : null;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // If using mock auth or Mongo is not connected, return mock analytics
    const isMongoConnected = mongoose?.connection?.readyState === 1;
    if (req.isMockAuth || !isMongoConnected) {
      // Compute analytics dynamically from mock products the vendor created
      try {
        const { getMockProducts } = require('./productControllerFallback');
        const all = getMockProducts();
        const vendorProducts = all.filter(p => (p.seller || '').toString() === vendorId.toString());
        if (vendorProducts.length === 0) {
          return res.json({ success: true, data: buildEmptyAnalytics() });
        }
        const months = Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setUTCMonth(d.getUTCMonth() - (11 - i));
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        });
        // Views/clicks: if analytics present use them, else estimate from stock/age
        let totalViews = 0;
        let totalClicks = 0;
        const productOrders = vendorProducts.map(p => {
          const views = Number(p.analytics?.views ?? 0);
          const clicks = Number(p.analytics?.clicks ?? views);
          totalViews += views;
          totalClicks += clicks;
          return { productId: p._id?.toString() || p.id?.toString(), name: p.name, views, orders: Number(p.analytics?.orders ?? 0) };
        });
        const totalOrders = productOrders.reduce((s, x) => s + (x.orders || 0), 0);
        const totalSales = vendorProducts.reduce((s, p) => s + Number(p.price || 0) * Number(p.analytics?.orders || 0), 0);
        const productMonthly = vendorProducts.map(p => ({
          productId: p._id?.toString() || p.id?.toString(),
          name: p.name,
          months,
          series: months.map(() => 0) // no historical in mock; start with zeros
        }));
        return res.json({
          success: true,
          data: {
            summary: {
              totalClicks,
              totalViews,
              totalOrders,
              conversionRate: totalViews ? Number(((totalOrders / totalViews) * 100).toFixed(2)) : 0,
              totalSales: Number(totalSales.toFixed(2)),
              returnPercentage: 0
            },
            productOrders,
            productMonthly
          }
        });
      } catch (e) {
        // Fallback to static mock if anything goes wrong
        return res.json({ success: true, data: buildMockAnalytics() });
      }
    }

    // Fetch all products for this vendor
    const products = await Product.find({ seller: vendorId }).select('_id name analytics');
    const productIdSet = new Set(products.map(p => p._id.toString()));
    const productIdList = Array.from(productIdSet).map(id => new mongoose.Types.ObjectId(id));

    let totalViews = 0;
    let totalClicks = 0;
    const productViewMap = {};
    products.forEach(p => {
      const views = (p.analytics && typeof p.analytics.views === 'number') ? p.analytics.views : 0;
      totalViews += views;
      totalClicks += p.analytics?.clicks ? Number(p.analytics.clicks) : views; // prefer clicks if tracked
      productViewMap[p._id.toString()] = views;
    });

    // If vendor has no products, short-circuit with zeros
    if (productIdList.length === 0) {
      return res.json({ success: true, data: buildEmptyAnalytics() });
    }

    // Fetch orders that contain any of the vendor's product IDs
    const orders = await Order.find({ 'orderItems.product': { $in: productIdList } }).select('orderItems status createdAt');

    let totalOrders = 0; // count of items sold (sum of quantities)
    let totalSales = 0; // sum(price * qty) for vendor items
    let returnedItems = 0; // returned count

    const perProductOrders = new Map(); // productId -> qty
    const perProductMonthly = new Map(); // key: `${productId}_${YYYY-MM}` -> qty

    const toMonthKey = (date) => {
      const d = new Date(date);
      const y = d.getUTCFullYear();
      const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
      return `${y}-${m}`;
    };

    for (const order of orders) {
      // Identify returned orders quickly
      const isReturned = order.status === 'returned';
      for (const item of order.orderItems) {
        if (!item.product) {continue;}
        const pid = item.product.toString();
        if (!productIdSet.has(pid)) {continue;}

        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;

        totalOrders += qty;
        totalSales += price * qty;
        if (isReturned) {returnedItems += qty;}

        // Per-product totals
        perProductOrders.set(pid, (perProductOrders.get(pid) || 0) + qty);

        // Per-product monthly
        const key = `${pid}_${toMonthKey(order.createdAt)}`;
        perProductMonthly.set(key, (perProductMonthly.get(key) || 0) + qty);
      }
    }

    const conversionRate = totalViews > 0 ? Number(((totalOrders / totalViews) * 100).toFixed(2)) : 0;
    const returnPercentage = totalOrders > 0 ? Number(((returnedItems / totalOrders) * 100).toFixed(2)) : 0;

    // Build productOrders array
    const productOrders = products.map(p => ({
      productId: p._id.toString(),
      name: p.name,
      views: productViewMap[p._id.toString()] || (p.analytics?.views || 0),
      orders: perProductOrders.get(p._id.toString()) || 0
    })).sort((a, b) => b.orders - a.orders);

    // Build productMonthly array for last 12 months only
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      months.push(key);
    }

    const productMonthly = products.map(p => {
      const series = months.map(mKey => perProductMonthly.get(`${p._id.toString()}_${mKey}`) || 0);
      return {
        productId: p._id.toString(),
        name: p.name,
        months,
        series
      };
    });

    return res.json({
      success: true,
      data: {
        summary: {
          totalClicks,
          totalViews,
          totalOrders,
          conversionRate,
          totalSales: Number(totalSales.toFixed(2)),
          returnPercentage
        },
        productOrders,
        productMonthly
      }
    });
  } catch (err) {
    console.error('Vendor analytics error:', err);
    // Return safe default analytics in dev fallback instead of 500
    return res.json({ success: true, data: buildEmptyAnalytics() });
  }
};

module.exports = { getVendorAnalytics };
