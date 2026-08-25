const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'El código SKU es requerido'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['Electrónica', 'Ropa', 'Alimentos', 'Hogar', 'Otros'],
    default: 'Otros'
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 5,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'unidades',
    enum: ['unidades', 'kg', 'litros', 'metros', 'cajas']
  },
  supplier: {
    type: String,
    default: 'No especificado'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para búsquedas rápidas
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Método virtual para alertas de stock bajo
productSchema.virtual('alertaStock').get(function() {
  return this.stock <= this.minStock;
});

module.exports = mongoose.model('Product', productSchema);
