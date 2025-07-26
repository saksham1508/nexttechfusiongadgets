// AI Inventory Management Routes
const express = require('express');
const router = express.Router();
const aiInventoryService = require('../services/aiInventoryService');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { rateLimits } = require('../middleware/validation');
const cacheOptimizer = require('../services/cacheOptimizer');

// Apply rate limiting
router.use(rateLimits.api);

// @desc    Get demand forecast for a product
// @route   GET /api/ai-inventory/forecast/:productId
// @access  Private (Admin)
router.get('/forecast/:productId', auth, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;
    
    const forecast = await aiInventoryService.getDemandForecast(productId, parseInt(days));
    
    if (!forecast.success) {
      return res.status(404).json({
        success: false,
        message: forecast.message
      });
    }

    res.json({
      success: true,
      data: {
        productId,
        forecastDays: parseInt(days),
        forecast: forecast.data,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating demand forecast',
      error: error.message
    });
  }
});

// @desc    Check reorder status for a product
// @route   GET /api/ai-inventory/reorder-status/:productId
// @access  Private (Admin)
router.get('/reorder-status/:productId', auth, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reorderStatus = await aiInventoryService.checkReorderStatus(productId);
    
    res.json({
      success: true,
      data: {
        productId,
        ...reorderStatus,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Reorder status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking reorder status',
      error: error.message
    });
  }
});

// @desc    Get inventory performance analysis
// @route   GET /api/ai-inventory/performance
// @access  Private (Admin)
router.get('/performance', auth, adminAuth, async (req, res) => {
  try {
    const cacheKey = 'ai_inventory:performance_analysis';
    let analysis = await cacheOptimizer.get(cacheKey);
    
    if (!analysis) {
      analysis = await aiInventoryService.analyzeInventoryPerformance();
      await cacheOptimizer.set(cacheKey, analysis, 1800); // Cache for 30 minutes
    }

    res.json({
      success: true,
      data: {
        ...analysis,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing inventory performance',
      error: error.message
    });
  }
});

// @desc    Get AI-generated purchase orders
// @route   GET /api/ai-inventory/purchase-orders
// @access  Private (Admin)
router.get('/purchase-orders', auth, adminAuth, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const query = { aiGenerated: true };
    if (status !== 'all') {
      query.status = status;
    }

    const orders = await PurchaseOrder.find(query)
      .populate('productId', 'name category price images')
      .populate('approvedBy', 'name email')
      .sort({ orderDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PurchaseOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase orders',
      error: error.message
    });
  }
});

// @desc    Generate automated purchase orders
// @route   POST /api/ai-inventory/generate-orders
// @access  Private (Admin)
router.post('/generate-orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await aiInventoryService.generateAutomatedOrders();
    
    res.json({
      success: true,
      data: {
        ordersGenerated: orders.length,
        orders,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Generate orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating automated orders',
      error: error.message
    });
  }
});

// @desc    Approve AI-generated purchase order
// @route   PUT /api/ai-inventory/purchase-orders/:orderId/approve
// @access  Private (Admin)
router.put('/purchase-orders/:orderId/approve', auth, adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;
    
    const order = await PurchaseOrder.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be approved in current status'
      });
    }

    await order.approve(req.user._id);
    
    if (notes) {
      order.notes.push({
        user: req.user._id,
        message: notes
      });
      await order.save();
    }

    // Update product's auto-reorder status if needed
    await Product.findByIdAndUpdate(order.productId, {
      lastReorderDate: new Date(),
      $inc: { reorderCount: 1 }
    });

    res.json({
      success: true,
      message: 'Purchase order approved successfully',
      data: order
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving purchase order',
      error: error.message
    });
  }
});

// @desc    Reject AI-generated purchase order
// @route   PUT /api/ai-inventory/purchase-orders/:orderId/reject
// @access  Private (Admin)
router.put('/purchase-orders/:orderId/reject', auth, adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await PurchaseOrder.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await order.cancel(req.user._id, reason || 'Rejected by admin');

    res.json({
      success: true,
      message: 'Purchase order rejected successfully',
      data: order
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting purchase order',
      error: error.message
    });
  }
});

// @desc    Get inventory alerts
// @route   GET /api/ai-inventory/alerts
// @access  Private (Admin)
router.get('/alerts', auth, adminAuth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const alerts = aiInventoryService.getInventoryAlerts(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
        unreadCount: alerts.filter(alert => !alert.read).length
      }
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory alerts',
      error: error.message
    });
  }
});

