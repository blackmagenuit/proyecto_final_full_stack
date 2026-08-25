const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['entrada', 'salida'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  reason: {
    type: String,
    default: ''
  },
  supplier: {
    type: String,
    default: 'N/A'
  },
  reference: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para búsquedas y filtrados
movementSchema.index({ product: 1 });
movementSchema.index({ type: 1 });
movementSchema.index({ date: -1 });
movementSchema.index({ user: 1 });

module.exports = mongoose.model('Movement', movementSchema);
