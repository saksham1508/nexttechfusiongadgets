const express = require('express');
const router = express.Router();
const DeliveryZone = require('../models/DeliveryZone');
const { auth } = require('../middleware/auth');

// Check delivery availability
router.post('/check', async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    // Find delivery zones that cover this location
    const zones = await DeliveryZone.find({
      isActive: true,
      $expr: {
        $lte: [
          {
            $sqrt: {
              $add: [
                { $pow: [{ $subtract: ['$coordinates.center.lat', coordinates.lat] }, 2] },
                { $pow: [{ $subtract: ['$coordinates.center.lng', coordinates.lng] }, 2] }
              ]
            }
          },
          { $divide: ['$coordinates.radius', 111] } // Convert km to degrees (approximate)
        ]
      }
    });

    if (zones.length === 0) {
      return res.json({
        available: false,
        message: 'Delivery not available in your area',
        estimatedTime: null,
        deliveryFee: null
      });
    }

    // Get the best zone (lowest delivery time)
    const bestZone = zones.reduce((best, current) =>
      current.deliveryTime.min < best.deliveryTime.min ? current : best
    );

    // Check current load
    const isOverloaded = bestZone.currentLoad >= bestZone.maxOrdersPerHour;
    const estimatedTime = isOverloaded ?
      bestZone.deliveryTime.max + 10 :
      bestZone.deliveryTime.min;

    res.json({
      available: true,
      estimatedTime,
      deliveryFee: bestZone.deliveryFee,
      freeDeliveryThreshold: bestZone.freeDeliveryThreshold,
      zone: {
        name: bestZone.name,
        city: bestZone.city
      }
    });

  } catch (error) {
    console.error('Delivery check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get delivery slots
router.get('/slots', auth, async (req, res) => {
  try {
    const { addressId } = req.query;

    // Mock delivery slots for now
    const now = new Date();
    const slots = [];

    // Generate slots for next 3 days
    for (let day = 0; day < 3; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);

      // Generate time slots
      const timeSlots = [
        { start: '09:00', end: '12:00', label: 'Morning' },
        { start: '12:00', end: '15:00', label: 'Afternoon' },
        { start: '15:00', end: '18:00', label: 'Evening' },
        { start: '18:00', end: '21:00', label: 'Night' }
      ];

      timeSlots.forEach((slot, index) => {
        slots.push({
          id: `${day}-${index}`,
          date: date.toISOString().split('T')[0],
          startTime: slot.start,
          endTime: slot.end,
          label: slot.label,
          available: Math.random() > 0.3, // 70% availability
          price: day === 0 ? 0 : 29 // Free for same day, ₹29 for future days
        });
      });
    }

    res.json(slots);

  } catch (error) {
    console.error('Delivery slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get delivery zones (admin)
router.get('/zones', auth, async (req, res) => {
  try {
    const zones = await DeliveryZone.find().sort({ city: 1, name: 1 });
    res.json(zones);
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create delivery zone (admin)
router.post('/zones', auth, async (req, res) => {
  try {
    const zone = new DeliveryZone(req.body);
    await zone.save();
    res.status(201).json(zone);
  } catch (error) {
    console.error('Create zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery zone (admin)
router.put('/zones/:id', auth, async (req, res) => {
  try {
    const zone = await DeliveryZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    res.json(zone);
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
