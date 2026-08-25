const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Movement = require('../models/Movement');
const Product = require('../models/Product');
const { verify } = require('../middleware/auth');

// Obtener todos los movimientos
router.get('/', verify, async (req, res) => {
  try {
    const { type, productId, page = 1, limit = 20, startDate, endDate } = req.query;

    let filtro = {};

    if (type) {
      filtro.type = type;
    }

    if (productId) {
      filtro.product = productId;
    }

    if (startDate || endDate) {
      filtro.date = {};
      if (startDate) filtro.date.$gte = new Date(startDate);
      if (endDate) {
        const fin = new Date(endDate);
        fin.setHours(23, 59, 59, 999);
        filtro.date.$lte = fin;
      }
    }

    const skip = (page - 1) * limit;

    const movimientos = await Movement.find(filtro)
      .populate('product', 'name sku category')
      .populate('user', 'name email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ date: -1 });

    const total = await Movement.countDocuments(filtro);

    res.json({
      success: true,
      data: movimientos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
});

// Registrar entrada de producto
router.post('/entrada', verify, [
  body('productId', 'El ID del producto es requerido').notEmpty(),
  body('quantity', 'La cantidad debe ser mayor a 0').isInt({ min: 1 }),
  body('supplier', 'El proveedor es requerido').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, quantity, supplier, reference, notes } = req.body;

    // Obtener producto
    const producto = await Product.findById(productId);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const stockAnterior = producto.stock;
    const nuevoStock = stockAnterior + parseInt(quantity);

    // Actualizar stock del producto
    await Product.findByIdAndUpdate(
      productId,
      { stock: nuevoStock, updatedAt: new Date() }
    );

    // Registrar movimiento
    const movimiento = new Movement({
      type: 'entrada',
      product: productId,
      quantity: parseInt(quantity),
      supplier,
      reference: reference || '',
      user: req.user._id,
      stockBefore: stockAnterior,
      stockAfter: nuevoStock,
      notes: notes || '',
      date: new Date()
    });

    await movimiento.save();
    await movimiento.populate('product user');

    // Emitir evento en tiempo real
    const io = req.app.get('io');
    io.emit('stock:actualizado', {
      productId,
      stockAnterior,
      stockNuevo: nuevoStock,
      type: 'entrada'
    });

    res.status(201).json({
      success: true,
      message: 'Entrada registrada exitosamente',
      data: movimiento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar entrada',
      error: error.message
    });
  }
});

// Registrar salida de producto
router.post('/salida', verify, [
  body('productId', 'El ID del producto es requerido').notEmpty(),
  body('quantity', 'La cantidad debe ser mayor a 0').isInt({ min: 1 }),
  body('reason', 'El motivo es requerido').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, quantity, reason, reference, notes } = req.body;

    // Obtener producto
    const producto = await Product.findById(productId);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const stockAnterior = producto.stock;
    const cantidadSalida = parseInt(quantity);

    // Verificar stock disponible
    if (stockAnterior < cantidadSalida) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${stockAnterior}`
      });
    }

    const nuevoStock = stockAnterior - cantidadSalida;

    // Actualizar stock del producto
    await Product.findByIdAndUpdate(
      productId,
      { stock: nuevoStock, updatedAt: new Date() }
    );

    // Registrar movimiento
    const movimiento = new Movement({
      type: 'salida',
      product: productId,
      quantity: cantidadSalida,
      reason,
      reference: reference || '',
      user: req.user._id,
      stockBefore: stockAnterior,
      stockAfter: nuevoStock,
      notes: notes || '',
      date: new Date()
    });

    await movimiento.save();
    await movimiento.populate('product user');

    // Emitir evento en tiempo real
    const io = req.app.get('io');
    io.emit('stock:actualizado', {
      productId,
      stockAnterior,
      stockNuevo: nuevoStock,
      type: 'salida'
    });

    res.status(201).json({
      success: true,
      message: 'Salida registrada exitosamente',
      data: movimiento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar salida',
      error: error.message
    });
  }
});

module.exports = router;
