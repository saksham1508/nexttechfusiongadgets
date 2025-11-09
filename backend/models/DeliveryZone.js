const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  coordinates: {
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    radius: { type: Number, required: true } // in kilometers
  },
  deliveryTime: {
    min: { type: Number, default: 10 }, // in minutes
    max: { type: Number, default: 15 }
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  freeDeliveryThreshold: {
    type: Number,
    default: 999
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    start: { type: String, default: '06:00' },
    end: { type: String, default: '23:00' }
  },
  maxOrdersPerHour: {
    type: Number,
    default: 100
  },
  currentLoad: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
deliveryZoneSchema.index({ 'coordinates.center': '2dsphere' });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
