const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/authFallback'); // Use fallback auth
const axios = require('axios');

// Check if MongoDB is available
const isMongoAvailable = () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1; // 1 = connected
  } catch (error) {
    return false;
  }
};

// Mock address storage for fallback mode
let mockAddresses = new Map();

// Get user addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let addresses = [];

    if (isMongoAvailable()) {
      // Try to get user from database
      try {
        const user = await User.findById(userId);
        if (user && user.address && user.address.length > 0) {
          // Transform the simple address array to match frontend Location interface
          addresses = user.address.map((addr, index) => ({
            id: addr._id || `addr_${index}`,
            name: addr.type || 'Address',
            address: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`,
            coordinates: {
              lat: addr.coordinates?.lat || 0,
              lng: addr.coordinates?.lng || 0
            },
            type: addr.type || 'other',
            isDefault: addr.isDefault || false
          }));
        }
        console.log(`✅ Returning ${addresses.length} addresses from MongoDB for user ${req.user.name}`);
      } catch (dbError) {
        console.log('Database error, falling back to mock addresses:', dbError.message);
      }
    }

    // Fallback to mock addresses if MongoDB is not available or user not found
    if (addresses.length === 0) {
      const userAddresses = mockAddresses.get(userId) || [];
      addresses = userAddresses;
      console.log(`✅ Returning ${addresses.length} mock addresses for user ${req.user.name}`);
    }

    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save new address
router.post('/addresses', auth, async (req, res) => {
  try {
    const { name, address, coordinates, type, isDefault } = req.body;
    const userId = req.user.id || req.user._id;

    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' });
    }

    const newAddressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const responseAddress = {
      id: newAddressId,
      name,
      address,
      coordinates: coordinates || { lat: 0, lng: 0 },
      type: type || 'other',
      isDefault: isDefault || false
    };

    if (isMongoAvailable()) {
      // Try to save to MongoDB
      try {
        const user = await User.findById(userId);
        if (user) {
          // If this is set as default, unset other defaults
          if (isDefault) {
            user.address.forEach(addr => {
              addr.isDefault = false;
            });
          }

          // Parse address components (simple parsing)
          const addressParts = address.split(',').map(part => part.trim());
          const newAddress = {
            street: addressParts[0] || address,
            city: addressParts[1] || '',
            state: addressParts[2] || '',
            zipCode: addressParts[3] || '',
            country: addressParts[4] || 'India',
            type: name.toLowerCase(),
            isDefault: isDefault || false,
            coordinates: coordinates || { lat: 0, lng: 0 }
          };

          user.address.push(newAddress);
          await user.save();

          // Return the new address in the expected format
          const savedAddress = user.address[user.address.length - 1];
          responseAddress.id = savedAddress._id;

          console.log(`✅ Address saved to MongoDB for user ${req.user.name}`);
          return res.status(201).json(responseAddress);
        }
      } catch (dbError) {
        console.log('Database error, falling back to mock storage:', dbError.message);
      }
    }

    // Fallback to mock storage
    const userAddresses = mockAddresses.get(userId) || [];

    // If this is set as default, unset other defaults
    if (isDefault) {
      userAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    userAddresses.push(responseAddress);
    mockAddresses.set(userId, userAddresses);

    console.log(`✅ Address saved to mock storage for user ${req.user.name}`);
    res.status(201).json(responseAddress);
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update address
router.put('/addresses/:id', auth, async (req, res) => {
  try {
    const { name, address, coordinates, type, isDefault } = req.body;
    const addressId = req.params.id;
    const userId = req.user.id || req.user._id;

    const updatedAddress = {
      id: addressId,
      name,
      address,
      coordinates: coordinates || { lat: 0, lng: 0 },
      type: type || 'other',
      isDefault: isDefault || false
    };

    if (isMongoAvailable()) {
      // Try to update in MongoDB
      try {
        const user = await User.findById(userId);
        if (user) {
          const addressIndex = user.address.findIndex(addr => addr._id.toString() === addressId);
          if (addressIndex !== -1) {
            // If this is set as default, unset other defaults
            if (isDefault) {
              user.address.forEach(addr => {
                addr.isDefault = false;
              });
            }

            // Update the address
            const addressParts = address.split(',').map(part => part.trim());
            user.address[addressIndex] = {
              ...user.address[addressIndex],
              street: addressParts[0] || address,
              city: addressParts[1] || user.address[addressIndex].city,
              state: addressParts[2] || user.address[addressIndex].state,
              zipCode: addressParts[3] || user.address[addressIndex].zipCode,
              country: addressParts[4] || user.address[addressIndex].country,
              type: name.toLowerCase(),
              isDefault: isDefault || false,
              coordinates: coordinates || user.address[addressIndex].coordinates
            };

            await user.save();
            console.log(`✅ Address updated in MongoDB for user ${req.user.name}`);
            return res.json(updatedAddress);
          }
        }
      } catch (dbError) {
        console.log('Database error, falling back to mock storage:', dbError.message);
      }
    }

    // Fallback to mock storage
    const userAddresses = mockAddresses.get(userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      userAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    userAddresses[addressIndex] = updatedAddress;
    mockAddresses.set(userId, userAddresses);

    console.log(`✅ Address updated in mock storage for user ${req.user.name}`);
    res.json(updatedAddress);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete address
router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id || req.user._id;

    if (isMongoAvailable()) {
      // Try to delete from MongoDB
      try {
        const user = await User.findById(userId);
        if (user) {
          const addressIndex = user.address.findIndex(addr => addr._id.toString() === addressId);
          if (addressIndex !== -1) {
            user.address.splice(addressIndex, 1);
            await user.save();
            console.log(`✅ Address deleted from MongoDB for user ${req.user.name}`);
            return res.json({ message: 'Address deleted successfully' });
          }
        }
      } catch (dbError) {
        console.log('Database error, falling back to mock storage:', dbError.message);
      }
    }

    // Fallback to mock storage
    const userAddresses = mockAddresses.get(userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    userAddresses.splice(addressIndex, 1);
    mockAddresses.set(userId, userAddresses);

    console.log(`✅ Address deleted from mock storage for user ${req.user.name}`);
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Geocoding proxy endpoint (to avoid CSP issues)
router.get('/geocode/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Call Nominatim from backend (no CSP restrictions)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NextTech-App/1.0 (contact@nexttech.com)'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.display_name) {
      res.json({
        address: response.data.display_name,
        components: response.data.address || {}
      });
    } else {
      res.json({
        address: `Location: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`,
        components: {}
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      address: `Location: ${parseFloat(req.query.lat).toFixed(4)}, ${parseFloat(req.query.lng).toFixed(4)}`,
      components: {}
    });
  }
});

module.exports = router;
