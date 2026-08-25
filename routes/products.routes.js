const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { verify, isAdmin } = require('../middleware/auth');

// Obtener todos los productos
router.get('/', verify, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let filtro = { isActive: true };
    
    if (category) {
      filtro.category = category;
    }
    
    if (search) {
      filtro.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    
    const productos = await Product.find(filtro)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filtro);

    res.json({
      success: true,
      data: productos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// Obtener un producto por ID
router.get('/:id', verify, async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
});

// Crear producto (solo admin)
router.post('/', verify, isAdmin, [
  body('name', 'El nombre es requerido').trim().notEmpty(),
  body('sku', 'El SKU es requerido').trim().notEmpty(),
  body('category', 'La categoría es requerida').notEmpty(),
  body('price', 'El precio debe ser un número positivo').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, sku, description, category, stock, minStock, price, unit, supplier } = req.body;

    // Verificar si el SKU ya existe
    const skuExistente = await Product.findOne({ sku: sku.toUpperCase() });
    if (skuExistente) {
      return res.status(400).json({
        success: false,
        message: 'El SKU ya existe'
      });
    }

    const nuevoProducto = new Product({
      name,
      sku: sku.toUpperCase(),
      description,
      category,
      stock: stock || 0,
      minStock: minStock || 5,
      price,
      unit: unit || 'unidades',
      supplier: supplier || 'No especificado'
    });

    await nuevoProducto.save();

    // Emitir evento en tiempo real
    const io = req.app.get('io');
    io.emit('producto:creado', nuevoProducto);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', verify, isAdmin, async (req, res) => {
  try {
    const { name, description, category, minStock, price, unit, supplier, isActive } = req.body;

    const productoActualizado = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        minStock,
        price,
        unit,
        supplier,
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Emitir evento en tiempo real
    const io = req.app.get('io');
    io.emit('producto:actualizado', productoActualizado);

    res.json({
      success: true,
      message: 'Producto actualizado',
      data: productoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', verify, isAdmin, async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Emitir evento en tiempo real
    const io = req.app.get('io');
    io.emit('producto:eliminado', { id: req.params.id });

    res.json({
      success: true,
      message: 'Producto eliminado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
});

module.exports = router;
