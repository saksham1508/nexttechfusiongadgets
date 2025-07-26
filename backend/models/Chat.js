const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    enum: ['product_search', 'order_inquiry', 'technical_support', 'general_question', 'complaint'],
    default: 'general_question'
  },
  category: {
    type: String,
    default: 'general'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  requiresHuman: {
    type: Boolean,
    default: false
  },
  satisfaction: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ sessionId: 1, createdAt: -1 });
chatSchema.index({ user: 1, createdAt: -1 });
chatSchema.index({ intent: 1, urgency: 1 });

module.exports = mongoose.model('Chat', chatSchema);