// @desc    Get inventory dashboard data
// @route   GET /api/ai-inventory/dashboard
// @access  Private (Admin)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const cacheKey = 'ai_inventory:dashboard';
    let dashboardData = await cacheOptimizer.get(cacheKey);
    
    if (!dashboardData) {
      // Get various metrics for dashboard
      const [
        totalProducts,
        lowStockProducts,
        pendingOrders,
        overdueOrders,
        recentAlerts,
        performanceAnalysis
      ] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: true, countInStock: { $lt: 10 } }),
        PurchaseOrder.countDocuments({ aiGenerated: true, status: 'pending' }),
        PurchaseOrder.getOverdueOrders(),
        aiInventoryService.getInventoryAlerts(5),
        aiInventoryService.analyzeInventoryPerformance()
      ]);

      // Get top products by forecast accuracy
      const topPerformingProducts = await Product.aggregate([
        { $match: { isActive: true } },
        { $sort: { salesCount: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: 1,
            category: 1,
            countInStock: 1,
            salesCount: 1,
            price: 1
          }
        }
      ]);

      // Get inventory value by category
      const inventoryByCategory = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalValue: { $sum: { $multiply: ['$price', '$countInStock'] } },
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$countInStock' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      dashboardData = {
        summary: {
          totalProducts,
          lowStockProducts,
          pendingOrders,
          overdueOrders: overdueOrders.length,
          forecastAccuracy: performanceAnalysis.forecastAccuracy,
          stockoutRisk: performanceAnalysis.stockoutRisk.length
        },
        alerts: recentAlerts,
        topPerformingProducts,
        inventoryByCategory,
        recommendations: performanceAnalysis.recommendations.slice(0, 5),
        generatedAt: new Date().toISOString()
      };

      await cacheOptimizer.set(cacheKey, dashboardData, 900); // Cache for 15 minutes
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// @desc    Update product auto-reorder settings
// @route   PUT /api/ai-inventory/products/:productId/auto-reorder
// @access  Private (Admin)
router.put('/products/:productId/auto-reorder', auth, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { autoReorder, minStock, maxStock, leadTime } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        autoReorder: autoReorder !== undefined ? autoReorder : true,
        minStock: minStock || 10,
        maxStock: maxStock || 100,
        leadTime: leadTime || 7
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Recalculate reorder points for this product
    await aiInventoryService.calculateReorderPoints();

    res.json({
      success: true,
      message: 'Auto-reorder settings updated successfully',
      data: {
        productId,
        autoReorder: product.autoReorder,
        minStock: product.minStock,
        maxStock: product.maxStock,
        leadTime: product.leadTime
      }
    });
  } catch (error) {
    console.error('Update auto-reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating auto-reorder settings',
      error: error.message
    });
  }
});

// @desc    Get supplier performance metrics
// @route   GET /api/ai-inventory/suppliers/performance
// @access  Private (Admin)
router.get('/suppliers/performance', auth, adminAuth, async (req, res) => {
  try {
    const { supplier } = req.query;
    
    let performance;
    if (supplier) {
      performance = await PurchaseOrder.getSupplierPerformance(supplier);
    } else {
      // Get all suppliers performance
      performance = await PurchaseOrder.aggregate([
        { $match: { status: 'delivered' } },
        {
          $group: {
            _id: '$supplier.name',
            totalOrders: { $sum: 1 },
            avgLeadTime: { $avg: '$metrics.leadTime' },
            avgDeliveryAccuracy: { $avg: '$metrics.deliveryAccuracy' },
            avgQualityScore: { $avg: '$metrics.qualityScore' },
            totalValue: { $sum: '$totalCost' },
            lastOrder: { $max: '$orderDate' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);
    }

    res.json({
      success: true,
      data: {
        suppliers: performance,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Supplier performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier performance',
      error: error.message
    });
  }
});

// @desc    Get inventory insights and trends
// @route   GET /api/ai-inventory/insights
// @access  Private (Admin)
router.get('/insights', auth, adminAuth, async (req, res) => {
  try {
    const cacheKey = 'ai_inventory:insights';
    let insights = await cacheOptimizer.get(cacheKey);
    
    if (!insights) {
      const [
        inventoryInsights,
        seasonalTrends,
        categoryPerformance
      ] = await Promise.all([
        PurchaseOrder.getInventoryInsights(),
        aiInventoryService.getSeasonalTrends(),
        aiInventoryService.getCategoryPerformance()
      ]);

      insights = {
        inventoryInsights,
        seasonalTrends,
        categoryPerformance,
        generatedAt: new Date().toISOString()
      };

      await cacheOptimizer.set(cacheKey, insights, 3600); // Cache for 1 hour
    }

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory insights',
      error: error.message
    });
  }
});

// @desc    Retrain AI models
// @route   POST /api/ai-inventory/retrain
// @access  Private (Admin)
router.post('/retrain', auth, adminAuth, async (req, res) => {
  try {
    // This is a heavy operation, so we'll run it asynchronously
    setImmediate(async () => {
      try {
        await aiInventoryService.initializeAIModels();
        console.log('AI models retrained successfully');
      } catch (error) {
        console.error('Model retraining failed:', error);
      }
    });

    res.json({
      success: true,
      message: 'AI model retraining initiated',
      data: {
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      }
    });
  } catch (error) {
    console.error('Retrain error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating model retraining',
      error: error.message
    });
  }
});

module.exports = router;