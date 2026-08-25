const express = require('express');
const router = express.Router();
const Movement = require('../models/Movement');
const Product = require('../models/Product');
const { verify } = require('../middleware/auth');

// Dashboard con estadísticas generales
router.get('/dashboard', verify, async (req, res) => {
  try {
    const totalProductos = await Product.countDocuments({ isActive: true });
    const productosConBajoStock = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    });

    const totalMovimientos = await Movement.countDocuments();
    const entradasHoy = await Movement.countDocuments({
      type: 'entrada',
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const salidasHoy = await Movement.countDocuments({
      type: 'salida',
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const productosBajoStock = await Product.find(
      { isActive: true, $expr: { $lte: ['$stock', '$minStock'] } },
      { name: 1, sku: 1, stock: 1, minStock: 1 }
    ).limit(10);

    res.json({
      success: true,
      data: {
        totalProductos,
        productosConBajoStock,
        totalMovimientos,
        entradasHoy,
        salidasHoy,
        productosBajoStock
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener dashboard',
      error: error.message
    });
  }
});

// Stock por categoría
router.get('/stock-por-categoria', verify, async (req, res) => {
  try {
    const stockPorCategoria = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalProductos: { $sum: 1 },
          stockTotal: { $sum: '$stock' },
          valorTotal: { $sum: { $multiply: ['$stock', '$price'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: stockPorCategoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener stock por categoría',
      error: error.message
    });
  }
});

// Historial de movimientos por producto
router.get('/historial/:productId', verify, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filtro = { product: req.params.productId };

    if (startDate || endDate) {
      filtro.date = {};
      if (startDate) filtro.date.$gte = new Date(startDate);
      if (endDate) {
        const fin = new Date(endDate);
        fin.setHours(23, 59, 59, 999);
        filtro.date.$lte = fin;
      }
    }

    const movimientos = await Movement.find(filtro)
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: movimientos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
});

// Reporte de movimientos por período
router.get('/movimientos-periodo', verify, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas de inicio y fin son requeridas'
      });
    }

    let filtro = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    };

    if (type) {
      filtro.type = type;
    }

    const movimientos = await Movement.find(filtro)
      .populate('product', 'name sku category')
      .populate('user', 'name email')
      .sort({ date: -1 });

    const resumen = await Movement.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$type',
          cantidad: { $sum: '$quantity' },
          totalMovimientos: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        movimientos,
        resumen
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
});

// Productos con alertas de stock bajo
router.get('/alertas/bajo-stock', verify, async (req, res) => {
  try {
    const productosAlerta = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    }).sort({ stock: 1 });

    res.json({
      success: true,
      data: productosAlerta,
      cantidad: productosAlerta.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

module.exports = router;
