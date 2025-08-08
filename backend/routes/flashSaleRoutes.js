const express = require('express');
const router = express.Router();
const FlashSale = require('../models/FlashSale');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Get active flash sales
router.get('/active', async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    })
      .populate('products.product')
      .sort({ priority: -1, startTime: 1 });

    // Transform data for frontend
    const transformedSales = flashSales.map(sale => ({
      id: sale._id,
      title: sale.title,
      description: sale.description,
      endTime: sale.endTime,
      products: sale.products.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        image: item.product.images[0]?.url || '/placeholder-image.jpg',
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        discount: item.discount,
        stock: item.maxQuantity - item.soldQuantity,
        sold: item.soldQuantity,
        rating: item.product.rating || 4.5,
        reviews: item.product.numReviews || 0
      }))
    }));

    res.json(transformedSales);
  } catch (error) {
    console.error('Flash sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flash sale by ID
router.get('/:id', async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id).populate('products.product');

    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    res.json(flashSale);
  } catch (error) {
    console.error('Flash sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create flash sale (admin)
router.post('/', auth, async (req, res) => {
  try {
    const flashSale = new FlashSale(req.body);
    await flashSale.save();
    res.status(201).json(flashSale);
  } catch (error) {
    console.error('Create flash sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update flash sale (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const flashSale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    res.json(flashSale);
  } catch (error) {
    console.error('Update flash sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product sold quantity
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    const productIndex = flashSale.products.findIndex(p => p.product.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in flash sale' });
    }

    const product = flashSale.products[productIndex];

    // Check availability
    if (product.soldQuantity + quantity > product.maxQuantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Update sold quantity
    flashSale.products[productIndex].soldQuantity += quantity;
    await flashSale.save();

    res.json({ message: 'Purchase recorded successfully' });
  } catch (error) {
    console.error('Flash sale purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming flash sales
router.get('/upcoming/list', async (req, res) => {
  try {
    const now = new Date();
    const upcomingSales = await FlashSale.find({
      isActive: true,
      startTime: { $gt: now }
    })
      .populate('products.product', 'name images')
      .sort({ startTime: 1 })
      .limit(5);

    res.json(upcomingSales);
  } catch (error) {
    console.error('Upcoming flash sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
